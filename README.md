# Goobox Container Loading Simulator

A 3D container loading simulation system built with Vue 3 and Vite.

[中文文档](./README.zh-CN.md)

## Features

- 3D visualization of container loading
- Multiple container type support
- Real-time loading statistics
- Intelligent space optimization algorithms
- Loading plan export

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Project Setup

```sh
yarn
```

### Compile and Hot-Reload for Development

```sh
yarn dev
```

### Compile and Minify for Production

```sh
yarn build
```

## Internationalization (i18n)

This project has integrated internationalization support with multiple languages. Here's how it's implemented:

1. Install vue-i18n:
```sh
yarn add vue-i18n@next
```

2. Language files in `src/locales/` directory:
   - `en.json` for English
   - `zh.json` for Chinese
   - `de.json` for German
   - `es.json` for Spanish
   - Add other languages as needed

3. i18n configuration (already set up in `src/main.js`):
```js
import { createI18n } from 'vue-i18n'
import en from './locales/en.json'
import zh from './locales/zh.json'
import de from './locales/de.json'
import es from './locales/es.json'

const i18n = createI18n({
  legacy: false,
  locale: 'en',  // Default to English
  fallbackLocale: 'en',
  messages: { en, zh, de, es }
})

app.use(i18n)
```

4. Language selector with flag icons is available in the top right corner of the application.

## Project Structure

```
src/
├── assets/        # Static assets
├── components/    # Components
├── locales/       # i18n language files
├── router/        # Router configuration
├── views/         # Page views
├── App.vue        # Main application component
└── main.js        # Application entry
```

## Tech Stack

- Vue 3: Frontend framework
- Vite: Build tool
- Vue Router: Routing
- Vue I18n: Internationalization
- Ant Design Vue: UI component library
- Three.js: 3D rendering
