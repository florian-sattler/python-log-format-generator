<script setup lang="ts">
import { type EditResult, EditType, type FormattedItem, type Style } from '@/interfaces/internal';
import { computed, reactive, ref } from 'vue';
import { serialize } from '@/engine/serialize';
import IconTrashFill from '@/icons/IconTrashFill.vue';

const open = ref<boolean>(false);
const textinput = ref<HTMLElement | null>(null);
const btnsubmit = ref<HTMLElement | null>(null);
const itemExists = ref<boolean>(false);
const currentStyle = ref<Style>('%');
const item = ref<FormattedItem>({ description: '', value: '', isText: true, kind: 'str', spec: {} });

// Spec editor is driven by string form fields, assembled back into item.spec on submit.
const form = reactive({
  conv: '',
  convert: '',
  width: '',
  precision: '',
  align: '',
  sign: '',
  fill: '',
  grouping: '',
  zero: false,
  alt: false,
});

const resolvePromise = ref<undefined | ((value: EditResult) => void)>(undefined);

const isNumeric = computed(() => item.value.kind === 'int' || item.value.kind === 'float');

// Conversion characters offered for the current style + value kind.
const convOptions = computed<string[]>(() => {
  const k = item.value.kind;
  if (currentStyle.value === '%') {
    if (k === 'str') return ['s', 'r', 'a'];
    if (k === 'int') return ['d', 'x', 'X', 'o'];
    return ['f', 'e', 'g', 'E', 'G'];
  }
  // '{' style ('' = default formatting)
  if (k === 'str') return ['', 's'];
  if (k === 'int') return ['', 'd', 'x', 'X', 'o', 'b'];
  return ['', 'f', 'e', 'g', 'E', 'G', '%'];
});

const alignOptions = computed(() => {
  if (currentStyle.value !== '{') {
    return [
      { v: '', l: 'default' },
      { v: '<', l: 'left (-)' },
    ];
  }
  const opts = [
    { v: '', l: 'default' },
    { v: '<', l: 'left <' },
    { v: '>', l: 'right >' },
    { v: '^', l: 'center ^' },
  ];
  // '=' (sign-aware padding) is only valid for numbers; Python rejects it for strings.
  if (isNumeric.value) opts.push({ v: '=', l: 'pad-after-sign =' });
  return opts;
});

// Precision is invalid on {}-style integer types; otherwise allowed.
const showPrecision = computed(
  () => currentStyle.value !== '$' && !(currentStyle.value === '{' && item.value.kind === 'int'),
);

function loadForm(spec: FormattedItem['spec']) {
  form.conv = spec.conv ?? '';
  form.convert = spec.convert ?? '';
  form.width = spec.width !== undefined ? String(spec.width) : '';
  form.precision = spec.precision !== undefined ? String(spec.precision) : '';
  form.align = spec.align ?? '';
  form.sign = spec.sign ?? '';
  form.fill = spec.fill ?? '';
  form.grouping = spec.grouping ?? '';
  form.zero = !!spec.zero;
  form.alt = !!spec.alt;
}

function buildSpec(): FormattedItem['spec'] {
  const spec: FormattedItem['spec'] = {};
  if (currentStyle.value === '$') return spec;

  if (form.conv) spec.conv = form.conv;
  if (currentStyle.value === '{' && form.convert) spec.convert = form.convert as 'r' | 's' | 'a';
  if (currentStyle.value === '{' && form.fill) spec.fill = form.fill[0];
  if (form.align) spec.align = form.align as NonNullable<FormattedItem['spec']['align']>;
  if (isNumeric.value && form.sign) spec.sign = form.sign as NonNullable<FormattedItem['spec']['sign']>;
  if (isNumeric.value && form.alt) spec.alt = true;
  if (isNumeric.value && form.zero) spec.zero = true;
  if (currentStyle.value === '{' && isNumeric.value && form.grouping) {
    spec.grouping = form.grouping as ',' | '_';
  }
  const w = parseInt(form.width, 10);
  if (!Number.isNaN(w)) spec.width = w;
  if (showPrecision.value) {
    const p = parseInt(form.precision, 10);
    if (!Number.isNaN(p)) spec.precision = p;
  }
  return spec;
}

// Live preview of the serialized field (e.g. "%(levelname)-8s").
const preview = computed(() => {
  if (item.value.isText) return '';
  try {
    return serialize([{ ...item.value, spec: buildSpec() }], currentStyle.value);
  } catch {
    return '';
  }
});

const keyHandler = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && open.value) {
    closeModal(EditType.Cancle);
  }
};

const closeModal = (result: EditType) => {
  document.removeEventListener('keydown', keyHandler);
  open.value = false;

  if (result !== EditType.Submit) {
    resolvePromise.value?.({ type: result, payload: null });
  } else {
    resolvePromise.value?.({ type: result, payload: { ...item.value, spec: buildSpec() } });
  }
};

const show = (exists: boolean, inputItem: FormattedItem, style: Style): Promise<EditResult> => {
  document.addEventListener('keydown', keyHandler);

  itemExists.value = exists;
  currentStyle.value = style;
  open.value = true;
  item.value = { ...inputItem };
  loadForm(inputItem.spec);

  window.setTimeout(() => (inputItem.isText ? textinput : btnsubmit).value?.focus(), 50);

  return new Promise((resolve) => {
    resolvePromise.value = resolve;
  });
};

defineExpose({ show });
</script>

<template>
  <dialog :open="open" @click.self="closeModal(EditType.Cancle)" class="item-dialog">
    <article>
      <a href="#" aria-label="Close" class="close" @click="closeModal(EditType.Cancle)"></a>
      <template v-if="item.isText">
        <h3>Custom Text <IconTrashFill v-if="itemExists" @click="closeModal(EditType.Delete)" /></h3>
        <input type="text" v-model="item.value" ref="textinput" @keydown.enter="closeModal(EditType.Submit)" />
        <p>Add any custom text.</p>
      </template>
      <template v-else>
        <h3>{{ item.value }} <IconTrashFill v-if="itemExists" @click="closeModal(EditType.Delete)" /></h3>
        <p><code>Type: {{ item.kind }}</code></p>
        <p>{{ item.description }}</p>

        <p v-if="currentStyle === '$'"><em>The $-style (string.Template) has no formatting options.</em></p>

        <div v-else class="spec-grid">
          <label>
            Conversion
            <select v-model="form.conv">
              <option v-for="c in convOptions" :key="'c' + c" :value="c">{{ c === '' ? '(default)' : c }}</option>
            </select>
          </label>

          <label v-if="currentStyle === '{'">
            !conversion
            <select v-model="form.convert">
              <option value="">(none)</option>
              <option value="r">!r (repr)</option>
              <option value="s">!s (str)</option>
              <option value="a">!a (ascii)</option>
            </select>
          </label>

          <label>
            Width
            <input type="number" min="0" v-model="form.width" />
          </label>

          <label v-if="showPrecision">
            Precision
            <input type="number" min="0" v-model="form.precision" />
          </label>

          <label>
            Align
            <select v-model="form.align">
              <option v-for="a in alignOptions" :key="'a' + a.v" :value="a.v">{{ a.l }}</option>
            </select>
          </label>

          <label v-if="isNumeric">
            Sign
            <select v-model="form.sign">
              <option value="">default (-)</option>
              <option value="+">+ always</option>
              <option value=" ">space</option>
            </select>
          </label>

          <label v-if="currentStyle === '{'">
            Fill
            <input type="text" maxlength="1" v-model="form.fill" />
          </label>

          <label v-if="currentStyle === '{' && isNumeric">
            Grouping
            <select v-model="form.grouping">
              <option value="">(none)</option>
              <option value=",">, comma</option>
              <option value="_">_ underscore</option>
            </select>
          </label>

          <label v-if="isNumeric" class="checkbox">
            <input type="checkbox" v-model="form.zero" /> Zero-pad (0)
          </label>

          <label v-if="isNumeric" class="checkbox">
            <input type="checkbox" v-model="form.alt" /> Alternate form (#)
          </label>
        </div>

        <p v-if="preview" class="preview"><code>{{ preview }}</code></p>
      </template>
      <footer>
        <button class="secondary" @click="closeModal(EditType.Cancle)">Cancel</button>
        <button @click="closeModal(EditType.Submit)" ref="btnsubmit">{{ itemExists ? 'Update' : 'Add' }}</button>
      </footer>
    </article>
  </dialog>
</template>

<style lang="scss">
.item-dialog {
  position: absolute;

  h3 {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;

    & > svg {
      color: var(--del-color);
    }
  }

  .spec-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem 1rem;

    label {
      font-size: 0.85em;
      margin: 0;
    }

    input,
    select {
      margin-bottom: 0;
    }

    .checkbox {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
  }

  .preview {
    margin-top: 1rem;
  }

  footer {
    display: grid;
    gap: 1rem;
    grid-template-columns: min-content min-content;
    justify-content: end;
  }
}
</style>
