# Dual Workflow System for Lesson Creation

**Created**: 2025-01-07
**Purpose**: Two parallel workflows for different lesson types

---

## Two Workflows Available

### 1. Concise Lessons (Current Book)
**Workflow**: `Writing-Workflow.md`
**Agent**: `lesson-editor`
**Target Length**: 2,500-3,500 characters
**Focus**: Core teachings + validated enhancement
**Use for**: "2 Minutes to HOOT" book project
**Example**: Lesson 004 v21 (2,716 characters)

### 2. Depth Lessons (Expanded Content)
**Workflow**: `Writing-Workflow-Depth.md`
**Agent**: `lesson-editor-depth`
**Target Length**: 3,500-4,500 characters
**Focus**: Psychological exploration + emotional journey + detailed transformation
**Use for**: Future expanded projects, richer content
**Example**: Lesson 004 v10 (3,832 characters) - depth approach

---

## Key Differences

| Element | Concise (lesson-editor) | Depth (lesson-editor-depth) |
|---------|-------------------------|----------------------------|
| Length | 2,500-3,500 chars | 3,500-4,500 chars |
| Fear Exploration | Brief mention | Three-level detailed exploration |
| Resistance | Acknowledged | Elaborated with social conditioning |
| Emotional Journey | Implied | Explicit developmental arc |
| Practical Examples | 2-4 pairs | 4-6 pairs |
| Transformation | Stated directly | Elaborated process |
| Foundations | Footer only | Footer + explicit connection section |

---

## Shared Process

Both workflows use the SAME process for Steps 1-4:

1. ✅ Re-index Qdrant (if needed)
2. ✅ Three-search Qdrant approach (multi-source validation)
3. ✅ Writing Team activation (IQ2, Character Weaver, Zen Scribe)
4. ✅ Integration Round (Part 2.5)

**Only Step 5 differs**:
- Concise: Invoke `lesson-editor`
- Depth: Invoke `lesson-editor-depth`

---

## How to Use

### For Concise Lessons (Current Book)
```bash
# Follow Writing-Workflow.md
# In Step 5, use:
Task tool with subagent_type="lesson-editor"
```

### For Depth Lessons (Expanded Content)
```bash
# Follow Writing-Workflow-Depth.md
# In Step 5, use:
Task tool with subagent_type="lesson-editor-depth"
```

---

## File Naming

### Concise Versions
`lesson-XXX-title-version-YYYY-MM-DD.md`
Example: `lesson-004-asking-v21-2025-01-06.md`

### Depth Versions
`lesson-XXX-title-version-depth-YYYY-MM-DD.md`
Example: `lesson-004-asking-v22-depth-2025-01-06.md`

---

## What Gets Preserved

Both workflows preserve:
- ✅ Validation-Enhancement Framework
- ✅ Three-Source Validation Rule
- ✅ Dramatic Buildup Opening
- ✅ Derek's exact mystical language
- ✅ Drift Detection (no psychologizing)
- ✅ Historical proof validation
- ✅ Cross-reference validation

---

## What Gets Added (Depth Only)

**Psychological Depth Layer**:
- Three-level fear exploration (surface → deeper → deepest)
- Resistance patterns (social conditioning, ego protection)
- Emotional journey (where they are → struggle → transformation)
- Character transformation elaboration (ego dissolution detailed)
- Relatability sections ("You might be afraid..." direct addresses)
- More practical examples (4-6 pairs vs 2-4)

---

## Testing the System

**Proposed Test**: Create Lesson 004 v22-depth using depth workflow to validate:
1. lesson-editor-depth agent works correctly
2. Length target met (3,500-4,500 characters)
3. Psychological depth adds value without drift
4. Blends v10's richness with v21's improvements

---

## Decision Matrix

**Choose Concise when**:
- ✅ Writing for current book
- ✅ Want punchy, powerful one-pagers
- ✅ Target: 2,500-3,500 characters
- ✅ Focus: Core teaching with validated enhancement

**Choose Depth when**:
- ✅ Writing expanded content
- ✅ Want emotionally rich developmental lessons
- ✅ Target: 3,500-4,500 characters
- ✅ Focus: Psychological journey + transformation

---

## Summary

You now have TWO validated workflows:
1. **Concise** → v21 improvements (keep this for current book)
2. **Depth** → v10 richness + v21 improvements (use for expanded content)

Both preserve Derek's mystical voice while preventing message drift. The only difference is psychological elaboration level.
