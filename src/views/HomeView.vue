<template>
  <div class="bg-gray-50 flex-1 flex flex-col dark:bg-neutral-900 overflow-hidden">
    <!-- Header -->
    <div class="px-4 flex justify-between items-center dark:bg-neutral-900 pt-4 flex-none">
      <h1 class="text-base font-semibold">Extension Manager</h1>

      <!-- Action Buttons -->
      <div class="flex">
        <IconButton tooltip="Export" @click="exportExtensions">
          <LucideShare2 class="w-4 h-4" />
        </IconButton>

        <IconButton as="label" tooltip="Import">
          <LucidePackagePlus class="w-[18px] h-[18px]" />
          <input type="file" accept=".json" @change="importExtensions" class="hidden" />
        </IconButton>
        <IconButton tooltip="Toggle Theme" @click="toggleTheme">
          <LucideSun class="w-[18px] h-[18px]" v-if="isDark" />
          <LucideMoonStar class="w-4 h-4" v-else />
        </IconButton>
      </div>
    </div>

    <div class="px-4 flex-none mt-2">
      <!-- Status Messages -->
      <div
        v-if="status"
        :class="[
          'p-3 rounded-lg mb-4 text-sm',
          status.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' : '',
          status.type === 'error' ? 'bg-red-100 text-red-800 border border-red-200' : '',
          status.type === 'info' ? 'bg-blue-100 text-blue-800 border border-blue-200' : '',
        ]"
      >
        {{ status.message }}
      </div>
    </div>

    <div class="px-4 mt-2 flex-none">
      <!-- Search -->
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search extensions..."
        class="w-full p-3 border border-gray-300 dark:border-neutral-800 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>

    <div class="overflow-y-auto flex flex-col gap-4 px-4 flex-1">
      <!-- Enabled Extensions -->
      <div v-if="enabledExtensions.length > 0">
        <div class="text-sm font-semibold">Extensions</div>
        <div class="flex flex-wrap gap-2 mt-2">
          <ExtensionCard
            v-for="extension in enabledExtensions"
            :key="extension.id"
            :extension="extension"
            @toggle="onToggleEnabled"
            @install="onInstallExtension"
            @uninstall="onUninstallExtension"
          />
        </div>
      </div>

      <div v-if="disabledExtensions.length > 0">
        <div class="text-sm font-semibold">Disabled</div>
        <div class="flex flex-wrap gap-2 mt-2">
          <ExtensionCard
            v-for="extension in disabledExtensions"
            :key="extension.id"
            :extension="extension"
            @toggle="onToggleEnabled"
            @install="onInstallExtension"
            @uninstall="onUninstallExtension"
          />
        </div>
      </div>

      <!-- Installable Extensions -->
      <div v-if="installableExtensions.length > 0">
        <div class="text-sm font-semibold">Imported</div>
        <div class="flex flex-wrap gap-2 mt-2">
          <ExtensionCard
            v-for="extension in installableExtensions"
            :key="extension.id"
            :extension="extension"
            @toggle="onToggleEnabled"
            @install="onInstallExtension"
            @uninstall="onUninstallExtension"
          />
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="filteredExtensions.length === 0" class="text-center py-8 text-gray-500">
        <div class="text-sm font-medium text-gray-900 mb-2">No extensions in your list</div>
        <p class="text-xs">Import a JSON file to get started, or add extensions manually</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TExtension } from '@/types'

import { useThemeStore, useThemeStoreState } from '@/stores/useThemeStore'

import LucideSun from '~icons/lucide/sun'
import LucideMoonStar from '~icons/lucide/moon-star'
import LucideShare2 from '~icons/lucide/share-2'
import LucidePackagePlus from '~icons/lucide/package-plus'

type TStatus = {
  message: string
  type: 'success' | 'error' | 'info'
}

const searchQuery = ref('')
const status = ref<TStatus | null>(null)

const { isDark } = useThemeStoreState()
const { toggleTheme } = useThemeStore()

const localExtensions = ref<TExtension[]>([])
const remoteExtensions = ref<TExtension[]>([])

const extensions = computed(() => {
  return localExtensions.value
    .map((e) => ({
      ...e,
      isLocal: true,
      isRemote: remoteExtensions.value.some((v) => v.id === e.id),
    }))
    .concat(
      remoteExtensions.value
        .filter((e) => !localExtensions.value.some((v) => v.id === e.id))
        .map((e) => ({
          ...e,
          isLocal: false,
          isRemote: true,
        })),
    )
})

const filteredExtensions = computed(() => {
  if (!searchQuery.value) return extensions.value
  return extensions.value.filter((ext) => {
    return (
      ext.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      ext.description.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  })
})

const enabledExtensions = computed(() => {
  return filteredExtensions.value.filter((e) => e.isLocal && e.enabled)
})

const disabledExtensions = computed(() => {
  return filteredExtensions.value.filter((e) => e.isLocal && !e.enabled)
})

const installableExtensions = computed(() => {
  return filteredExtensions.value.filter((e) => e.isRemote && !e.isLocal)
})

const showStatus = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
  status.value = { message, type }
  setTimeout(() => {
    status.value = null
  }, 3000)
}

const onToggleEnabled = async (extension: TExtension) => {
  chrome.management.get(extension.id, (extension) => {
    if (chrome.runtime.lastError) {
      showStatus('Failed to get extension info', 'error')
      return
    }
    const newEnabledState = !extension.enabled
    chrome.management.setEnabled(extension.id, newEnabledState, () => {
      if (chrome.runtime.lastError) {
        showStatus('Failed to toggle extension', 'error')
        return
      }
      localExtensions.value = localExtensions.value.map((e) =>
        e.id === extension.id ? { ...e, enabled: newEnabledState } : e,
      )
    })
  })
}

const onUninstallExtension = async (extension: TExtension) => {
  chrome.management.uninstall(extension.id, {}, () => {
    if (chrome.runtime.lastError) {
      showStatus('Failed to remove extension', 'error')
      return
    }
  })
}

const onInstallExtension = async (extension: TExtension) => {
  chrome.tabs.create({
    url: extension.homepageUrl || `https://chromewebstore.google.com/detail/${extension.id}`,
  })
}

const toBase64 = (url: string): Promise<string | undefined> => {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'Anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        resolve(undefined)
        return
      }
      ctx.drawImage(img, 0, 0)
      try {
        const dataURL = canvas.toDataURL('image/png')
        resolve(dataURL)
      } catch (_) {
        resolve(undefined)
      }
    }
    img.onerror = () => {
      resolve(undefined)
    }
    img.src = url
  })
}

const exportExtensions = async () => {
  try {
    const data = {
      extensions: await Promise.all(
        localExtensions.value.map(async (v) => {
          return {
            ...v,
            icon: v.icons?.length ? await toBase64(v.icons[v.icons.length - 1].url) : undefined,
          }
        }),
      ),
      exportedAt: new Date().toISOString(),
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `extensions-${Date.now()}.json`
    a.click()

    URL.revokeObjectURL(url)
    showStatus('Currently installed extensions exported successfully', 'success')
  } catch (_) {
    showStatus('Failed to export extensions', 'error')
  }
}

const remoteKey = 'remoteExtensions'

const importExtensions = (event: any) => {
  const file = event.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result)
      if (Array.isArray(data?.extensions) && data?.extensions?.length > 0) {
        remoteExtensions.value = data.extensions
        chrome.storage.local.set({
          [remoteKey]: JSON.stringify({
            ...data,
            importedAt: new Date().toISOString(),
          }),
        })

        showStatus('Extensions list imported and saved successfully', 'success')
      } else {
        showStatus('No extension data found in file', 'error')
        return
      }

      //   // Save to storage and merge
      //   saveImportedExtensions();
      //   mergeExtensions();
    } catch (_) {
      showStatus('Invalid file format', 'error')
    }
  }
  reader.readAsText(file)

  // Reset file input
  event.target.value = ''
}

onMounted(() => {
  chrome.management.getAll((extensions) => {
    localExtensions.value = extensions as TExtension[]
  })
  chrome.storage.local.get([remoteKey], (result) => {
    if (result[remoteKey]) {
      try {
        const data = JSON.parse(result[remoteKey])
        if (Array.isArray(data?.extensions) && data?.extensions?.length > 0) {
          remoteExtensions.value = data.extensions
        }
      } catch (error) {
        console.error('Error parsing remote extensions', error)
      }
    }
  })
})
</script>
