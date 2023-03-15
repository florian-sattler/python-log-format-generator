<script setup lang="ts">
import Github from '@/icons/Github.vue';
import LightBulb from '@/icons/LightBulb.vue';
import LightBulbFill from '@/icons/LightBulbFill.vue';
import useConfig from '@/stores/config';

const configStore = useConfig();
</script>

<template>
  <header>
    <nav>
      <ul>
        <li><strong>Python Log Format Generator</strong></li>
      </ul>
      <ul>
        <li>
          <a href="#">Github <Github /></a>
        </li>
        <li>
          <a href="#" role="button" @click="configStore.toggleTheme()">
            <LightBulbFill v-if="configStore.darkTheme" />
            <LightBulb v-else />
          </a>
        </li>
      </ul>
    </nav>
  </header>
</template>

<style lang="scss">
header > nav > ul > li > a {
  display: flex;
  align-items: center;
  gap: 0.25em;
}
</style>
