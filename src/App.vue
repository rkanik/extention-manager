<template>
  <div class="bg-gray-50 min-h-screen">
    <!-- Header -->
    <div
      class="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-b-lg"
    >
      <h1 class="text-lg font-semibold">Extension Manager</h1>
    </div>

    <div class="p-4">
      <!-- Extension List Header -->
      <div class="bg-white rounded-lg p-3 mb-4 shadow-sm">
        <h2 class="text-sm font-medium text-gray-900 mb-1">My Extensions</h2>
        <p class="text-xs text-gray-500">
          {{ filteredExtensions.length }} extension{{
            filteredExtensions.length !== 1 ? "s" : ""
          }}
          in your list
        </p>
      </div>

      <!-- Status Messages -->
      <div
        v-if="status"
        :class="[
          'p-3 rounded-lg mb-4 text-sm',
          status.type === 'success'
            ? 'bg-green-100 text-green-800 border border-green-200'
            : '',
          status.type === 'error'
            ? 'bg-red-100 text-red-800 border border-red-200'
            : '',
          status.type === 'info'
            ? 'bg-blue-100 text-blue-800 border border-blue-200'
            : '',
        ]"
      >
        {{ status.message }}
      </div>

      <!-- Action Buttons -->
      <div class="flex gap-2 mb-4 flex-wrap">
        <button
          @click="exportExtensions"
          class="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
        >
          Export
        </button>
        <label
          class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors cursor-pointer"
        >
          Import
          <input
            type="file"
            accept=".json"
            @change="importExtensions"
            class="hidden"
          />
        </label>
      </div>

      <!-- Search -->
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search extensions..."
        class="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-8 text-gray-500">
        Loading...
      </div>

      <!-- Extension List -->
      <div v-else class="space-y-3 max-h-80 overflow-y-auto">
        <div
          v-for="extension in filteredExtensions"
          :key="extension.id"
          class="bg-white rounded-lg p-4 shadow-sm border border-gray-200"
        >
          <div class="flex items-center gap-3">
            <img
              :src="
                extension.icons?.[0]?.url ||
                'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iNCIgZmlsbD0iI0U1RTdGQSIvPgo8cGF0aCBkPSJNMTYgOEwxMiAxMkwxNiAxNkwxMiAyMEwxNiAyNEwyMCAyMEwxNiAxNkwyMCAxMkwxNiA4WiIgZmlsbD0iIzk5Q0FGRiIvPgo8L3N2Zz4K'
              "
              :alt="extension.name"
              class="w-8 h-8 rounded"
            />
            <div class="flex-1 min-w-0">
              <h3 class="font-semibold text-sm text-gray-900 truncate">
                {{ extension.name }}
              </h3>
              <p class="text-xs text-gray-500 truncate">
                {{ extension.description }}
              </p>
            </div>
            <div class="flex gap-2">
              <!-- Actions for installed extensions -->
              <template v-if="extension.isLocal">
                <button
                  @click="onToggleEnabled(extension.id)"
                  :class="[
                    'px-3 py-1 rounded text-xs font-medium transition-colors',
                    extension.enabled
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-green-600 text-white hover:bg-green-700',
                  ]"
                >
                  {{ extension.enabled ? "Disable" : "Enable" }}
                </button>
                <button
                  @click="onUninstallExtension(extension.id)"
                  class="px-3 py-1 bg-red-600 text-white rounded text-xs font-medium hover:bg-red-700 transition-colors"
                >
                  Remove
                </button>
              </template>
              <!-- Actions for imported extensions -->
              <template v-else>
                <button
                  @click="onInstallExtension(extension)"
                  class="px-3 py-1 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 transition-colors"
                  title="Open in Chrome Web Store"
                >
                  Install
                </button>
              </template>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div
          v-if="extensions.length === 0"
          class="text-center py-8 text-gray-500"
        >
          <h3 class="font-medium text-gray-900 mb-2">
            No extensions in your list
          </h3>
          <p class="text-sm">
            Import a JSON file to get started, or add extensions manually
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";

const loading = ref(false);
const searchQuery = ref("");
const status = ref(null);

const localExtensions = ref([]);
const remoteExtensions = ref([]);

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
        }))
    );

  //   const local = localExtensions.value.map((e) => {
  //     return {
  //       ...e,
  //       isLocal: true,
  //       isRemote: remoteExtensions.value.some((v) => v.id === e.id),
  //     };
  //   });
  //   const remote = Object.values(
  //     remoteExtensions.value.reduce((acc, ext) => {
  //       acc[ext.id] = {
  //         ...ext,
  //         isLocal: false,
  //         isRemote: true,
  //       };
  //       return acc;
  //     }, {})
  //   );
  //   return [...local, ...remote];
});

// Currently installed extensions (from Chrome API)
// const installedExtensions = ref([]);
// Imported extensions from JSON (persisted)
// const importedExtensions = ref([]);
// Combined list for display
// const allExtensions = ref([]);

const filteredExtensions = computed(() => {
  if (!searchQuery.value) return extensions.value;

  return extensions.value.filter(
    (ext) =>
      ext.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      ext.description.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const showStatus = (message, type = "info") => {
  status.value = { message, type };
  setTimeout(() => {
    status.value = null;
  }, 3000);
};

// Load imported extensions from storage
// const loadImportedExtensions = () => {
//   if (typeof chrome !== "undefined" && chrome.storage) {
//     chrome.storage.local.get(["importedExtensions"], (result) => {
//       if (result.importedExtensions) {
//         importedExtensions.value = result.importedExtensions;
//         mergeExtensions();
//       }
//     });
//   }
// };

// Save imported extensions to storage
// const saveImportedExtensions = () => {
//   console.log(
//     "saving imported extensions",
//     importedExtensions.value,
//     localStorage,
//     chrome.storage,
//     chrome
//   );
//   if (typeof chrome !== "undefined" && chrome.storage) {
//     chrome.storage.local.set({
//       importedExtensions: importedExtensions.value,
//     });
//   }
// };

// Merge installed and imported extensions
// const mergeExtensions = () => {
//   const installedIds = new Set(
//     installedExtensions.value.map((ext) => ext.id)
//   );

//   // Add all installed extensions
//   const merged = [...installedExtensions.value];

//   // Add imported extensions that are not already installed
//   importedExtensions.value.forEach((importedExt) => {
//     if (!installedIds.has(importedExt.id)) {
//       merged.push({
//         ...importedExt,
//         isInstalled: false,
//       });
//     }
//   });

//   allExtensions.value = merged;
// };

// const loadInstalledExtensions = async () => {
//   loading.value = true;
//   try {
//     if (typeof chrome !== "undefined" && chrome.management) {
//       chrome.management.getAll((extensions) => {
//         // Filter out this extension itself
//         const filteredExtensions = extensions.filter(
//           (ext) => ext.id !== chrome.runtime.id && ext.type === "extension"
//         );

//         // Store installed extensions
//         installedExtensions.value = filteredExtensions.map((ext) => ({
//           id: ext.id,
//           name: ext.name,
//           description: ext.description || "No description available",
//           icon: ext.icons?.[0]?.url || "",
//           enabled: ext.enabled,
//           isInstalled: true,
//         }));

//         // Merge with imported extensions
//         mergeExtensions();
//         loading.value = false;
//       });
//     } else {
//       // Fallback for development
//       installedExtensions.value = [];
//       mergeExtensions();
//       loading.value = false;
//     }
//   } catch (error) {
//     console.error("Error loading extensions:", error);
//     installedExtensions.value = [];
//     mergeExtensions();
//     loading.value = false;
//   }
// };

const onToggleEnabled = async (id) => {
  chrome.management.get(id, (extension) => {
    if (chrome.runtime.lastError) {
      showStatus("Failed to get extension info", "error");
      return;
    }
    const newEnabledState = !extension.enabled;
    chrome.management.setEnabled(id, newEnabledState, () => {
      if (chrome.runtime.lastError) {
        showStatus("Failed to toggle extension", "error");
        return;
      }
      localExtensions.value = localExtensions.value.map((e) =>
        e.id === id ? { ...e, enabled: newEnabledState } : e
      );
    });
  });
};

const onUninstallExtension = async (id) => {
  chrome.management.uninstall(id, {}, () => {
    if (chrome.runtime.lastError) {
      showStatus("Failed to remove extension", "error");
      return;
    }
  });
};

const onInstallExtension = async (extension) => {
  chrome.tabs.create({
    url:
      extension.homepageUrl ||
      `https://chromewebstore.google.com/detail/${extension.id}`,
  });
};

const exportExtensions = () => {
  try {
    const data = {
      extensions: localExtensions.value,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `extensions-${Date.now()}.json`;
    a.click();

    URL.revokeObjectURL(url);
    showStatus(
      "Currently installed extensions exported successfully",
      "success"
    );
  } catch (error) {
    showStatus("Failed to export extensions", "error");
  }
};

const remoteKey = "remoteExtensions";

const importExtensions = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      if (Array.isArray(data?.extensions) && data?.extensions?.length > 0) {
        remoteExtensions.value = data.extensions;
        chrome.storage.local.set({
          [remoteKey]: JSON.stringify({
            ...data,
            importedAt: new Date().toISOString(),
          }),
        });

        showStatus(
          "Extensions list imported and saved successfully",
          "success"
        );
      } else {
        showStatus("No extension data found in file", "error");
        return;
      }

      //   // Save to storage and merge
      //   saveImportedExtensions();
      //   mergeExtensions();
    } catch (error) {
      showStatus("Invalid file format", "error");
    }
  };
  reader.readAsText(file);

  // Reset file input
  event.target.value = "";
};

onMounted(() => {
  chrome.management.getAll((extensions) => {
    // console.log("extensions", extensions);
    localExtensions.value = extensions;
  });

  chrome.storage.local.get([remoteKey], (result) => {
    if (result[remoteKey]) {
      try {
        const data = JSON.parse(result[remoteKey]);
        if (Array.isArray(data?.extensions) && data?.extensions?.length > 0) {
          remoteExtensions.value = data.extensions;
        }
      } catch (error) {
        console.error("Error parsing remote extensions", error);
      }
    }
  });
});
</script>
