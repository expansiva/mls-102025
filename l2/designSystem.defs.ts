/// <mls fileReference="_102025_/l2/designSystem.defs.ts" enhancement="_blank" />

// Do not change – automatically generated code. 


export const asis: mls.defs.AsIs = {
  "meta": {
    "fileReference": "_102025_/l2/designSystem.ts",
    "componentType": "other",
    "componentScope": "appFrontEnd",
    "devFidelity": "final"
  },
  "references": {
    "imports": [
      {
        "ref": "/_100554_/l2/designSystemBase",
        "dependencies": [
          {
            "name": "IDesignSystemTokens",
            "type": "interface"
          }
        ]
      }
    ]
  },
  "asIs": {
    "semantic": {
      "generalDescription": "Design system tokens definition file containing two complete theme configurations (Default and Natal) with color palettes, global variables, and typography settings",
      "businessCapabilities": [],
      "technicalCapabilities": [
        "Theme token management",
        "Color palette definition",
        "Typography system configuration",
        "Responsive breakpoint definition",
        "Spacing system configuration",
        "Transition timing configuration",
        "Dark mode color variant support"
      ],
      "implementedFeatures": [
        "Default theme with comprehensive color system including text, background, grey, error, success, warning, info, active, and link colors with lighter/darker variants and hover/focus/disabled states",
        "Natal (Christmas) theme with festive red and green color scheme",
        "Global design tokens for breakpoints, transitions, and spacing",
        "Typography system with font families, sizes, line heights, and weights",
        "Dark mode color variants prefixed with _dark- for all color categories"
      ],
      "constraints": [
        "Color values are hardcoded as hex strings",
        "Spacing and font sizes use calc() with base unit references (@space-base-unit, @font-base-unit, @line-height-base-unit) that may require preprocessor/variable substitution",
        "Two themes defined: Default and Natal with identical token structure",
        "No runtime theme switching logic implemented in this file"
      ]
    }
  }
}
    