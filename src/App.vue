<template>
  <router-view />
</template>

<script setup lang="ts"></script>

<style lang="scss" scoped>
a {
  display: inline-block;
  margin: $margin;
  text-decoration: none;
  color: $primary-color;

  &:hover {
    text-decoration: underline;
  }
}
</style>
