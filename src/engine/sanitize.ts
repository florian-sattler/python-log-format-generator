/**
 * Drop the parts of a {@link FieldSpec} that a target {@link Style} cannot
 * express, while keeping everything that still applies.
 *
 * Used when the user switches style in the UI: rather than wiping all
 * formatting, we keep width/precision/sign/etc. and remove only the
 * incompatible bits (e.g. `fill`/grouping moving to `%`, a `b` conversion that
 * doesn't exist in the target style). This keeps the serialized output valid
 * and the preview from raising.
 */

import type { FieldSpec, Style } from './types';
import { BRACE_CONVS, PERCENT_CONVS } from './spec/conversions';

/** Return a copy of `spec` with everything the target style can't express removed. */
export function sanitizeSpec(spec: FieldSpec, style: Style): FieldSpec {
  // $-style (string.Template) carries no formatting at all.
  if (style === '$') return {};

  const out: FieldSpec = { ...spec };

  if (style === '%') {
    // %-style has no fill, grouping or !conversion, and can only express
    // left-justification (the '-' flag); other alignments are not representable.
    delete out.fill;
    delete out.grouping;
    delete out.convert;
    if (out.align && out.align !== '<') delete out.align;
    if (out.conv && !PERCENT_CONVS.has(out.conv)) delete out.conv;
  } else {
    // {}-style: drop a conversion that isn't a valid presentation type
    // (e.g. the %-only 'r'/'a'); !conversion is carried separately in `convert`.
    if (out.conv && !BRACE_CONVS.has(out.conv)) delete out.conv;
  }

  return out;
}
