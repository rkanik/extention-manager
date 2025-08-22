export const useThemeStore = defineStore('theme', () => {
  const theme = ref('light')

  const isDark = computed(() => theme.value === 'dark')
  const isLight = computed(() => theme.value === 'light')

  const toggleTheme = () => {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
    console.log('toggleTheme', theme.value)
    chrome.storage.local.set({
      theme: theme.value,
    })
  }

  onMounted(() => {
    chrome.storage.local.get('theme', (result) => {
      console.log(result)
      theme.value = result.theme || 'light'
    })
  })
  return {
    theme,
    isDark,
    isLight,
    toggleTheme,
  }
})

export const useThemeStoreState = () => {
  return storeToRefs(useThemeStore())
}
