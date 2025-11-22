#!/usr/bin/env python3
"""
Claude Project Template Setup
Automates copying LED Breadcrumbs + Agent Team setup to new projects
"""

import os
import sys
import shutil
import argparse
from pathlib import Path

# ANSI color codes for terminal output
class Colors:
    CYAN = '\033[96m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    GRAY = '\033[90m'
    RESET = '\033[0m'
    BOLD = '\033[1m'

def print_header(text):
    print(f"\n{Colors.CYAN}{Colors.BOLD}{'='*70}{Colors.RESET}")
    print(f"{Colors.CYAN}{Colors.BOLD}{text.center(70)}{Colors.RESET}")
    print(f"{Colors.CYAN}{Colors.BOLD}{'='*70}{Colors.RESET}\n")

def print_success(text):
    print(f"{Colors.GREEN}[OK] {text}{Colors.RESET}")

def print_error(text):
    print(f"{Colors.RED}[ERROR] {text}{Colors.RESET}")

def print_warning(text):
    print(f"{Colors.YELLOW}[WARNING] {text}{Colors.RESET}")

def print_info(text):
    print(f"{Colors.CYAN}{text}{Colors.RESET}")

def get_template_root():
    """Get the template directory path"""
    return Path(__file__).parent.absolute()

def get_led_range_suggestion(project_type=None):
    """Suggest LED range based on project type"""
    ranges = {
        'website': (30, 'Website/UI projects'),
        'backend': (40, 'Backend/API projects'),
        'data': (50, 'Data processing projects'),
        'integration': (60, 'Integration projects'),
        'devops': (70, 'DevOps/Tools projects'),
    }
    return ranges.get(project_type, (40, 'General project'))

def copy_directory(src, dst, description, interactive=True):
    """Copy directory with feedback"""
    try:
        if dst.exists():
            if interactive:
                print_warning(f"{description} already exists at {dst}")
                response = input(f"{Colors.YELLOW}Overwrite? (y/n): {Colors.RESET}").lower()
                if response != 'y':
                    print_info(f"Skipping {description}")
                    return False
            shutil.rmtree(dst)

        shutil.copytree(src, dst)
        print_success(f"Copied {description}")
        return True
    except Exception as e:
        print_error(f"Failed to copy {description}: {e}")
        return False

def process_template(template_path, output_path, replacements):
    """Process template file and replace placeholders"""
    try:
        with open(template_path, 'r', encoding='utf-8') as f:
            content = f.read()

        for key, value in replacements.items():
            content = content.replace(f'{{{{{key}}}}}', str(value))

        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(content)

        return True
    except Exception as e:
        print_error(f"Failed to process template {template_path}: {e}")
        return False

def verify_setup(project_path):
    """Verify that all required files were created"""
    required_files = [
        '.claude/START-HERE.md',
        '.claude/MANDATORY-DEV-PROCESS.md',
        '.claude/AUTO-TEST-PROTOCOL.md',
        '.claude/agents/developer.md',
        '.claude/agents/quality.md',
        'Docs/SYSTEM-BREAKTHROUGHS.md',
        'CLAUDE.md',
    ]

    missing = []
    for file in required_files:
        if not (project_path / file).exists():
            missing.append(file)

    return missing

def setup_project(project_path, project_name, led_range_start, interactive=True):
    """Main setup function"""

    template_root = get_template_root()
    project_path = Path(project_path).absolute()

    # Calculate LED range end
    led_range_end = led_range_start + 9

    # Display configuration
    print_header("Setup Configuration")
    print(f"{Colors.YELLOW}Project Name:  {project_name}{Colors.RESET}")
    print(f"{Colors.YELLOW}Project Path:  {project_path}{Colors.RESET}")
    print(f"{Colors.YELLOW}LED Range:     {led_range_start}000-{led_range_end}999{Colors.RESET}")
    print()

    if interactive:
        response = input(f"{Colors.CYAN}Proceed with setup? (y/n): {Colors.RESET}").lower()
        if response != 'y':
            print_warning("Setup cancelled")
            return False

    print_header("Starting Setup")

    # Create project directory if it doesn't exist
    if not project_path.exists():
        try:
            project_path.mkdir(parents=True, exist_ok=True)
            print_success(f"Created project directory: {project_path}")
        except Exception as e:
            print_error(f"Failed to create project directory: {e}")
            return False

    # Step 1: Copy .claude directory
    print_info("[1/5] Copying .claude directory...")
    copy_directory(
        template_root / '.claude',
        project_path / '.claude',
        '.claude directory',
        interactive
    )

    # Step 2: Copy Docs directory
    print_info("[2/5] Copying Docs directory...")
    copy_directory(
        template_root / 'Docs',
        project_path / 'Docs',
        'Docs directory',
        interactive
    )

    # Step 3: Process CLAUDE.md template
    print_info("[3/5] Creating CLAUDE.md...")
    replacements = {
        'PROJECT_NAME': project_name,
        'PROJECT_PATH': str(project_path),
        'LED_RANGE_START': led_range_start,
        'LED_RANGE_END': led_range_end,
    }

    if process_template(
        template_root / 'CLAUDE.md.template',
        project_path / 'CLAUDE.md',
        replacements
    ):
        print_success("Created CLAUDE.md with project-specific values")

    # Step 4: Process QUICK-REFERENCE.md template
    print_info("[4/5] Creating QUICK-REFERENCE.md...")
    if process_template(
        template_root / '.claude' / 'QUICK-REFERENCE.md.template',
        project_path / '.claude' / 'QUICK-REFERENCE.md',
        replacements
    ):
        print_success("Created QUICK-REFERENCE.md with project-specific values")

    # Step 5: Verification
    print_info("[5/5] Verifying setup...")
    missing = verify_setup(project_path)

    print()
    if not missing:
        print_header("SETUP COMPLETE!")
        print_info("Next steps:")
        print(f"  1. Read {Colors.GRAY}.claude/START-HERE.md{Colors.RESET}")
        print(f"  2. Review {Colors.GRAY}CLAUDE.md{Colors.RESET} and customize further if needed")
        print(f"  3. Update {Colors.GRAY}QUICK-REFERENCE.md{Colors.RESET} with your actual commands")
        print(f"  4. Start a new Claude session in this project")
        print()
        print_info("Test the setup by asking Claude:")
        print(f'{Colors.GRAY}  "Can you see .claude/START-HERE.md? What is this project about?"{Colors.RESET}')
        print()
        print_info(f"LED Range assigned: {led_range_start}000-{led_range_end}999")
        print()
        return True
    else:
        print_header("SETUP COMPLETED WITH ERRORS")
        print_error("Missing files:")
        for file in missing:
            print(f"  {Colors.RED}[X] {file}{Colors.RESET}")
        print()
        print_warning("Please check the template directory and try again.")
        return False

def interactive_setup():
    """Run setup interactively"""
    print_header("Claude Project Template Setup")
    print_info("LED Breadcrumbs + AI Agent Teams")
    print()

    # Get project path
    default_path = os.getcwd()
    project_path = input(f"Enter project path (default: {Colors.GRAY}{default_path}{Colors.RESET}): ").strip()
    if not project_path:
        project_path = default_path

    # Get project name
    default_name = Path(project_path).name
    project_name = input(f"Enter project name (default: {Colors.GRAY}{default_name}{Colors.RESET}): ").strip()
    if not project_name:
        project_name = default_name

    # Get LED range
    print()
    print_info("LED Range Assignment:")
    print(f"{Colors.GRAY}  Choose a starting number for your LED ranges.{Colors.RESET}")
    print(f"{Colors.GRAY}  This is just for organizing YOUR project's operations.{Colors.RESET}")
    print()
    print(f"{Colors.GRAY}  Examples from other projects:{Colors.RESET}")
    print(f"{Colors.GRAY}    - DebugLayer: 30 (uses 30000-39999){Colors.RESET}")
    print(f"{Colors.GRAY}    - VoiceCoach-v2: 50 (see that project for reference){Colors.RESET}")
    print()
    print(f"{Colors.YELLOW}  You can use any number - 10, 30, 40, 50, etc.{Colors.RESET}")
    print(f"{Colors.YELLOW}  You'll define operation categories in CLAUDE.md later.{Colors.RESET}")
    print()

    led_range = input(f"Enter LED range start (e.g., {Colors.GRAY}30{Colors.RESET} for 30000-39999): ").strip()
    try:
        led_range_start = int(led_range)
    except ValueError:
        print_error(f"Invalid LED range: {led_range}")
        return False

    return setup_project(project_path, project_name, led_range_start, interactive=True)

def main():
    parser = argparse.ArgumentParser(
        description='Setup Claude Project Template with LED Breadcrumbs + AI Agent Teams',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog='''
Examples:
  # Interactive mode
  python setup-claude-project.py

  # Non-interactive mode
  python setup-claude-project.py AmbientIntelligence --led-range 40

  # Specify custom path
  python setup-claude-project.py MyProject --path D:/Projects/Ai/MyProject --led-range 50
        '''
    )

    parser.add_argument('name', nargs='?', help='Project name')
    parser.add_argument('--path', help='Project path (default: current directory / name)')
    parser.add_argument('--led-range', type=int, help='LED range start (e.g., 40 for 40000-49999)')
    parser.add_argument('--non-interactive', action='store_true', help='Run without prompts')

    args = parser.parse_args()

    # Interactive mode if no arguments
    if not args.name and not args.led_range:
        return interactive_setup()

    # Validate arguments for non-interactive mode
    if not args.name:
        print_error("Project name is required in non-interactive mode")
        parser.print_help()
        return False

    if args.led_range is None:
        print_error("--led-range is required in non-interactive mode")
        parser.print_help()
        return False

    # Determine project path
    if args.path:
        project_path = args.path
    else:
        # Use current directory + project name
        project_path = os.path.join(os.getcwd(), args.name)

    return setup_project(
        project_path,
        args.name,
        args.led_range,
        interactive=not args.non_interactive
    )

if __name__ == '__main__':
    try:
        success = main()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print()
        print_warning("Setup cancelled by user")
        sys.exit(1)
    except Exception as e:
        print_error(f"Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
