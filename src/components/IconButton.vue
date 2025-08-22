<script setup lang="ts">
withDefaults(
  defineProps<{
    as?: string
  }>(),
  {
    as: 'button',
  },
)
</script>

<template>
  <component
    :is="as"
    class="flex items-center justify-center dark:bg-neutral-900 rounded-full w-9 h-9 flex-none hover:bg-neutral-200 dark:hover:bg-neutral-800"
  >
    <slot />
  </component>
</template>
