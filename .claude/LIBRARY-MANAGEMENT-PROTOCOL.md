# Library Management Protocol

**Claude's workflow for adding files to Derek's Reference Library**

---

## Quick Overview

```
User places file in unsorted → Claude checks duplicates → Claude processes → Claude adds to library → Claude indexes → Searchable
```

---

## When User Adds a File

When the user places a file in `Saved/Derek/Reference-Library/unsorted/`, Claude will:

### Step 1: Check for Duplicates
Search across the entire library to ensure the file isn't already present.
```bash
find /d/Projects/Ai/Liquid-Stories/Saved/Derek -type f -iname "*KEYWORD*"
grep -r -l "exact phrase" /d/Projects/Ai/Liquid-Stories/Saved/Derek/
```

### Step 2: Process by File Type

#### Documents (.odt, .rtf, .doc)
Convert to .txt using:
```bash
powershell -ExecutionPolicy Bypass -File "Saved/Derek/Reference-Library/scripts/convert-odt-universal.ps1" -Files "path\to\file.odt"
```

#### Documents (.docx, .pdf, .md, .txt)
Use as-is, move to appropriate location, no conversion needed

#### Images (.png, .jpg, .jpeg, .gif, .webp)
1. Move to `images/` subfolder by category
2. Add entry to `images/IMAGE-CATALOG.md`
3. No indexing needed (catalog provides reference)

### Step 3: Place File in Correct Location

| File Type | Location |
|-----------|----------|
| Lesson content | `Projects/2-Minutes-HOOT/daily-lessons/` |
| Reference by topic | `Reference-Library/Topics/[Topic-Name]/` |
| Book cover images | `Reference-Library/images/book-covers/` |
| Character images | `Reference-Library/images/characters/` |
| Concept images | `Reference-Library/images/concepts/` |
| Other images | `Reference-Library/images/other/` |
| Converted source | `Reference-Library/unsorted/archive/` |

### Step 4: Update Records

**For documents:** Integrate into topic file (`past-writings.md` or `key-insights.md`) if appropriate
**For images:** Add entry to `images/IMAGE-CATALOG.md`

### Step 5: Re-index (documents only)
```bash
cd Saved/Derek/Reference-Library/scripts
python index.py --topic "Topic-Name"
```

---

## Library Structure

```
Saved/Derek/Reference-Library/
├── Topics/                    # Organized by subject
│   ├── Higher-Order-Of-Thought/
│   ├── Leadership/
│   ├── Business-Wisdom/
│   └── [other topics]/
├── images/                    # Image library
│   ├── book-covers/          # Book and project covers
│   ├── characters/           # Character designs
│   ├── concepts/             # Concept art, visual ideas
│   ├── other/                # Uncategorized images
│   └── IMAGE-CATALOG.md      # Image index
└── unsorted/                  # Incoming files (user drops here)
    ├── archive/               # Processed/converted files
    └── [incoming files]/
```

---

## Claude's Reference Commands

### Check Duplicates
```bash
# By filename
find /d/Projects/Ai/Liquid-Stories/Saved/Derek -type f -iname "*KEYWORD*"

# By content
grep -r -l "exact phrase" /d/Projects/Ai/Liquid-Stories/Saved/Derek/

# Via search index
cd Saved/Derek/Reference-Library/scripts
python search.py "search terms" --limit 10

# Check image catalog
grep -i "keyword" /d/Projects/Ai/Liquid-Stories/Saved/Derek/Reference-Library/images/IMAGE-CATALOG.md
```

### Process Files
```bash
# Convert documents
powershell -ExecutionPolicy Bypass -File "scripts/convert-odt-universal.ps1" -Files "file.odt"

# Move images (done manually)
mv "unsorted/image.png" "images/book-covers/Descriptive-Name.png"
```

### Index Library
```bash
cd scripts
python index.py              # Full index
python index.py --topic "X"  # Topic-specific
python index.py --info       # Status check
```

---

## File Format Guide

| Format | Indexable | Action |
|--------|-----------|--------|
| .md | Yes | Use as-is |
| .txt | Yes | Use as-is |
| .odt | No | Convert to .txt |
| .pdf | Yes | Use as-is |
| .rtf | Partial | Convert to .txt |
| .docx | Yes | Use as-is (fully supported) |
| .doc | No | Convert to .txt |
| .png/.jpg | No | Add to images/ + catalog |
| .gif/.webp | No | Add to images/ + catalog |

---

## Image Categories

| Category | Use For | Example |
|----------|---------|---------|
| book-covers | Book/project covers | The-Third-Path-Cover.png |
| characters | Character art, portraits | Angel-Progress.png |
| concepts | Visual ideas, concepts | Meditation-Diagram.png |
| other | Everything else | Screenshot.png |

---

Created: 2026-01-04
Purpose: Claude adds files to library, user just drops them in unsorted
Updated: 2026-01-04 - Added image support
