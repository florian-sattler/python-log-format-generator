<script setup lang="ts">
import LightBulb from '@/icons/LightBulb.vue'
import CardText from '@/icons/CardText.vue'
import Github from '@/icons/Github.vue'

const toggleTheme = () => {
  document.documentElement.dataset['theme'] =
    document.documentElement.dataset['theme'] == 'light' ? 'dark' : 'light'
}
</script>

<template>
  <header>
    <nav>
      <ul>
        <li><strong>Python Log Format Generator</strong></li>
      </ul>
      <ul>
        <li>
          <a href="#">Reference <CardText /></a>
        </li>
        <li>
          <a href="#">Github <Github /></a>
        </li>
        <li>
          <a href="#" role="button" @click="toggleTheme"><LightBulb /></a>
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
