#!/usr/bin/env python3
"""
Simple Python Storybook Generator
Generate HTML pages from JSON configuration - no JavaScript complexity!
"""

import json
import os
import sys
from pathlib import Path

def get_story_name():
    """Get story name from command line argument or config"""
    if len(sys.argv) > 1:
        return sys.argv[1]

    # Try to get from config file
    try:
        with open('story-config.json', 'r', encoding='utf-8') as f:
            config = json.load(f)
            # Convert title to filename-friendly format
            title = config.get('story', {}).get('title', 'my-story')
            # Replace spaces with hyphens and remove special chars
            clean_title = ''.join(c if c.isalnum() or c in '-_' else '-' for c in title.lower())
            return clean_title.strip('-') or 'my-story'
    except:
        return 'my-story'

def load_config():
    """Load the story configuration from JSON file"""
    try:
        with open('story-config.json', 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        print("Error: story-config.json not found!")
        return None
    except json.JSONDecodeError as e:
        print(f"Error in story-config.json: {e}")
        return None

def load_template():
    """Load the HTML template"""
    try:
        with open('template.html', 'r', encoding='utf-8') as f:
            return f.read()
    except FileNotFoundError:
        print("Error: template.html not found!")
        return None

def generate_page(template, config, page_data, page_number):
    """Generate a single HTML page with template replacements"""

    # Prepare story config for JavaScript
    story_config_json = json.dumps(config)

    # Prepare backboard texts
    backboard_texts_json = json.dumps(page_data['backboardTexts'])

    # Handle logo URL
    logo_url = page_data.get('logoUrl', None)
    logo_target_url = page_data.get('logoTargetUrl', None)

    if logo_url:
        logo_declaration = f"const gamestopLogoUrl = '{logo_url}';"
        logo_target_declaration = f"const logoTargetUrl = '{logo_target_url}';" if logo_target_url else ""
        logo_rendering = f"""// Draw logo below the backboard text
            const gamestopImg = new Image();
            gamestopImg.src = gamestopLogoUrl;
            gamestopImg.onload = () => {{
                const logoWidth = 300;
                const logoHeight = (gamestopImg.height / gamestopImg.width) * logoWidth;
                const logoX = bgCanvas.width / 2 - logoWidth / 2;
                const logoY = bgCanvas.height / 2 + 120;
                bgCtx.drawImage(gamestopImg, logoX, logoY, logoWidth, logoHeight);

                // Store logo position for hover detection
                logoPosition = {{
                    x: logoX,
                    y: logoY,
                    width: logoWidth,
                    height: logoHeight
                }};
            }};"""
    else:
        logo_declaration = ""
        logo_target_declaration = ""
        logo_rendering = ""

    # Make replacements
    html = template.replace('{{STORY_TITLE}}', config['story']['title'])
    html = html.replace('{{PAGE_NUMBER}}', str(page_number))
    html = html.replace('{{STORY_CONFIG}}', story_config_json)
    html = html.replace('{{IMAGE1_URL}}', page_data['image1Url'])
    html = html.replace('{{IMAGE2_URL}}', page_data['image2Url'])
    html = html.replace('{{BACKBOARD_TEXTS}}', backboard_texts_json)
    html = html.replace('{{PROGRESS_TITLE}}', page_data.get('progressTitle', f'Page {page_number}'))
    html = html.replace('{{LOGO_URL_DECLARATION}}', logo_declaration)
    html = html.replace('{{LOGO_TARGET_URL}}', logo_target_declaration)
    html = html.replace('{{LOGO_RENDERING_CODE}}', logo_rendering)

    return html

def main():
    """Main generation function"""
    # Get story name from command line or config
    story_name = get_story_name()

    print(f"Starting Storybook Generation for '{story_name}'...")

    # Load configuration and template
    config = load_config()
    template = load_template()

    if not config or not template:
        return False

    # Create and clear generated folder
    generated_folder = Path(story_name)
    generated_folder.mkdir(exist_ok=True)

    # Clear existing HTML files
    for file in generated_folder.glob('*.html'):
        file.unlink()
    print(f"Cleared folder: {generated_folder}")

    # Generate each page
    total_pages = len(config['pages'])

    for i, page_data in enumerate(config['pages'], 1):
        if i != page_data['pageNumber']:
            print(f"Warning: Page array index {i} doesn't match pageNumber {page_data['pageNumber']}")
            continue

        print(f"Generating page {i}/{total_pages}: {page_data.get('progressTitle', f'Page {i}')}")

        # Generate HTML for this page
        html_content = generate_page(template, config, page_data, i)

        # Save to file
        output_file = generated_folder / f"page-{i}.html"
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(html_content)

        print(f"   Created {output_file}")

    # Copy story config to generated folder
    config_output = generated_folder / 'story-config.json'
    with open(config_output, 'w', encoding='utf-8') as f:
        json.dump(config, f, indent=2)

    print(f"\nSUCCESS! Generated {total_pages} storybook pages in '{story_name}/' folder!")
    print(f"\nNext Steps:")
    print(f"   1. Copy your image files to the '{story_name}/' folder")
    for i, page_data in enumerate(config['pages'], 1):
        print(f"   2. Add {page_data['image1Url']} and {page_data['image2Url']}")
    print(f"   3. Open '{story_name}/page-1.html' to start your story!")
    print(f"\nPages created:")
    for i in range(1, total_pages + 1):
        print(f"   {story_name}/page-{i}.html")

    return True

if __name__ == "__main__":
    success = main()
    if not success:
        print("\nGeneration failed. Check the errors above.")
        exit(1)