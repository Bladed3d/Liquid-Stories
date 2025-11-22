---
name: frontend-design
description: Create distinctive, production-grade frontend interfaces with high design quality. Use this skill when the user asks to build web components, pages, or applications. Generates creative, polished code that avoids generic AI aesthetics.
license: Complete terms in LICENSE.txt
---

This skill guides creation of distinctive, production-grade frontend interfaces that avoid generic "AI slop" aesthetics. Implement real working code with exceptional attention to aesthetic details and creative choices.

The user provides frontend requirements: a component, page, application, or interface to build. They may include context about the purpose, audience, or technical constraints.

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

## Technical Implementation & Responsive Design

Beautiful designs must work flawlessly across all devices. Follow these technical patterns to ensure responsive, production-grade implementations:

### Grid Layout Overflow Prevention

When using CSS Grid for responsive layouts, prevent horizontal overflow and ensure content scales properly:

```css
/* Container */
.container {
  w-full max-w-7xl mx-auto px-6
}

/* Grid */
.grid {
  grid lg:grid-cols-2 gap-8 lg:gap-12 items-stretch
}

/* Grid Items - CRITICAL */
.grid-item {
  min-w-0          /* Allows items to shrink below content size */
  w-full           /* Uses full available width */
  max-w-full       /* Prevents overflow beyond parent */
}
```

**Why `min-w-0` matters:** By default, grid items won't shrink below their content's minimum width, causing overflow. `min-w-0` allows them to shrink and wrap content properly.

### Video & Media Sizing

Choose the right object-fit property based on your design intent:

**`object-contain`** (Show entire media, may have letterboxing)
```tsx
<video className="w-full h-full object-contain" />
```
- ✅ Use when: Content must never be cropped (logos, product shots, animations)
- ⚠️ Result: Black bars if aspect ratios don't match

**`object-cover`** (Fill container, may crop content)
```tsx
<video className="w-full h-full object-cover" />
```
- ✅ Use when: Visual atmosphere matters more than showing everything (backgrounds, hero videos)
- ⚠️ Result: Content may be cropped at edges

**Centering media in containers:**
```tsx
<div className="flex items-center justify-center">
  <video className="object-contain" />
</div>
```

### Responsive Breakpoints

Use a mobile-first approach with strategic breakpoints:

```tsx
// Stack on mobile/tablet, side-by-side on desktop
<div className="grid lg:grid-cols-2 gap-8">
  {/* Content */}
</div>

// Responsive spacing
<div className="gap-8 lg:gap-12">  {/* Smaller gap on mobile, larger on desktop */}
<div className="p-6 lg:p-10">     {/* Less padding on mobile, more on desktop */}
```

**Tailwind Breakpoints:**
- `sm:` 640px+ (large phones, small tablets)
- `md:` 768px+ (tablets)
- `lg:` 1024px+ (desktops) ← **Use this for side-by-side layouts**
- `xl:` 1280px+ (large desktops)

**Why `lg:` for split layouts:** Tablet screens (768-1024px) are often too narrow for comfortable side-by-side reading. Use `lg:grid-cols-2` to keep content stacked until there's sufficient space.

### Container Constraints

Prevent layout breaks with proper width management:

```tsx
{/* Responsive container pattern */}
<div className="w-full max-w-7xl mx-auto px-6">
  {/* w-full: Use full viewport width on mobile */}
  {/* max-w-7xl: Cap width on large screens (1280px) */}
  {/* mx-auto: Center horizontally */}
  {/* px-6: Prevent content from touching screen edges */}
</div>
```

### Aspect Ratio Containers

For media with specific aspect ratios:

```tsx
{/* Square container (1:1) */}
<div className="aspect-square w-full max-w-full min-w-0">
  <video className="w-full h-full object-contain" />
</div>

{/* Video container (16:9) */}
<div className="aspect-video w-full">
  <video className="w-full h-full object-cover" />
</div>
```

**Common aspect ratios:**
- `aspect-square` (1:1)
- `aspect-video` (16:9)
- `aspect-[4/3]` (4:3)
- `aspect-[21/9]` (ultrawide)

### Testing Responsive Design

Always test these scenarios:
1. **Mobile portrait** (320px-428px width)
2. **Tablet portrait** (768px-834px width)
3. **Tablet landscape** (1024px-1112px width)
4. **Desktop** (1280px+ width)
5. **Narrow browser windows** (resize to minimum)

Use browser DevTools responsive mode and test on actual devices when possible.
