# App Icons

This directory contains the PWA app icons for Gym Logger.

## Required Icon Sizes

The following icon sizes are needed for full PWA support:

- **72x72** - Android small icon
- **96x96** - Android medium icon
- **128x128** - Android large icon
- **144x144** - Android extra large icon
- **152x152** - iOS iPad icon
- **192x192** - Android launcher icon (standard)
- **384x384** - Android launcher icon (high-res)
- **512x512** - Android launcher icon (extra high-res), PWA splash screen

## Icon Requirements

- Format: PNG with transparency
- Content: Centered "💪" emoji or gym-themed logo
- Background: Blue (#2563eb) to match theme color
- Padding: 10% around the main icon content
- Purpose: "any maskable" - works on all platforms including adaptive icons

## Generating Icons

You can use the included script to generate placeholder icons:

```bash
npm run generate-icons
```

Or use online tools:
- https://realfavicongenerator.net/
- https://www.pwabuilder.com/imageGenerator
- https://favicon.io/

## Current Icons

Placeholder icons are generated automatically if missing. For production, replace these with professionally designed icons.
