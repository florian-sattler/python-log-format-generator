<script setup lang="ts">
import { ref, computed } from 'vue';
import Header from '@/components/Header.vue';
import ItemDialog from '@/components/ItemDialog.vue';
import { EditType, type FormatItem, type FormatItemFormatted } from '@/interfaces/internal';
import attributes_raw from '@/assets/attributes.json';

const attributes: FormatItem[] = [
  ...attributes_raw,
  { value: 'custom text', description: 'Custom Text.', type: 'usertext' },
  { value: ' ', description: 'Space.', type: 'usertext' },
  { value: '|', description: 'Vertical pipe.', type: 'usertext' },
  { value: '[', description: 'Open bracket.', type: 'usertext' },
  { value: ']', description: 'Close bracket.', type: 'usertext' },
];

const itemDialogComponent = ref<InstanceType<typeof ItemDialog>>();

const items = ref<FormatItemFormatted[]>([]);

const addItem = async (item: FormatItem) => {
  if (item.type == 'usertext' && item.value !== 'custom text') {
    items.value.push({ ...item, padding: 0 });
    return;
  }

  const formatted = await itemDialogComponent.value?.show(false, item);
  if (formatted?.type === EditType.Submit && formatted.payload) items.value.push(formatted.payload);
};

const updateItem = async (index: number) => {
  const item = items.value[index];
  if (!item) return;

  const reformatted = await itemDialogComponent.value?.show(true, item);

  if (reformatted && reformatted.type === EditType.Delete) {
    items.value.splice(index, 1);
    return;
  }

  if (!reformatted || !reformatted.payload || reformatted.type === EditType.Cancle) return;

  items.value[index] = reformatted.payload;
};

const resultText = computed<string>(() => {
  return items.value
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
</script>

<template>
  <Header />
  <div class="config-area">
    <h2>Configuration</h2>

    <p>Select from all available tokens or add custom text:</p>

    <p class="buttons">
      <button
        v-for="item in attributes"
        :key="item.value"
        :data-tooltip="item.description"
        @click="addItem(item)"
        :class="item.type == 'usertext' ? 'outline' : ''"
      >
        <template v-if="item.type == 'usertext'">"{{ item.value }}"</template>
        <template v-else>{{ item.value }}</template>
      </button>
    </p>

    <p>Click on added items to update or delete them.</p>

    <p class="prompt buttons">
      <button
        v-for="(item, i) in items"
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
      <button>Copy</button>
    </div>
  </div>
  <div class="example-area">
    <h2>Examples</h2>
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
</style>