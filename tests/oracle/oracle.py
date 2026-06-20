#!/usr/bin/env python3
"""Ground-truth oracle for the JS formatting engine.

Enumerates representative (style, format-string, record) cases and computes the
*real* output of Python's ``logging.Formatter`` for each, writing them to
``src/engine/__tests__/fixtures/oracle.json``. The Vitest conformance suite
replays the identical inputs through the TS engine and asserts equality (or that
the engine raises where Python does).

Pins ``TZ=UTC`` so ``asctime`` is deterministic and matches the engine, which
computes dates in UTC. Run via ``npm run test:oracle`` (or directly with
``python3``); CI regenerates this and diffs it to catch drift.

Stdlib only — no third-party dependencies.
"""

from __future__ import annotations

import itertools
import json
import logging
import os
import sys
import time
from pathlib import Path

os.environ["TZ"] = "UTC"
time.tzset()

REPO_ROOT = Path(__file__).resolve().parents[2]
LOGS_PATH = REPO_ROOT / "src" / "assets" / "logs.json"
OUT_PATH = REPO_ROOT / "src" / "engine" / "__tests__" / "fixtures" / "oracle.json"

# Representative token per intrinsic kind. These are real LogRecord attributes
# (so the TS parser accepts them) whose value the engine reads straight from the
# record, letting us exercise arbitrary values per kind.
TOKEN = {"str": "name", "int": "lineno", "float": "created"}


def compute(style: str, fmt: str, overrides: dict, datefmt: str | None):
    """Return ('value', str) on success or ('error', ExcName) if Python raises."""
    try:
        formatter = logging.Formatter(fmt, datefmt, style=style)
        record = logging.makeLogRecord(overrides)
        return ("value", formatter.format(record))
    except Exception as exc:  # noqa: BLE001 - we mirror whatever Python raises
        return ("error", type(exc).__name__)


def case(cases: list, style: str, fmt: str, overrides: dict, datefmt: str | None = None):
    kind, payload = compute(style, fmt, overrides, datefmt)
    entry = {"style": style, "fmt": fmt, "record": overrides}
    if datefmt is not None:
        entry["datefmt"] = datefmt
    entry[kind if kind == "error" else "expected"] = payload
    cases.append(entry)


def gen_percent_field_cases(cases: list) -> None:
    # --- strings ---
    str_token = TOKEN["str"]
    str_values = ["INFO", "it's", "a\tb", "longwordhere"]
    for val, flag, width, prec, conv in itertools.product(
        str_values, ["", "-"], ["", "5", "10"], ["", ".3"], ["s", "r"]
    ):
        fmt = f"%({str_token}){flag}{width}{prec}{conv}"
        case(cases, "%", fmt, {str_token: val})

    # --- integers ---
    int_token = TOKEN["int"]
    int_values = [0, 5, 42, 255, -7]
    for val, flag, width, prec, conv in itertools.product(
        int_values, ["", "-", "0", "+", " ", "#"], ["", "6"], ["", ".0", ".4"], ["d", "x", "X", "o"]
    ):
        fmt = f"%({int_token}){flag}{width}{prec}{conv}"
        case(cases, "%", fmt, {int_token: val})

    # --- floats ---
    float_token = TOKEN["float"]
    # Values + precisions chosen to avoid exact-half ties (round-half-even in
    # Python vs round-half-away in JS toFixed), which are out of scope.
    float_values = [0.0, 3.14159, 855.0, 48.94661903381348, -2.5]
    for val, flag, width, prec, conv in itertools.product(
        float_values, ["", "-", "0", "+", " ", "#"], ["", "12"], ["", ".2", ".6"], ["f", "e", "g"]
    ):
        fmt = f"%({float_token}){flag}{width}{prec}{conv}"
        case(cases, "%", fmt, {float_token: val})

    # A large timestamp-like value across a few specs.
    for spec in ["f", ".2f", "e", ".3e", "g", "20.4f"]:
        case(cases, "%", f"%({float_token}){spec}", {float_token: 1679087032.8551009})


def gen_percent_error_cases(cases: list) -> None:
    # Numeric conversion on a string value -> TypeError in Python.
    case(cases, "%", "%(name)d", {"name": "INFO"})
    # Integer-only conversion on a float value -> TypeError.
    case(cases, "%", "%(created)x", {"created": 1.5})


def gen_brace_field_cases(cases: list) -> None:
    # --- strings ---
    str_token = TOKEN["str"]
    str_values = ["INFO", "it's", "a\tb", "longword"]
    str_specs = ["", "8", "<8", ">8", "^8", "*<8", ".3", "8.3", "s", "<8s"]
    for val, spec in itertools.product(str_values, str_specs):
        case(cases, "{", "{%s:%s}" % (str_token, spec), {str_token: val})
    for val, conv, spec in itertools.product(str_values, ["r", "s", "a"], ["", "8", ".3"]):
        suffix = ":" + spec if spec else ""
        case(cases, "{", "{%s!%s%s}" % (str_token, conv, suffix), {str_token: val})

    # --- integers ---
    int_token = TOKEN["int"]
    int_values = [0, 5, 255, -7]
    int_specs_no_type = ["", "6", "06", "<6", ">6", "^6", "*>6", "+", "+06", " 6", "#", "#06"]
    for val, spec, typ in itertools.product(int_values, int_specs_no_type, ["d", "x", "X", "o", "b"]):
        case(cases, "{", "{%s:%s%s}" % (int_token, spec, typ), {int_token: val})
    for val, spec in itertools.product(int_values, [",d", "+,d", "06,d"]):
        case(cases, "{", "{%s:%s}" % (int_token, spec), {int_token: val})
    # Bare {name} (no spec).
    for val in int_values:
        case(cases, "{", "{%s}" % int_token, {int_token: val})

    # --- floats ---
    float_token = TOKEN["float"]
    float_values = [0.0, 3.14159, 855.0, 48.94661903381348, -2.5]
    float_specs = [
        "", "12", "012", "<12", ">12", "^12", "*>12", "+", "+012", " ", "#",
        ".2", ".6", "12.2", "+012.3",
    ]
    for val, spec, typ in itertools.product(float_values, float_specs, ["f", "e", "g", "%"]):
        case(cases, "{", "{%s:%s%s}" % (float_token, spec, typ), {float_token: val})
    # Grouping only with f / g (comma is rejected for e and %).
    for val, spec in itertools.product(float_values, [",.2f", "+,.2f", ",g"]):
        case(cases, "{", "{%s:%s}" % (float_token, spec), {float_token: val})
    # Bare {name} (str(float)).
    for val in float_values:
        case(cases, "{", "{%s}" % float_token, {float_token: val})


def gen_brace_error_cases(cases: list) -> None:
    case(cases, "{", "{name:d}", {"name": "INFO"})  # numeric type on str
    case(cases, "{", "{created:d}", {"created": 1.5})  # int type on float
    case(cases, "{", "{lineno:s}", {"lineno": 5})  # string type on int
    case(cases, "{", "{lineno:.2d}", {"lineno": 5})  # precision on integer type


# A few realistic end-to-end format strings, run against the shipped sample rows.
PRESET_FMTS = [
    "[%(asctime)s] [%(levelname)s] %(filename)s::%(lineno)s %(message)s",
    "%(asctime)s [pid %(process)d] %(levelname)-8s %(module)s.%(funcName)s():%(lineno)d %(message)s",
    "%(levelname)s - %(asctime)-15s - %(filename)s - line %(lineno)d --> %(message)s",
    "%(levelname)s %(asctime)-20s: %(message)s",
    "%(levelname)s:%(name)s:%(message)s",
    "%(created).2f %(relativeCreated)08.2f %(msecs)03d %(message)s",
]
PRESET_DATEFMTS = [None, "%Y/%m/%d %H:%M:%S", "%H:%M:%S", "%a %b %d"]


def gen_template_field_cases(cases: list) -> None:
    # $-style substitutes str(value); both $name and ${name} forms.
    for kind, token in TOKEN.items():
        values = {
            "str": ["INFO", "it's", "longword"],
            "int": [0, 5, -7],
            "float": [0.0, 855.0, 3.14159, -2.5],
        }[kind]
        for val in values:
            case(cases, "$", f"${token}", {token: val})
            case(cases, "$", "${%s}" % token, {token: val})
            case(cases, "$", "prefix ${%s} suffix" % token, {token: val})
    # $$ escapes to a literal $.
    case(cases, "$", "100$$ ${name}", {"name": "done"})


TEMPLATE_PRESET_FMTS = [
    "$asctime $levelname $name $message",
    "${levelname}:${name}:${message}",
    "$asctime [$process] $levelname $module.$funcName:$lineno $message",
]


BRACE_PRESET_FMTS = [
    "[{asctime}] [{levelname}] {filename}::{lineno} {message}",
    "{asctime} [pid {process}] {levelname:<8} {module}.{funcName}():{lineno} {message}",
    "{levelname} {asctime}: {message}",
    "{levelname}:{name}:{message}",
    "{created:.2f} {relativeCreated:08.2f} {msecs:03.0f} {message}",
]


def gen_end_to_end_cases(cases: list, rows: list) -> None:
    for row in rows:
        # `Formatter.format` derives `record.message` from `msg % args`, ignoring
        # any stored `message` attribute. The sample rows carry the already-
        # rendered text in `message`, so feed it as `msg` (with empty args) to
        # reproduce a real logger's output.
        overrides = {**row, "msg": row.get("message", ""), "args": ()}
        for datefmt in PRESET_DATEFMTS:
            for fmt in PRESET_FMTS:
                case(cases, "%", fmt, overrides, datefmt)
            for fmt in BRACE_PRESET_FMTS:
                case(cases, "{", fmt, overrides, datefmt)
            for fmt in TEMPLATE_PRESET_FMTS:
                case(cases, "$", fmt, overrides, datefmt)


def main() -> None:
    rows = json.loads(LOGS_PATH.read_text())
    cases: list = []

    gen_percent_field_cases(cases)
    gen_percent_error_cases(cases)
    gen_brace_field_cases(cases)
    gen_brace_error_cases(cases)
    gen_template_field_cases(cases)
    gen_end_to_end_cases(cases, rows)

    for i, c in enumerate(cases):
        c["id"] = i

    payload = {
        "python": f"{sys.version_info.major}.{sys.version_info.minor}",
        "tz": "UTC",
        "cases": cases,
    }
    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUT_PATH.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n")
    print(f"Wrote {len(cases)} cases to {OUT_PATH.relative_to(REPO_ROOT)}", file=sys.stderr)


if __name__ == "__main__":
    main()
