---
title: getPromptForStyle
generated: 2026-02-14T17:53:27.932Z
dependencies:
  - path: src/cli/commands/init.ts
    symbol: getPromptForStyle
    hash: e2b317017795a1c2a3f3864aeb2075716789367eddf1f7c44aecb5247002ada8
---
# getPromptForStyle

The `getPromptForStyle` function retrieves documentation style prompts based on a specified style type. It supports predefined styles (`senior`, `onboarding`) and custom prompts, returning appropriate guidance text for documentation generation.

<details>
<summary>Visual Flow</summary>

```mermaid
flowchart TD
    A[Function Called] --> B{style === 'custom'?}
    B -->|Yes| C[Return customPrompt]
    B -->|No| D[Check prompts object]
    D --> E{style exists in prompts?}
    E -->|Yes| F[Return prompts[style]]
    E -->|No| G[Return prompts.senior as fallback]
    C --> H[End]
    F --> H
    G --> H
```

</details>

<details>
<summary>Parameters</summary>

- `style`: `string` - The documentation style identifier. Accepts `'custom'`, `'senior'`, `'onboarding'`, or any other string value
- `customPrompt`: `string` - The custom prompt text to return when `style` is `'custom'`. Ignored for predefined styles

</details>

<details>
<summary>Return Value</summary>

Returns a `string` containing the appropriate documentation prompt:
- For `style === 'custom'`: Returns the `customPrompt` parameter value
- For `style === 'senior'`: Returns a prompt focused on architectural decisions, trade-offs, and edge cases
- For `style === 'onboarding'`: Returns a prompt focused on explanatory documentation for new team members
- For any other `style` value: Returns the `'senior'` prompt as a fallback

</details>

<details>
<summary>Usage Examples</summary>

```typescript
// Get senior-level documentation prompt
const seniorPrompt = getPromptForStyle('senior', '');
console.log(seniorPrompt);
// Output: "Document for senior engineers joining the team..."

// Get onboarding documentation prompt
const onboardingPrompt = getPromptForStyle('onboarding', '');
console.log(onboardingPrompt);
// Output: "Document for new team members learning the codebase..."

// Use custom prompt
const customText = 'Generate API documentation with examples';
const customPrompt = getPromptForStyle('custom', customText);
console.log(customPrompt);
// Output: "Generate API documentation with examples"

// Handle unknown style (fallback to senior)
const fallbackPrompt = getPromptForStyle('unknown', '');
console.log(fallbackPrompt === getPromptForStyle('senior', ''));
// Output: true
```

</details>

<details>
<summary>Implementation Details</summary>

The function uses a simple conditional structure:

1. **Custom Style Check**: First checks if `style === 'custom'` and returns `customPrompt` immediately
2. **Prompt Lookup**: Defines a local `prompts` object containing predefined style templates
3. **Type-Safe Access**: Uses `style as keyof typeof prompts` for type-safe object access
4. **Fallback Mechanism**: Employs the logical OR operator (`||`) to default to `prompts.senior` for unrecognized styles

The prompts object contains two predefined styles:
- `senior`: Emphasizes architectural reasoning, trade-offs, and concise explanations
- `onboarding`: Focuses on clear explanations, examples, and learning-oriented content

</details>

<details>
<summary>Edge Cases</summary>

- **Empty `customPrompt`**: When `style === 'custom'` but `customPrompt` is empty, returns an empty string
- **Null/Undefined Style**: If `style` is `null` or `undefined`, the function will fallback to the `senior` prompt
- **Case Sensitivity**: Style matching is case-sensitive (`'Senior'` !== `'senior'`)
- **Unknown Styles**: Any unrecognized style value defaults to the `senior` prompt
- **Type Coercion**: Non-string `style` values will be coerced to strings for comparison

</details>

<details>
<summary>Related</summary>

This function appears to be part of a documentation generation system and likely works with:
- Documentation generators or templating systems
- Configuration objects that specify documentation styles
- Functions that process the returned prompts for AI-based documentation generation
- Style configuration management utilities

</details>