# Vue Black Dashboard Style Integration Guide

This guide explains how to extract and integrate styles from the Vue Black Dashboard template into this project.

## Overview

This project uses only the **styles** from Vue Black Dashboard, not the component structure or routing. This allows you to maintain your own application flow while using the beautiful design system.

## Directory Structure

```
src/styles/
├── main.scss                    # Main entry point (imported in main.ts)
├── scss/
│   ├── _black-dashboard.scss   # Main dashboard styles file
│   ├── _variables.scss         # SCSS variables (colors, fonts, etc.)
│   ├── _mixins.scss            # SCSS mixins
│   ├── _base.scss              # Base/reset styles
│   ├── _components.scss        # Component styles
│   └── _utilities.scss         # Utility classes
└── STYLE_INTEGRATION_GUIDE.md  # This file
```

## Step-by-Step Integration

### 1. Locate Vue Black Dashboard Template Files

The Vue Black Dashboard template typically has its styles in one of these locations:
- `src/assets/scss/` or `src/assets/sass/`
- `src/scss/` or `src/sass/`
- `assets/scss/` or `assets/sass/`

### 2. Extract Core Style Files

Copy the following files from the template to `src/styles/scss/`:

#### Essential Files:
- **Variables** (`_variables.scss` or similar): Contains color definitions, font sizes, spacing, etc.
- **Mixins** (`_mixins.scss` or similar): Contains reusable SCSS mixins
- **Base Styles**: Reset styles, typography, etc.
- **Component Styles**: Styles for cards, buttons, forms, tables, etc.

#### Common Files to Look For:
- `_variables.scss` or `variables.scss`
- `_mixins.scss` or `mixins.scss`
- `_buttons.scss` or `buttons.scss`
- `_cards.scss` or `cards.scss`
- `_forms.scss` or `forms.scss`
- `_tables.scss` or `tables.scss`
- `_sidebar.scss` or `sidebar.scss`
- `_navbar.scss` or `navbar.scss`
- `_dashboard.scss` or `dashboard.scss`

### 3. Update `_black-dashboard.scss`

Edit `src/styles/scss/_black-dashboard.scss` to import all the extracted files:

```scss
// Variables and configuration
@import './variables';
@import './mixins';

// Base styles
@import './base';

// Component styles
@import './buttons';
@import './cards';
@import './forms';
@import './tables';
@import './sidebar';
@import './navbar';
@import './dashboard';

// Utilities (if any)
@import './utilities';
```

### 4. Adjust Paths and Variables

After copying the files:

1. **Fix import paths**: Update any `@import` statements in the copied files to use relative paths
2. **Review variables**: Check `_variables.scss` and adjust colors, fonts, or spacing to match your brand
3. **Remove component-specific logic**: Remove any styles that depend on specific component structures you won't use

### 5. Handle Fonts and Assets

Vue Black Dashboard may use custom fonts or icons:

- **Fonts**: Copy font files to `public/fonts/` and update font-face declarations
- **Icons**: If using icon fonts, copy to `public/icons/` or use a CDN
- **Images**: Copy any style-related images to `public/images/`

### 6. Test the Integration

1. Start the dev server: `yarn dev`
2. Check the browser console for any missing file errors
3. Verify styles are applying correctly
4. Adjust as needed

## Common Issues and Solutions

### Issue: Missing font files
**Solution**: Copy font files from the template's `public/fonts/` or `assets/fonts/` directory

### Issue: Icon fonts not loading
**Solution**: Update icon font paths in the SCSS files to point to your `public/` directory

### Issue: Color variables not working
**Solution**: Ensure `_variables.scss` is imported before other files that use those variables

### Issue: Mixins not found
**Solution**: Ensure `_mixins.scss` is imported before files that use the mixins

## Customization

After integration, you can customize:

1. **Colors**: Edit `_variables.scss` to match your brand
2. **Spacing**: Adjust spacing variables for your layout needs
3. **Typography**: Modify font families and sizes
4. **Components**: Remove or modify component styles you don't need

## Notes

- This project uses **Vite**, which has built-in SCSS support (no additional configuration needed)
- Styles are imported globally in `main.ts`
- You can still use scoped styles in Vue components for component-specific styling
- The styles are framework-agnostic - you can use them with any Vue component structure

## Next Steps

1. Extract the style files from vue-black-dashboard-master
2. Copy them to `src/styles/scss/`
3. Update `_black-dashboard.scss` with the correct imports
4. Test and adjust as needed

