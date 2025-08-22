<script setup lang="ts">
import type { TExtension } from '@/types'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'

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

<template>
  <ContextMenu>
    <ContextMenuTrigger as-child>
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
      </button>
    </ContextMenuTrigger>
    <ContextMenuContent>
      <ContextMenuItem v-if="extension.isLocal" @click="emit('toggle', extension)">
        {{ extension.enabled ? 'Disable' : 'Enable' }}
      </ContextMenuItem>
      <ContextMenuItem v-if="extension.isLocal" @click="emit('uninstall', extension)">
        Remove
      </ContextMenuItem>
      <ContextMenuItem v-else @click="emit('install', extension)"> Open Store </ContextMenuItem>
    </ContextMenuContent>
  </ContextMenu>
</template>
