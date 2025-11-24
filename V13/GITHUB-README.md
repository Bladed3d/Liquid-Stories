# Interactive Storybook

An immersive particle-based storytelling experience with timeline navigation and interactive image transformations.

## 🎮 How to Experience

This storybook is hosted on GitHub Pages and includes protection features to preserve the interactive experience.

### Quick Start
1. **View the Story**: [Open Interactive Storybook](https://[your-username].github.io/[your-repo]/)
2. **Interact**: Move your mouse (desktop) or drag the puck (mobile) to transform images
3. **Navigate**: Click timeline circles to jump between pages
4. **Discover**: Complete each page transformation to advance the story

## 🛡️ Protection Features

This implementation includes multiple layers of code protection:
- **Disabled Right-Click**: Prevents context menu access
- **Blocked Developer Tools**: Blocks F12 and Ctrl+Shift combinations
- **Obfuscated Code**: JavaScript and CSS are minified and scrambled
- **Random Variables**: Variable names are randomized to prevent reverse engineering

## 📁 Project Structure

```
dist/                    # GitHub Pages content (obfuscated)
├── page-1.html          # Story page 1
├── page-2.html          # Story page 2
├── page-3.html          # Story page 3
├── story-config.json    # Story configuration
├── assets/              # Image assets
│   └── images/
└── README.md

V13/                     # Development files
├── generate_storybook.py    # Python generator
├── template.html           # HTML template
├── story-config.json       # Story configuration
├── obfuscate.py            # Protection script
└── README.md
```

## 🚀 Development

### Prerequisites
- Python 3.6+
- Story images (1024x1024 PNG format)

### Generate Your Own Storybook

1. **Configure Your Story**
   ```bash
   # Edit story-config.json with your story details
   ```

2. **Generate Pages**
   ```bash
   python generate_storybook.py your-story-name
   ```

3. **Add Your Images**
   ```bash
   # Copy your image files to the generated folder
   ```

4. **Protect for GitHub Pages**
   ```bash
   python obfuscate.py
   ```

5. **Deploy to GitHub**
   ```bash
   git add dist/
   git commit -m "Add protected storybook"
   git push origin main
   ```

### Story Configuration Format

```json
{
  "story": {
    "title": "Your Story Title",
    "pageCount": 3
  },
  "pages": [
    {
      "pageNumber": 1,
      "image1Url": "start-image.png",
      "image2Url": "end-image.png",
      "progressTitle": "Chapter Title",
      "backboardTexts": [
        { "text": "Display Text", "yOffset": -60, "color": "#fe0048", "size": 56 }
      ]
    }
  ]
}
```

## 🎨 Features

- **Particle Physics**: Fluid particle system with realistic physics
- **Image Transformations**: Smooth transitions between story images
- **Timeline Navigation**: Click any page to jump directly to that chapter
- **Progress Tracking**: Visual progress bar shows story completion
- **Mobile Support**: Touch-enabled for mobile devices
- **Reverse Mode**: Transform images back to original state
- **Auto-Navigation**: Automatic page transitions upon completion

## 🌐 Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## 📱 Mobile Experience

- Touch and drag puck interaction
- Responsive design
- Mobile-optimized controls
- Gesture-based navigation

## 🔧 Customization

### Colors & Styling
- Modify CSS variables in `template.html`
- Custom gradient colors for progress bars
- Timeline node colors and animations

### Particle Behavior
- Adjust `influenceRadius` for interaction range
- Modify particle count and density
- Customize physics parameters

## 📄 License

This project is protected by intellectual property laws. The obfuscated production files are for demonstration purposes only. Contact the author for licensing information.

## 🤝 Contributing

This is a creative work project. Development contributions are not accepted for this protected implementation.

## 📞 Contact

For licensing and collaboration inquiries, please contact the project author.

---

**Made with ❤️ and Particle Physics**

*This is a protected implementation. All rights reserved.*