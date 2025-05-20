# Goobox Container Loading Simulation System

A 3D container loading simulation system built with Vue 3 and Three.js, helping users optimize container space utilization and cargo loading plans.

[中文](./README.zh-CN.md) | [日本語](./README.ja.md) | [Deutsch](./README.de.md)

## Features

- **Highly Visualized 3D Loading Simulation**: Real-time display of cargo placement and space utilization in containers
- **Multiple Container Type Support**: Including standard dry containers (20GP/40GP/40HC) and refrigerated containers (20RF/40RF/40RQHC)
- **Real-time Loading Statistics**: Displaying volume and weight utilization to help optimize loading efficiency
- **Intelligent Loading Algorithm**: Automatically calculating and optimizing cargo placement to maximize space utilization
- **Multi-language Support**: Built-in Chinese, English, Japanese, German, and Spanish interfaces
- **Loading Plan Export**: Support for exporting detailed loading plans and reports
- **Search Engine Optimization (SEO)**: Enhancing website visibility in search engines
- **User Authentication System**: Support for user registration and login functionality

## Technology Stack

- **Frontend Framework**: Vue 3
- **Build Tool**: Vite
- **UI Component Library**: Ant Design Vue 4.x
- **3D Rendering**: Three.js
- **Internationalization**: Vue I18n
- **Router**: Vue Router

## System Requirements

- Node.js >= 14.0.0
- Yarn >= 1.22.0 (recommended) or npm >= 6.0.0

## Quick Start

### Project Setup

```sh
# Clone the project
git clone https://github.com/57651173/Goobox.git

# Install dependencies
yarn

# Start development server
yarn dev
```

### Production Build

```sh
yarn build
```

After building, the generated static files will be in the `dist` directory.

## Internationalization (i18n)

This project has integrated multi-language support with the following configuration:

1. Language files are located in the `src/locales/` directory:
   - `zh.json` - Chinese translations
   - `en.json` - English translations
   - `ja.json` - Japanese translations
   - `de.json` - German translations
   - `es.json` - Spanish translations

2. i18n configuration (already set up in `src/main.js`):
```js
import { createI18n } from 'vue-i18n'
import en from './locales/en.json'
import zh from './locales/zh.json'
import de from './locales/de.json'
import es from './locales/es.json'
import ja from './locales/ja.json'

const i18n = createI18n({
  legacy: false,
  locale: savedLocale,  // Default to saved language setting or browser language
  fallbackLocale: 'en',
  messages: { en, zh, de, es, ja }
})

app.use(i18n)
```

3. The application provides a language selector in the top right corner, allowing users to easily switch languages.

## Project Structure

```
├── public/            # Static resources directory
├── src/               # Source code
│   ├── assets/        # Static asset files
│   │   ├── container/ # Container-related components
│   │   ├── home/      # Homepage-related components
│   │   └── icons/     # Icon components
│   ├── config/        # Global configuration
│   ├── locales/       # Internationalization language files
│   ├── router/        # Router configuration
│   ├── views/         # Page views
│   ├── App.vue        # Main application component
│   └── main.js        # Application entry point
├── index.html         # HTML template
├── vite.config.js     # Vite configuration
├── .eslintrc.js       # ESLint configuration
├── package.json       # Project dependencies
└── README.md          # Project documentation
```

## Contribution Guidelines

We welcome all forms of contributions, including but not limited to:

1. Submitting issues to report bugs or suggest new features
2. Creating pull requests to improve code or documentation
3. Helping translate or enhance multi-language support

## License

[MIT License](LICENSE) 