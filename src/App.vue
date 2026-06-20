<script setup lang="ts">
import { ref, computed } from 'vue';
import Header from '@/components/PageHeader.vue';
import ItemDialog from '@/components/ItemDialog.vue';
import { EditType, type TemplateItem, type FormattedItem, type Style } from '@/interfaces/internal';
import { parseFormat } from '@/engine/parse';
import { serialize } from '@/engine/serialize';
import { renderRecord } from '@/engine/render';
import { sanitizeSpec } from '@/engine/sanitize';
import { templateItems, textItems } from '@/items';
import { presets } from '@/presets';
import logs from '@/assets/logs.json';

const itemDialogComponent = ref<InstanceType<typeof ItemDialog>>();

const selectedItems = ref<FormattedItem[]>([]);
const style = ref<Style>('%');
const datefmt = ref<string>('');

const addText = async (text: string, description: string) => {
  let item: FormattedItem = { description: description, value: text, isText: true, kind: 'str', spec: {} };

  if (text == 'custom text') {
    const formatted = await itemDialogComponent.value?.show(false, item, style.value);
    if (formatted?.type === EditType.Submit && formatted.payload) {
      item = formatted.payload;
    } else {
      return;
    }
  }

  selectedItems.value.push(item);
  copyState.value = 0;
};

const addItem = async (name: string, item: TemplateItem) => {
  selectedItems.value.push({ description: item.description, value: name, isText: false, kind: item.kind, spec: {} });
  copyState.value = 0;
};

const updateItem = async (index: number) => {
  const item = selectedItems.value[index];
  if (!item) return;

  const reformatted = await itemDialogComponent.value?.show(true, item, style.value);

  if (reformatted && reformatted.type === EditType.Delete) {
    selectedItems.value.splice(index, 1);
    copyState.value = 0;
    return;
  }

  if (!reformatted || !reformatted.payload || reformatted.type === EditType.Cancle) return;

  selectedItems.value[index] = reformatted.payload;
  copyState.value = 0;
};

const resultText = computed<string>(() => serialize(selectedItems.value, style.value));

const styles: { value: Style; label: string }[] = [
  { value: '%', label: '%-style' },
  { value: '{', label: '{}-format' },
  { value: '$', label: '$-template' },
];

// When the user switches style, keep each field's formatting but drop the parts
// the new style can't express (e.g. a binary conversion when moving to %), so the
// output stays valid. Programmatic changes (preset loads) don't fire @change.
const onStyleChange = () => {
  for (const item of selectedItems.value) {
    item.spec = sanitizeSpec(item.spec, style.value);
  }
  copyState.value = 0;
};

// The Python snippet to copy: a Formatter with the matching style (and datefmt).
const formatterCode = computed<string>(() => {
  const args = [`fmt=${JSON.stringify(resultText.value)}`];
  if (datefmt.value) args.push(`datefmt=${JSON.stringify(datefmt.value)}`);
  if (style.value !== '%') args.push(`style=${JSON.stringify(style.value)}`);
  return `logging.Formatter(${args.join(', ')})`;
});

// Render one sample record, surfacing any Python-equivalent error inline.
const renderLine = (record: Record<string, unknown>): string => {
  try {
    return renderRecord(selectedItems.value, record, style.value, datefmt.value || undefined);
  } catch (e) {
    return `⚠ ${e instanceof Error ? e.message : String(e)}`;
  }
};

// copy format
const copyState = ref<number>(0);

const copyText = computed<string>(() => (copyState.value === 0 ? 'Copy' : copyState.value > 0 ? 'Copied' : 'Error'));

const copyResult = () => {
  navigator.clipboard
    .writeText(resultText.value)
    .then(() => (copyState.value = 1))
    .catch(() => (copyState.value = -1));
};

const setPreset = (index: number) => {
  let preset = presets[index];
  if (!preset) {
    return;
  }

  style.value = preset.style;
  selectedItems.value = parseFormat(preset.format, preset.style);
};
</script>

<template>
  <Header />
  <div>
    <p>
      Welcome to the Python Log Format Generator! This web application provides a user-friendly interface for generating
      format strings for <a href="https://docs.python.org/3/library/logging.html">Python logging</a>. To get started,
      simply select presets or start from scratch to create your desired log format.
    </p>
    <p>
      Once you're satisfied, copy the generated format string to the clipboard and integrate it into your Python
      projects seamlessly. Happy logging!
    </p>
  </div>
  <div class="config-area">
    <nav>
      <h2>Configuration</h2>
      <ul>
        <li
          role="list"
          dir="rtl"
          data-tooltip="Select a preset or start from scratch"
          data-placement="left"
          class="select-preset"
          aria-label="Select a preset or start from scratch"
        >
          <a href="#" aria-haspopup="listbox">Presets</a>
          <ul role="listbox">
            <li v-for="(preset, i) in presets" :key="i" @click="setPreset(i)">
              <a href="#">{{ preset.title }}</a>
            </li>
          </ul>
        </li>
      </ul>
    </nav>
    <div class="grid style-row">
      <label>
        Style
        <select v-model="style" @change="onStyleChange">
          <option v-for="s in styles" :key="s.value" :value="s.value">{{ s.label }}</option>
        </select>
      </label>
      <label>
        datefmt (for asctime, optional)
        <input type="text" v-model="datefmt" placeholder="e.g. %Y-%m-%d %H:%M:%S" />
      </label>
    </div>

    <p>Select from all available tokens or add custom text:</p>

    <p class="buttons">
      <button
        v-for="(item, name) in templateItems"
        :key="name"
        :data-tooltip="item.description"
        @click="addItem(name as string, item)"
      >
        {{ name }}
      </button>
      <button
        v-for="(item, id) in textItems"
        :key="'t-' + id"
        :data-tooltip="item.description"
        @click="addText(item.text, item.description)"
        class="usertext"
      >
        "{{ item.text }}"
      </button>
    </p>

    <p v-if="selectedItems.length">Click on added items to update or delete them.</p>

    <p class="prompt buttons" v-if="selectedItems.length">
      <button
        v-for="(item, i) in selectedItems"
        :key="item.value"
        :data-tooltip="item.description"
        @click="updateItem(i)"
        class="contrast"
        :class="item.isText ? 'outline' : ''"
      >
        <template v-if="item.isText">"{{ item.value }}"</template>
        <template v-else>{{ item.value }}</template>
      </button>
    </p>
  </div>
  <div class="output-area">
    <h2>Result</h2>
    <div class="code">
      <pre><code>format="{{ resultText }}"</code></pre>
      <button @click="copyResult" data-tooltip="Copy to clipboard">{{ copyText }}</button>
    </div>
    <pre><code>{{ formatterCode }}</code></pre>
  </div>
  <div class="example-area">
    <h2>Example Logs</h2>
    <pre v-if="selectedItems.length"><code v-for="(line, i) in logs" :key="i">{{ renderLine(line) }}</code></pre>
  </div>
  <ItemDialog ref="itemDialogComponent" />
</template>

<style lang="scss">
// Disable tooltips on small devices.
@media screen and (max-width: 576px) {
  [data-tooltip]::before,
  [data-tooltip]::after {
    display: none !important;
  }
}

.config-area,
.output-area,
.example-area {
  h2 {
    --typography-spacing-vertical: 0.75rem;
  }
}

.config-area {
  .select-preset {
    cursor: pointer;
    border: unset;
  }
  .style-row {
    margin-bottom: var(--spacing);
    label {
      font-size: 0.9em;
    }
  }
  .buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;

    button {
      width: max-content;
      margin: 0;
      --form-element-spacing-vertical: 0;
    }

    [data-tooltip]::before {
      white-space: unset;
      max-width: min(300px, 40vw);
      width: max-content;
    }
  }
}

.output-area .code {
  display: grid;
  grid-template-columns: auto min-content;
  grid-template-rows: auto;
  align-items: start;
  gap: 1rem;

  pre {
    margin-bottom: 0;
  }
}

.example-area {
  pre {
    display: flex;
    flex-direction: column;
    padding: var(--spacing);
  }
  code {
    padding: 0 0.3rem;
    display: block;
    line-height: 2;

    &:nth-child(even) {
      --grad-color: 0 0 0;
      background: linear-gradient(90deg, rgba(var(--grad-color) / 0.1), rgba(var(--grad-color) / 0) 80%);
    }
    [data-theme='dark'] &:nth-child(even) {
      --grad-color: 255 255 255;
    }
  }
}
</style>
