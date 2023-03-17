<script setup lang="ts">
import { type EditResult, type FormatItem, EditType } from '@/interfaces/internal';
import { ref } from 'vue';
import TrashFill from '@/icons/TrashFill.vue';

const open = ref<boolean>(false);
const textinput = ref<HTMLElement | null>(null);
const btnsubmit = ref<HTMLElement | null>(null);
const itemExists = ref<boolean>(false);
const item = ref<FormatItem>({ description: '', value: '', type: 'string' });
const resolvePromise = ref<undefined | ((value: EditResult) => void)>(undefined);

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
    resolvePromise.value?.({ type: result, payload: { ...item.value, padding: 0 } });
  }
};

const show = (exists: boolean, inputItem: FormatItem): Promise<EditResult> => {
  document.addEventListener('keydown', keyHandler);

  itemExists.value = exists;
  open.value = true;
  item.value = { ...inputItem };

  window.setTimeout(() => (inputItem.type === 'usertext' ? textinput : btnsubmit).value?.focus(), 50);

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
      <template v-if="item.type === 'usertext'">
        <h3>Textfield <TrashFill v-if="itemExists" @click="closeModal(EditType.Delete)" /></h3>
        <input type="text" v-model="item.value" ref="textinput" @keydown.enter="closeModal(EditType.Submit)" />
      </template>
      <template v-else>
        <h3>{{ item.value }} <TrashFill v-if="itemExists" @click="closeModal(EditType.Delete)" /></h3>
        <p>
          <code>Type: {{ item.type }}</code>
        </p>
        <p>{{ item.description }}</p>
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
  & > article {
    min-width: 400px;
  }

  h3 {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;

    & > svg {
      color: var(--del-color);
    }
  }

  footer {
    display: grid;
    gap: 1rem;
    grid-template-columns: min-content min-content;
    justify-content: end;
  }
}
</style>
