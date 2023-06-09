<script setup lang="ts">
import { ref, computed } from 'vue';
import Header from '@/components/Header.vue';
import ItemDialog from '@/components/ItemDialog.vue';
import { EditType, type TemplateItem, type FormattedItem } from '@/interfaces/internal';
import { parseFormat } from '@/parsing';
import { templateItems, textItems } from '@/items';
import { presets } from '@/presets';
import logs from '@/assets/logs.json';

const itemDialogComponent = ref<InstanceType<typeof ItemDialog>>();

const selectedItems = ref<FormattedItem[]>([]);

const addText = async (text: string, description: string) => {
  let item: FormattedItem = { description: description, value: text, padding: 0, type: 'usertext' };

  if (text == 'custom text') {
    const formatted = await itemDialogComponent.value?.show(false, item);
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
  selectedItems.value.push({ description: item.description, padding: 0, type: item.type, value: name });
  copyState.value = 0;
};

const updateItem = async (index: number) => {
  const item = selectedItems.value[index];
  if (!item) return;

  const reformatted = await itemDialogComponent.value?.show(true, item);

  if (reformatted && reformatted.type === EditType.Delete) {
    selectedItems.value.splice(index, 1);
    copyState.value = 0;
    return;
  }

  if (!reformatted || !reformatted.payload || reformatted.type === EditType.Cancle) return;

  selectedItems.value[index] = reformatted.payload;
  copyState.value = 0;
};

const resultText = computed<string>(() => {
  return selectedItems.value
    .map((item) => {
      switch (item.type) {
        case 'string':
          return `%(${item.value})s`;
        case 'float':
          return `%(${item.value})f`;
        case 'integer':
          return `%(${item.value})d`;
        default:
          return item.value;
      }
    })
    .join('');
});

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

  selectedItems.value = parseFormat(preset.format);
};
</script>

<template>
  <Header />
  <div class="config-area">
    <nav>
      <h2>Configuration</h2>
      <ul>
        <li role="list" dir="rtl" data-tooltip="Select a preset" class="select-preset">
          <a href="#" aria-haspopup="listbox">Presets</a>
          <ul role="listbox">
            <li v-for="(preset, i) in presets" :key="i" @click="setPreset(i)">
              <a href="#">{{ preset.title }}</a>
            </li>
          </ul>
        </li>
      </ul>
    </nav>
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
        :class="item.type == 'usertext' ? 'outline' : ''"
      >
        <template v-if="item.type == 'usertext'">"{{ item.value }}"</template>
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
  </div>
  <div class="example-area">
    <h2>Examples</h2>
    <pre v-if="selectedItems.length"><code v-for="(line, i) in logs" :key="i"><template v-for="item in selectedItems">{{
          item.type === 'usertext' ? item.value : (line as any)[item.value]
        }}</template></code></pre>
  </div>
  <ItemDialog ref="itemDialogComponent" />
</template>

<style lang="scss">
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
      max-width: 300px;
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
