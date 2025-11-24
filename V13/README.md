# V13 Storybook Generator

Simple Python-based storybook generator for local development.

## Files:
- `generate_storybook.py` - Python generator script
- `template.html` - HTML template for story pages
- `story-config.json` - Story configuration
- `generated/` - Generated storybook pages

## Usage:

### Option 1: Custom folder name
```bash
python generate_storybook.py fishing-story
```

### Option 2: Auto-name from config
```bash
python generate_storybook.py
```

**Steps:**
1. Edit `story-config.json` with your story details
2. Run the generator (with optional folder name)
3. Copy your image files to the generated folder
4. Open `[folder-name]/page-1.html` to start your story

**Examples:**
- `python generate_storybook.py fishing` → Creates `fishing/` folder
- `python generate_storybook.py monsters` → Creates `monsters/` folder
- `python generate_storybook.py` → Creates `the-monster-adventure/` folder (from config title)

## Philosophy:
- Simple, reliable Python over complex JavaScript
- Template-based generation with string replacement
- Local file system operations
- Zero browser dependencies