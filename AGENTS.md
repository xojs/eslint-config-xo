# Agent instructions

## Writing release notes

When a release updates a dependency that ships ESLint rules (for example `eslint-plugin-unicorn`, `eslint-plugin-n`, `eslint-plugin-jsdoc`, `typescript-eslint`), fetch that dependency's release notes as raw markdown (append `.diff` for a PR, or fetch the GitHub release body) for every version in the bumped range to get the actual list of new/changed rules. Do not guess the rule list from the version number or commit title alone.

This config uses explicit rule allowlists (`source/typescript-rules.js`, `source/jsdoc.js`, `source/plugins-rules.js`, etc.), not `recommended`/`all` presets. A new rule shipped by an upstream dependency does NOT change consumer behavior unless it is also explicitly added to the relevant rule list here. Before listing a rule under `### New rules`, grep the relevant source file to confirm it was actually turned on in this update. Only rules deliberately added to this config's own rule lists belong under `### New rules`, linking to the rule's docs page, matching the format used in past releases (see `gh release list` / `gh release view <tag>` for examples).
