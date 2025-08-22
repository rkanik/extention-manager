<template>
  <div class="w-[400px] h-[500px] flex flex-col overflow-hidden" :class="{ dark: isDark }">
    <div class="flex-1 flex flex-col overflow-hidden text-neutral-700 dark:text-neutral-300">
      <RouterView />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useThemeStoreState } from '@/stores/useThemeStore'
const { isDark } = useThemeStoreState()
</script>
