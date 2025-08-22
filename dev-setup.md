# Quick Development Setup

## Install & Build
```bash
npm install
npm run build
```

## Load in Chrome
1. Go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. **Select the `dist` folder** (not the project root)

## Development Workflow
1. Make changes to files in `src/`
2. Run `npm run build`
3. Refresh the extension in Chrome extensions page
4. Test your changes

## Features Implemented
✅ Manage installed extensions (enable/disable/delete)
✅ Available extensions list with install functionality
✅ Export extensions to JSON
✅ Import extensions from JSON
✅ Search functionality
✅ Modern UI with Tailwind CSS
✅ Vue.js 3 with Composition API

## File Structure
- `src/App.vue` - Main Vue component
- `src/popup.js` - Vue app initialization
- `src/background.js` - Background service worker
- `src/style.css` - Global styles with Tailwind
- `popup.html` - Popup entry point (root)
- `public/manifest.json` - Extension configuration
- `public/Icon 128x128.png` - Extension icon
- `dist/` - Complete extension bundle (load this in Chrome)

## Build Output
The `dist/` directory contains everything needed for the extension:
- `manifest.json` - Extension configuration (from public/)
- `popup.html` - Main popup interface
- `popup.js` - Vue application bundle
- `popup.css` - Tailwind CSS styles
- `background.js` - Background service worker
- `Icon 128x128.png` - Extension icon (from public/)

## Static Files
Files in the `public/` directory are automatically copied to `dist/` during build:
- `manifest.json` - Extension configuration
- `Icon 128x128.png` - Extension icon
