export type TExtension = chrome.management.ExtensionInfo & {
  icon?: string
  isLocal: boolean
  isRemote: boolean
}
