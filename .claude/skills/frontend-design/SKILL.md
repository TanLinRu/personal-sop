---
name: frontend-design
description: Create distinctive, production-grade frontend interfaces with high design quality. Use this skill when the user asks to build web components, pages, artifacts, posters, or applications (examples include websites, landing pages, dashboards, React components, HTML/CSS layouts, or when styling/beautifying any web UI). Generates creative, polished code and UI design that avoids generic AI aesthetics.
license: Complete terms in LICENSE.txt
triggers:
  - "前端页面"
  - "页面设计"
  - "UI设计"
  - "组件开发"
  - "/frontend"
---

This skill guides creation of distinctive, production-grade frontend interfaces that avoid generic "AI slop" aesthetics. Implement real working code with exceptional attention to aesthetic details and creative choices.

The user provides frontend requirements: a component, page, application, or interface to build. They may include context about the purpose, audience, or technical constraints.

## Project UI Stack

This project uses **Vue 3 + Naive UI**. When implementing components, leverage Naive UI's built-in components and theming capabilities first before custom styling.

### Naive UI Integration Guidelines

- **Use Naive UI components** as building blocks: `n-button`, `n-card`, `n-form`, `n-table`, `n-modal`, `n-layout`, `n-menu`, etc.
- **Customize theme** via `n-config-provider` and CSS variables for consistent branding
- **Extend with slot customization** for unique visual effects while maintaining functionality
- **Combine with custom CSS** for distinctive aesthetics that go beyond default component styles

### Common Naive UI Patterns

```vue
<template>
  <n-config-provider :theme-overrides="themeOverrides">
    <n-message-provider>
      <n-dialog-provider>
        <n-layout>
          <n-card>
            <!-- Component content -->
          </n-card>
        </n-layout>
      </n-dialog-provider>
    </n-message-provider>
  </n-config-provider>
</template>

<script setup>
const themeOverrides = {
  common: {
    primaryColor: '#18a058',
    primaryColorHover: '#36ad6a',
    borderRadius: '8px'
  }
}
</script>
```

## Design Thinking

Before coding, understand the context and commit to a BOLD aesthetic direction:
- **Purpose**: What problem does this interface solve? Who uses it?
- **Tone**: Pick an extreme: brutally minimal, maximalist chaos, retro-futuristic, organic/natural, luxury/refined, playful/toy-like, editorial/magazine, brutalist/raw, art deco/geometric, soft/pastel, industrial/utilitarian, etc. There are so many flavors to choose from. Use these for inspiration but design one that is true to the aesthetic direction.
- **Constraints**: Technical requirements (framework, performance, accessibility).
- **Differentiation**: What makes this UNFORGETTABLE? What's the one thing someone will remember?

**CRITICAL**: Choose a clear conceptual direction and execute it with precision. Bold maximalism and refined minimalism both work - the key is intentionality, not intensity.

Then implement working code (HTML/CSS/JS, React, Vue, etc.) that is:
- Production-grade and functional
- Visually striking and memorable
- Cohesive with a clear aesthetic point-of-view
- Meticulously refined in every detail

## Frontend Aesthetics Guidelines

Focus on:
- **Typography**: Choose fonts that are beautiful, unique, and interesting. Avoid generic fonts like Arial and Inter; opt instead for distinctive choices that elevate the frontend's aesthetics; unexpected, characterful font choices. Pair a distinctive display font with a refined body font.
- **Color & Theme**: Commit to a cohesive aesthetic. Use CSS variables for consistency. Dominant colors with sharp accents outperform timid, evenly-distributed palettes.
- **Motion**: Use animations for effects and micro-interactions. Prioritize CSS-only solutions for HTML. Use Motion library for React when available. Focus on high-impact moments: one well-orchestrated page load with staggered reveals (animation-delay) creates more delight than scattered micro-interactions. Use scroll-triggering and hover states that surprise.
- **Spatial Composition**: Unexpected layouts. Asymmetry. Overlap. Diagonal flow. Grid-breaking elements. Generous negative space OR controlled density.
- **Backgrounds & Visual Details**: Create atmosphere and depth rather than defaulting to solid colors. Add contextual effects and textures that match the overall aesthetic. Apply creative forms like gradient meshes, noise textures, geometric patterns, layered transparencies, dramatic shadows, decorative borders, custom cursors, and grain overlays.

NEVER use generic AI-generated aesthetics like overused font families (Inter, Roboto, Arial, system fonts), cliched color schemes (particularly purple gradients on white backgrounds), predictable layouts and component patterns, and cookie-cutter design that lacks context-specific character.

Interpret creatively and make unexpected choices that feel genuinely designed for the context. No design should be the same. Vary between light and dark themes, different fonts, different aesthetics. NEVER converge on common choices (Space Grotesk, for example) across generations.

**IMPORTANT**: Match implementation complexity to the aesthetic vision. Maximalist designs need elaborate code with extensive animations and effects. Minimalist or refined designs need restraint, precision, and careful attention to spacing, typography, and subtle details. Elegance comes from executing the vision well.

Remember: Claude is capable of extraordinary creative work. Don't hold back, show what can truly be created when thinking outside the box and committing fully to a distinctive vision.

## Naive UI Component Selection Guide

Use the right component for the right context:

| Scenario | Recommended Component |
|----------|----------------------|
| Data display with pagination | `n-data-table` |
| Form inputs with validation | `n-form` + `n-form-item` |
| Status indicators | `n-tag`, `n-badge`, `n-progress` |
| Dashboard cards | `n-card` with `n-statistic` |
| Navigation menus | `n-menu`, `n-breadcrumb` |
| Dialogs and confirmations | `n-modal`, `n-dialog` |
| Notifications | `n-message`, `n-notification` |
| Layout containers | `n-layout`, `n-layout-sider`, `n-layout-content` |
| Loading states | `n-spin`, `n-skeleton` |
| Filter/search panels | `n-select`, `n-input`, `n-date-picker` |

## Customizing Naive UI

### Theme Overrides

```javascript
const themeOverrides = {
  common: {
    primaryColor: '#18a058',
    primaryColorHover: '#36ad6a',
    primaryColorPressed: '#0c7a43',
    borderRadius: '8px',
    fontFamily: 'Inter, sans-serif',
  },
  Button: {
    textColorPrimary: '#ffffff',
    borderRadiusMedium: '8px',
  },
  Card: {
    borderRadius: '12px',
    paddingMedium: '20px',
  },
  DataTable: {
    borderRadius: '8px',
  }
}
```

### Dark Mode Support

```vue
<template>
  <n-config-provider :theme="isDark ? darkTheme : null">
    <!-- App content -->
  </n-config-provider>
</template>

<script setup>
import { darkTheme } from 'naive-ui'
const isDark = ref(false)
</script>
```

### Custom Slot Example

```vue
<n-button>
  <template #icon>
    <n-icon><SearchIcon /></n-icon>
  </template>
  Search
</n-button>
```
