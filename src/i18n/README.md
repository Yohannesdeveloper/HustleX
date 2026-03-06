# Multi-Language Support (i18n)

This project uses **react-i18next** for internationalization support. The system supports 4 languages:
- English (en)
- Amharic (am) - አማርኛ
- Tigrinya (ti) - ትግርኛ
- Afan Oromo (om) - Afaan Oromoo

## Setup

The i18n system is automatically initialized when the app starts (see `src/main.tsx`). The configuration is in `src/i18n/config.ts`.

## Usage

### Basic Usage

```tsx
import { useI18n } from "../hooks/useI18n";

function MyComponent() {
  const { t } = useI18n();
  
  return (
    <div>
      <h1>{t("nav.home")}</h1>
      <p>{t("hero.subtitle")}</p>
    </div>
  );
}
```

### Changing Language

```tsx
import { useI18n } from "../hooks/useI18n";

function LanguageSwitcher() {
  const { changeLanguage, currentLanguage } = useI18n();
  
  return (
    <div>
      <button onClick={() => changeLanguage("en")}>English</button>
      <button onClick={() => changeLanguage("am")}>አማርኛ</button>
      <button onClick={() => changeLanguage("ti")}>ትግርኛ</button>
      <button onClick={() => changeLanguage("om")}>Oromoo</button>
    </div>
  );
}
```

### Using the Language Switcher Component

A ready-to-use language switcher component is available:

```tsx
import LanguageSwitcher from "../components/LanguageSwitcher";

function Navbar() {
  return (
    <nav>
      {/* Other nav items */}
      <LanguageSwitcher />
    </nav>
  );
}
```

## Translation Files

Translation files are located in `src/i18n/locales/`:
- `en.json` - English translations
- `am.json` - Amharic translations
- `ti.json` - Tigrinya translations
- `om.json` - Afan Oromo translations

## Adding New Translations

1. Add the translation key to all language files in `src/i18n/locales/`
2. Use nested objects for organization (e.g., `nav.home`, `hero.title`)
3. Use the `t()` function to access translations

Example:
```json
{
  "mySection": {
    "title": "My Title",
    "description": "My Description"
  }
}
```

Access with: `t("mySection.title")` or `t("mySection.description")`

## Integration with Redux

The i18n system is integrated with Redux (`languageSlice`) to maintain language state across the app. The `useI18n` hook automatically syncs both systems.

## Language Detection

The system automatically detects the user's language preference from:
1. localStorage (`hustlex_language`)
2. Browser language settings
3. HTML lang attribute

Default language is English if none is detected.
