# Goobox Container-Beladungssimulationssystem

Ein mit Vue 3 und Three.js erstelltes 3D-Container-Beladungssimulationssystem, das Benutzern hilft, die Containerraumnutzung und Ladungspläne zu optimieren.

[English](./README.md) | [中文](./README.zh-CN.md) | [日本語](./README.ja.md)

## Funktionen

- **Hochvisualisierte 3D-Beladungssimulation**: Echtzeit-Anzeige der Ladungsplatzierung und Raumnutzung in Containern
- **Unterstützung mehrerer Containertypen**: Einschließlich Standard-Trockencontainer (20GP/40GP/40HC) und Kühlcontainer (20RF/40RF/40RQHC)
- **Echtzeit-Beladungsstatistiken**: Anzeige der Volumen- und Gewichtsausnutzung zur Optimierung der Beladungseffizienz
- **Intelligenter Beladungsalgorithmus**: Automatische Berechnung und Optimierung der Ladungsplatzierung zur Maximierung der Raumnutzung
- **Mehrsprachige Unterstützung**: Integrierte chinesische, englische, japanische, deutsche und spanische Benutzeroberflächen
- **Beladungsplanexport**: Unterstützung für den Export detaillierter Beladungspläne und Berichte
- **Suchmaschinenoptimierung (SEO)**: Verbesserung der Sichtbarkeit der Website in Suchmaschinen
- **Benutzerauthentifizierungssystem**: Unterstützung für Benutzerregistrierung und Anmeldefunktionalität

## Technologie-Stack

- **Frontend-Framework**: Vue 3
- **Build-Tool**: Vite
- **UI-Komponentenbibliothek**: Ant Design Vue 4.x
- **3D-Rendering**: Three.js
- **Internationalisierung**: Vue I18n
- **Router**: Vue Router

## Systemanforderungen

- Node.js >= 14.0.0
- Yarn >= 1.22.0 (empfohlen) oder npm >= 6.0.0

## Schnellstart

### Projekt-Setup

```sh
# Projekt klonen
git clone https://github.com/57651173/Goobox.git

# Abhängigkeiten installieren
yarn

# Entwicklungsserver starten
yarn dev
```

### Produktions-Build

```sh
yarn build
```

Nach dem Build befinden sich die generierten statischen Dateien im Verzeichnis `dist`.

## Internationalisierung (i18n)

Dieses Projekt hat mehrsprachige Unterstützung mit der folgenden Konfiguration integriert:

1. Sprachdateien befinden sich im Verzeichnis `src/locales/`:
   - `zh.json` - Chinesische Übersetzungen
   - `en.json` - Englische Übersetzungen
   - `ja.json` - Japanische Übersetzungen
   - `de.json` - Deutsche Übersetzungen
   - `es.json` - Spanische Übersetzungen

2. i18n-Konfiguration (bereits in `src/main.js` eingerichtet):
```js
import { createI18n } from 'vue-i18n'
import en from './locales/en.json'
import zh from './locales/zh.json'
import de from './locales/de.json'
import es from './locales/es.json'
import ja from './locales/ja.json'

const i18n = createI18n({
  legacy: false,
  locale: savedLocale,  // Standardmäßig gespeicherte Spracheinstellung oder Browser-Sprache
  fallbackLocale: 'en',
  messages: { en, zh, de, es, ja }
})

app.use(i18n)
```

## Richtlinien für Beiträge

Wir begrüßen alle Formen von Beiträgen, einschließlich, aber nicht beschränkt auf:

1. Einreichen von Issues zur Meldung von Fehlern oder zum Vorschlagen neuer Funktionen
2. Erstellen von Pull Requests zur Verbesserung von Code oder Dokumentation
3. Hilfe bei der Übersetzung oder Verbesserung der mehrsprachigen Unterstützung

## Lizenz

[MIT-Lizenz](LICENSE) 