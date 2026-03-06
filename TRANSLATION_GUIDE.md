# 🌍 Multilingual Translation System Guide

## Overview

Your HustleX website now has a complete multilingual system supporting:
- **English** (en)
- **Amharic** (አማርኛ) (am)
- **Tigrinya** (ትግርኛ) (ti)
- **Afan Oromo** (Afaan Oromoo) (om)

## How It Works

1. **Language Selection**: Users can select their preferred language from the navigation bar
2. **Automatic Translation**: All content automatically updates when language changes
3. **Persistent**: Language preference is saved in localStorage

## Using Translations in Components

### Step 1: Import the Hook

```typescript
import { useTranslation } from "../hooks/useTranslation";
```

### Step 2: Use the Hook

```typescript
const MyComponent = () => {
  const t = useTranslation();
  
  return (
    <div>
      <h1>{t.nav.home}</h1>
      <p>{t.hero.subtitle}</p>
    </div>
  );
};
```

### Step 3: Access Translation Keys

All translations are organized by section:

```typescript
t.nav.home              // Navigation items
t.hero.title            // Hero section
t.features.title        // Features section
t.categories.title      // Categories
t.testimonials.title    // Testimonials
t.cta.title             // Call-to-action
t.footer.description    // Footer
t.common.language       // Common terms
```

## Available Translation Keys

### Navigation (`t.nav`)
- `home`, `aboutUs`, `exploreJobs`, `blog`, `faq`, `howItWorks`, `contact`, `findFreelancers`, `logIn`, `signUp`

### Hero Section (`t.hero`)
- `title`, `titleHighlight`, `subtitle`, `subtitleHighlight`, `getStarted`, `findTalent`, `joinAsFreelancer`

### Features (`t.features`)
- `title`, `subtitle`
- `postJobs.title`, `postJobs.desc`
- `findTalent.title`, `findTalent.desc`
- `securePayments.title`, `securePayments.desc`
- `realTimeChat.title`, `realTimeChat.desc`

### Categories (`t.categories`)
- `title`, `subtitle`, `freelancers`, `popularCategories`
- `development`, `design`, `marketing`, `mobile`, `writing`, `translation`, `business`, `consulting`, `adminSupport`, `eliteFreelancers`

### How It Works (`t.howItWorks`)
- `title`, `subtitle`, `videoSubtitle`
- `steps.signUp.title`, `steps.signUp.desc`
- `steps.browse.title`, `steps.browse.desc`
- `steps.connect.title`, `steps.connect.desc`
- `steps.succeed.title`, `steps.succeed.desc`

### Companies (`t.companies`)
- `trustedBy`, `companies`

### Testimonials (`t.testimonials`)
- `title`, `subtitle`

### CTA (`t.cta`)
- `title`, `subtitle`, `subtitleHighlight`, `getStarted`, `learnMore`, `findDreamWork`

### Footer (`t.footer`)
- `description`, `quickLinks`, `resources`, `followUs`, `allRightsReserved`
- `forClients`, `forFreelancers`, `company`
- `howToHire`, `talentMarketplace`, `howToFindWork`, `freelanceJobs`
- `aboutUs`, `careers`, `contactUs`, `helpCenter`, `blog`, `community`
- `madeWith`, `inEthiopia`

### Common (`t.common`)
- `language`, `darkMode`, `loading`, `error`, `success`

## Adding New Translations

### 1. Update the Interface

Edit `src/translations/index.ts` and add to the `Translations` interface:

```typescript
export interface Translations {
  // ... existing sections
  myNewSection: {
    title: string;
    description: string;
  };
}
```

### 2. Add Translations for All Languages

```typescript
const translations: Record<Language, Translations> = {
  en: {
    // ... existing
    myNewSection: {
      title: "My Title",
      description: "My Description",
    },
  },
  am: {
    // ... existing
    myNewSection: {
      title: "የእኔ ርዕስ",
      description: "የእኔ መግለጫ",
    },
  },
  ti: {
    // ... existing
    myNewSection: {
      title: "ናይይ ኣርእስቲ",
      description: "ናይይ መግለጺ",
    },
  },
  om: {
    // ... existing
    myNewSection: {
      title: "Maqaa Koo",
      description: "Ibsa Koo",
    },
  },
};
```

### 3. Use in Component

```typescript
const t = useTranslation();
<h1>{t.myNewSection.title}</h1>
```

## Example: Translating a New Component

```typescript
import { useTranslation } from "../hooks/useTranslation";

const MyNewPage = () => {
  const t = useTranslation();
  const darkMode = useAppSelector((s) => s.theme.darkMode);

  return (
    <div>
      <h1>{t.nav.aboutUs}</h1>
      <p>{t.hero.subtitle}</p>
      <button>{t.nav.signUp}</button>
    </div>
  );
};
```

## Language Detection

The system automatically:
- Loads saved language from localStorage
- Defaults to English if no preference is set
- Updates all components when language changes

## Best Practices

1. **Always use translation keys** - Never hardcode text
2. **Organize by section** - Group related translations together
3. **Keep keys descriptive** - Use clear, descriptive key names
4. **Test all languages** - Verify translations work in all 4 languages
5. **Update all languages** - When adding new keys, add translations for all 4 languages

## Current Status

✅ **Fully Translated:**
- HomeFinal.tsx (Main homepage)
- Navigation bar
- Hero section
- Features section
- Categories section
- How It Works section
- Testimonials section
- CTA section
- Footer
- FloatingChatBot (initial greeting)

🔄 **Needs Translation:**
- AboutUs.tsx
- FAQ.tsx
- ContactUs.tsx
- HowItWorks.tsx
- Blog pages
- Other components

## Quick Start for New Components

1. Import: `import { useTranslation } from "../hooks/useTranslation";`
2. Use hook: `const t = useTranslation();`
3. Replace text: `{t.nav.home}` instead of `"Home"`
4. Add missing keys to translations file if needed

## Language Codes

- `en` - English
- `am` - Amharic (አማርኛ)
- `ti` - Tigrinya (ትግርኛ)
- `om` - Afan Oromo (Afaan Oromoo)

---

**The translation system is ready!** Select a language from the navbar and watch the entire HomeFinal page translate automatically! 🎉
