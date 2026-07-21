# Cadence UI/UX Development Guidelines

This document records core visual design and coding guidelines established for the Cadence project. All future UI refactoring or new module development (projects, tasks, boards, comments, settings, etc.) must follow these instructions.

---

## 🎨 UI/UX Core Principles

1. **Prioritize Shadcn UI Component Primitives**:
   * Always check the `components/ui/` directory before building any layout elements. 
   * If a component exists (e.g., `Input`, `Textarea`, `Select`, `Dialog`, `AlertDialog`, `Sidebar`), **you must use it**. Do not write native HTML equivalents.
   * Integrate custom components with React Hook Form using `<Controller>` wrapper contexts.

2. **Custom Reusable & Shared Components**:
   * If a specific UI element is not present in Shadcn UI, design it as a **generic, resource-agnostic wrapper** inside `components/shared/` (e.g., `CustomDialog`, `CustomAlertDialog`).
   * Pass customizable parameters (title, loading state, configurations) via props to ensure it can be reused anywhere in the codebase (e.g., for projects, tasks, or comments) without code duplication.

3. **Jira-Inspired Visual Aesthetics**:
   * Do not write custom inline color class overrides (like `border-[#DFE1E6]`).
   * Style variables must map directly onto Shadcn's theme variables in [globals.css](file:///C:/Users/Fiftyfive/Desktop/cadence/cadence-web/frontend/app/globals.css):
     * `--background` -> White (`#FFFFFF`)
     * `--foreground` / Text -> Charcoal (`#172B4D`)
     * `--primary` / Brand -> Atlassian Blue (`#0052CC`)
     * `--muted-foreground` -> Cool Gray (`#5E6C84`)
     * `--border` / `--input` -> Light Gray (`#DFE1E6`)
     * `--radius` -> 3px
     * `--sidebar` -> Light Gray-Blue (`#F4F5F7`)
   * Collapsed sidebars must display slim icons (`collapsible="icon"`) instead of sliding off-canvas.

4. **Forms Management**:
   * Utilize `react-hook-form` along with Zod validation schemas for all user inputs.
   * Catch and display inline, field-specific validation errors under `<FieldError>` components.
   * Always pass `noValidate` to forms to suppress standard browser bubble validation.

5. **Layout Alignment & Empty States Centering**:
   * **Perfect Padding Alignment**: Ensure body containers and main sections align exactly with the header margins (e.g., matching padding values `px-4 md:px-8`). If the header stretches full-width, the main content area must stretch as well to avoid misalignment.
   * **Centering Rules**: All empty state placeholders, onboarding dialogs, or zero-search results panels must be centered both horizontally and vertically (`flex-grow flex flex-col items-center justify-center`) inside the viewport.
