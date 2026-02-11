@echo off
:: Set 24GB heap for Claude (prevents memory crashes with nested agents)
set NODE_OPTIONS=--max-old-space-size=24576

:: Start Claude
claude --dangerously-skip-permissions