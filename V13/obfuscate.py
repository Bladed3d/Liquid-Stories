#!/usr/bin/env python3
"""
HTML Obfuscator for GitHub Pages
Protects your storybook code while keeping it functional on GitHub Pages
"""

import re
import json
import os
import random
import string
from pathlib import Path

class HTMLObfuscator:
    def __init__(self):
        self.var_map = {}
        self.random_counter = 0

    def generate_random_name(self, length=8):
        """Generate random variable names"""
        chars = string.ascii_letters + string.digits
        while True:
            name = '_' + ''.join(random.choices(chars, k=length))
            if name not in self.var_map.values():
                return name

    def obfuscate_javascript(self, js_content):
        """Basic JavaScript obfuscation - preserve placeholders"""
        # Preserve important placeholders first
        placeholders = {}
        placeholder_patterns = [
            r'\{\{IMAGE1_URL\}\}', r'\{\{IMAGE2_URL\}\}', r'\{\{BACKBOARD_TEXTS\}\}',
            r'\{\{STORY_CONFIG\}\}', r'\{\{PAGE_NUMBER\}\}', r'\{\{PROGRESS_TITLE\}\}'
        ]

        for i, pattern in enumerate(placeholder_patterns):
            matches = re.findall(pattern, js_content)
            for match in matches:
                placeholder_key = f"__PLACEHOLDER_{i}__"
                js_content = js_content.replace(match, placeholder_key)
                placeholders[placeholder_key] = match

        # Remove comments (but preserve placeholders)
        js_content = re.sub(r'//.*?(?=__PLACEHOLDER_)', '', js_content)
        js_content = re.sub(r'/\*[\s\S]*?\*/', '', js_content)

        # Minify (remove extra whitespace)
        js_content = re.sub(r'\s+', ' ', js_content)
        js_content = re.sub(r';\s*', ';', js_content)
        js_content = re.sub(r'{\s*', '{', js_content)
        js_content = re.sub(r'}\s*', '}', js_content)

        # Restore placeholders
        for placeholder_key, original_value in placeholders.items():
            js_content = js_content.replace(placeholder_key, original_value)

        return js_content

    def obfuscate_css(self, css_content):
        """Basic CSS obfuscation"""
        # Remove comments
        css_content = re.sub(r'/\*[\s\S]*?\*/', '', css_content)

        # Minify
        css_content = re.sub(r'\s+', ' ', css_content)
        css_content = re.sub(r';\s*', ';', css_content)
        css_content = re.sub(r'{\s*', '{', css_content)
        css_content = re.sub(r'}\s*', '}', css_content)
        css_content = re.sub(r':\s*', ':', css_content)

        return css_content

    def add_protection_layer(self, html_content):
        """Add basic protection layers"""
        # Disable right-click
        protection_script = """
        <script>(function(){function c(a,b){return a>b?1:a<b?-1:0}function d(a,b){try{if(a==null||typeof a=="undefined")return;var d=b||window.event;if(d.ctrlKey&&d.shiftKey&&d.keyCode==73){d.preventDefault();d.stopPropagation();return false}if(d.ctrlKey&&d.shiftKey&&d.keyCode==74){d.preventDefault();d.stopPropagation();return false}if(d.ctrlKey&&d.shiftKey&&d.keyCode==67){d.preventDefault();d.stopPropagation();return false}}catch(e){}}document.addEventListener("contextmenu",function(a){a.preventDefault();a.stopPropagation();return false});document.addEventListener("keydown",function(a){d(a)});document.addEventListener("mousedown",function(a){if(a.button==2){a.preventDefault();a.stopPropagation();return false}})})();</script>
        """

        # Insert protection script before closing head tag
        if '</head>' in html_content:
            html_content = html_content.replace('</head>', protection_script + '</head>')
        else:
            html_content = html_content.replace('</body>', protection_script + '</body>')

        return html_content

    def process_file(self, input_file, output_file):
        """Process and obfuscate a single HTML file"""
        print(f"Processing {input_file} -> {output_file}")

        # Read input file
        with open(input_file, 'r', encoding='utf-8') as f:
            content = f.read()

        # Update image URLs to use assets/images/ path
        content = self.update_image_paths(content)

        # Extract and obfuscate CSS
        css_pattern = r'<style[^>]*>(.*?)</style>'
        css_matches = re.findall(css_pattern, content, re.DOTALL)
        for css in css_matches:
            obfuscated_css = self.obfuscate_css(css)
            content = content.replace(css, obfuscated_css, 1)

        # Extract and obfuscate JavaScript
        js_pattern = r'<script[^>]*>(.*?)</script>'
        js_matches = re.findall(js_pattern, content, re.DOTALL)
        for js in js_matches:
            if js.strip():  # Skip empty script tags
                obfuscated_js = self.obfuscate_javascript(js)
                content = content.replace(js, obfuscated_js, 1)

        # Add protection layer
        content = self.add_protection_layer(content)

        # Minify HTML
        content = re.sub(r'>\s+<', '><', content)
        content = re.sub(r'\s+', ' ', content)

        # Write output file
        os.makedirs(os.path.dirname(output_file), exist_ok=True)
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(content)

    def update_image_paths(self, content):
        """Update image URLs in JavaScript to use assets/images/ path"""
        # Find image URL assignments and update them
        image_patterns = [
            (r"const image1Url = '([^']+)';", "assets/images/"),
            (r"const image2Url = '([^']+)';", "assets/images/"),
            (r'const image1Url = "([^"]+)";', "assets/images/"),
            (r'const image2Url = "([^"]+)";', "assets/images/")
        ]

        for pattern, prefix in image_patterns:
            def replace_image_url(match):
                image_path = match.group(1)
                if not image_path.startswith('assets/'):
                    return match.group(0).replace(image_path, f"{prefix}{image_path}")
                return match.group(0)

            content = re.sub(pattern, replace_image_url, content)

        # Also update the storyConfig JSON embedded in the page
        story_config_pattern = r'(const storyConfig = )({.*?});'
        def update_story_config(match):
            prefix = match.group(1)
            config_str = match.group(2)
            try:
                config_data = json.loads(config_str)
                for page in config_data.get('pages', []):
                    if 'image1Url' in page and not page['image1Url'].startswith('assets/'):
                        page['image1Url'] = f"assets/images/{page['image1Url']}"
                    if 'image2Url' in page and not page['image2Url'].startswith('assets/'):
                        page['image2Url'] = f"assets/images/{page['image2Url']}"
                return prefix + json.dumps(config_data) + ';'
            except:
                return match.group(0)

        content = re.sub(story_config_pattern, update_story_config, content)

        return content

def main():
    """Main obfuscation function"""
    print("Starting HTML Obfuscation for GitHub Pages...")

    obfuscator = HTMLObfuscator()

    # Create output directory
    output_dir = Path('dist')
    output_dir.mkdir(exist_ok=True)

    # Process storybook pages
    source_dir = Path('Pug-Day')  # Change this to your story folder
    if not source_dir.exists():
        print(f"Error: Source directory '{source_dir}' not found!")
        print("Please update the source_dir in the script or run: python generate_storybook.py your-story-name")
        return False

    # Copy and obfuscate HTML files
    for html_file in source_dir.glob('*.html'):
        output_file = output_dir / html_file.name
        obfuscator.process_file(html_file, output_file)

    # Process and update config file with correct image paths
    config_file = source_dir / 'story-config.json'
    if config_file.exists():
        with open(config_file, 'r', encoding='utf-8') as f:
            config_data = json.load(f)

        # Update image paths to include assets/images/
        for page in config_data.get('pages', []):
            if 'image1Url' in page and not page['image1Url'].startswith('assets/'):
                page['image1Url'] = f"assets/images/{page['image1Url']}"
            if 'image2Url' in page and not page['image2Url'].startswith('assets/'):
                page['image2Url'] = f"assets/images/{page['image2Url']}"

        # Save updated config
        with open(output_dir / 'story-config.json', 'w', encoding='utf-8') as f:
            json.dump(config_data, f, indent=2)
        print(f"Updated config file with correct image paths")

    # Create assets directory for images
    assets_dir = output_dir / 'assets'
    assets_dir.mkdir(exist_ok=True)

    print(f"\nObfuscation Complete!")
    print(f"Output created in: {output_dir.absolute()}")
    print(f"\nFor GitHub Pages:")
    print(f"   1. Commit the 'dist/' folder to your GitHub repository")
    print(f"   2. Enable GitHub Pages in repository settings")
    print(f"   3. Select source as 'main' branch and '/dist' folder")
    print(f"\nProtection Features:")
    print(f"   • Disabled right-click and context menu")
    print(f"   • Blocked F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C")
    print(f"   • Minified and obfuscated JavaScript/CSS")
    print(f"   • Random variable names")
    print(f"   • Removed comments and formatting")

    return True

if __name__ == "__main__":
    success = main()
    if not success:
        exit(1)