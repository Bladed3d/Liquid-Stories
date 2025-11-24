#!/usr/bin/env python3
"""
Simple HTML Protection for GitHub Pages
Less aggressive obfuscation that preserves functionality
"""

import re
import json
import os
import shutil
from pathlib import Path

def update_image_paths(content):
    """Update image URLs to use assets/images/ path"""
    # Update JavaScript image URL assignments
    image_patterns = [
        (r"const image1Url = '([^']+)';", "assets/images/"),
        (r"const image2Url = '([^']+)';", "assets/images/")
    ]

    for pattern, prefix in image_patterns:
        def replace_image_url(match):
            image_path = match.group(1)
            if not image_path.startswith('assets/'):
                return match.group(0).replace(image_path, f"{prefix}{image_path}")
            return match.group(0)

        content = re.sub(pattern, replace_image_url, content)

    # Update storyConfig JSON embedded in the page
    story_config_pattern = r'(const storyConfig = )({.*?});'
    def update_story_config(match):
        prefix = match.group(1)
        config_str = match.group(2)
        try:
            config_data = json.loads(config_str)
            for page in config_data.get('pages', []):
                if 'image1Url' in page and not page['image1Url'].startswith('assets/'):
                    img_url = page['image1Url'].replace('.png.png', '.png')
                    page['image1Url'] = f"assets/images/{img_url}"
                if 'image2Url' in page and not page['image2Url'].startswith('assets/'):
                    img_url = page['image2Url'].replace('.png.png', '.png')
                    page['image2Url'] = f"assets/images/{img_url}"
            return prefix + json.dumps(config_data) + ';'
        except:
            return match.group(0)

    content = re.sub(story_config_pattern, update_story_config, content)
    return content

def add_protection_layer(content):
    """Add basic protection script"""
    protection_script = '''
    <script>
        (function() {
            // Disable right-click
            document.addEventListener('contextmenu', function(e) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            });

            // Disable text selection
            document.addEventListener('selectstart', function(e) {
                e.preventDefault();
                return false;
            });

            // Disable drag
            document.addEventListener('dragstart', function(e) {
                e.preventDefault();
                return false;
            });
        })();
    </script>
    '''

    # Insert protection script before closing head tag
    if '</head>' in content:
        content = content.replace('</head>', protection_script + '</head>')
    else:
        content = content.replace('</body>', protection_script + '</body>')

    return content

def process_file(input_file, output_file):
    """Process and protect a single HTML file"""
    print(f"Processing {input_file} -> {output_file}")

    # Read input file
    with open(input_file, 'r', encoding='utf-8') as f:
        content = f.read()

    # Update image paths
    content = update_image_paths(content)

    # Add protection layer
    content = add_protection_layer(content)

    # Minify HTML (basic)
    content = re.sub(r'>\s+<', '><', content)
    content = re.sub(r'\s+', ' ', content)
    content = content.strip()

    # Write output file
    os.makedirs(os.path.dirname(output_file), exist_ok=True)
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(content)

def main():
    """Main protection function"""
    print("Starting Simple HTML Protection for GitHub Pages...")

    # Create output directory
    output_dir = Path('dist')
    if output_dir.exists():
        shutil.rmtree(output_dir)
    output_dir.mkdir(exist_ok=True)

    # Process storybook pages
    source_dir = Path('Pug-Day')  # Change this to your story folder
    if not source_dir.exists():
        print(f"Error: Source directory '{source_dir}' not found!")
        return False

    # Copy and protect HTML files
    for html_file in source_dir.glob('*.html'):
        output_file = output_dir / html_file.name
        process_file(html_file, output_file)

    # Copy config file with updated paths
    config_file = source_dir / 'story-config.json'
    if config_file.exists():
        with open(config_file, 'r', encoding='utf-8') as f:
            config_data = json.load(f)

        # Update image paths
        for page in config_data.get('pages', []):
            if 'image1Url' in page and not page['image1Url'].startswith('assets/'):
                img_url = page['image1Url'].replace('.png.png', '.png')
                page['image1Url'] = f"assets/images/{img_url}"
            if 'image2Url' in page and not page['image2Url'].startswith('assets/'):
                img_url = page['image2Url'].replace('.png.png', '.png')
                page['image2Url'] = f"assets/images/{img_url}"

        # Save updated config
        with open(output_dir / 'story-config.json', 'w', encoding='utf-8') as f:
            json.dump(config_data, f, indent=2)
        print("Updated config file with correct image paths")

    # Copy images to assets/images
    assets_dir = output_dir / 'assets' / 'images'
    assets_dir.mkdir(parents=True, exist_ok=True)

    # Copy any existing images
    source_images = list(Path('Pug-Day').glob('*.png'))
    for img_file in source_images:
        shutil.copy2(img_file, assets_dir / img_file.name)
        print(f"Copied image: {img_file.name}")

    print(f"\nProtection Complete!")
    print(f"Output created in: {output_dir.absolute()}")
    print(f"\nFor GitHub Pages:")
    print(f"   1. Commit the 'dist/' folder to your GitHub repository")
    print(f"   2. Enable GitHub Pages in repository settings")
    print(f"   3. Select source as 'main' branch and '/dist' folder")
    print(f"\nProtection Features:")
    print(f"   • Disabled right-click and text selection")
    print(f"   • Disabled drag and drop")
    print(f"   • Updated image paths for assets/images/")
    print(f"   • Basic HTML minification")

    return True

if __name__ == "__main__":
    success = main()
    if not success:
        exit(1)