<template>
  <button
    type="button"
    class="rounded-lg p-3 border border-gray-200 hover:border-black cursor-pointer dark:border-neutral-800 dark:hover:border-neutral-500"
    :class="{ 'opacity-40': extension.isLocal && !extension.enabled }"
    @click="onClick"
  >
    <!-- @click="onClick" -->
    <img
      v-if="extension.icon || extension.icons?.length"
      :src="
        extension.icon ||
        extension.icons?.[extension.icons.length - 1].url ||
        'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iNCIgZmlsbD0iI0U1RTdGQSIvPgo8cGF0aCBkPSJNMTYgOEwxMiAxMkwxNiAxNkwxMiAyMEwxNiAyNEwyMCAyMEwxNiAxNkwyMCAxMkwxNiA4WiIgZmlsbD0iIzk5Q0FGRiIvPgo8L3N2Zz4K'
      "
      :alt="extension.name"
      class="w-6 h-6"
    />
    <div v-else class="w-6 h-6 bg-gray-200 rounded" />

    <!-- <div class="flex gap-2">

        <template v-if="extension.isLocal">
          <button
            @click="$emit('toggleEnabled', extension.id)"
            :class="[
              'px-3 py-1 rounded text-xs font-medium transition-colors',
              extension.enabled
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-green-600 text-white hover:bg-green-700',
            ]"
          >
            {{ extension.enabled ? 'Disable' : 'Enable' }}
          </button>
          <button
            @click="$emit('uninstall', extension)"
            class="px-3 py-1 bg-red-600 text-white rounded text-xs font-medium hover:bg-red-700 transition-colors"
          >
            Remove
          </button>
        </template>

        <template v-else>
          <button
            @click="$emit('install', extension)"
            class="px-3 py-1 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 transition-colors"
            title="Open in Chrome Web Store"
          >
            Install
          </button>
        </template>
      </div> -->
  </button>
</template>

<script setup lang="ts">
import type { TExtension } from '@/types'

const props = defineProps<{
  extension: TExtension
}>()

const emit = defineEmits<{
  (e: 'toggle', extension: TExtension): void
  (e: 'install', extension: TExtension): void
  (e: 'uninstall', extension: TExtension): void
}>()

const onClick = () => {
  if (props.extension.isLocal) {
    return emit('toggle', props.extension)
  }
  emit('install', props.extension)
}
</script>
