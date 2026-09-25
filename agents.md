# Agent instructions

## Writing release notes

When a release updates a dependency that ships ESLint rules (for example `eslint-plugin-unicorn`, `eslint-plugin-n`, `eslint-plugin-jsdoc`, `typescript-eslint`), fetch that dependency's release notes as raw markdown (append `.diff` for a PR, or fetch the GitHub release body) for every version in the bumped range to get the actual list of new/changed rules. Do not guess the rule list from the version number or commit title alone.

Most of this config uses explicit rule allowlists (`source/typescript-rules.js`, `source/jsdoc.js`, `source/plugins-rules.js`, etc.) rather than `recommended`/`all` presets, so for those a new rule shipped upstream does NOT change consumer behavior unless it is also explicitly added to the relevant rule list here. Before listing a rule under `### New rules`, grep the relevant source file to confirm it was actually turned on in this update. Only rules deliberately added to this config's own rule lists belong under `### New rules`, linking to the rule's docs page, matching the format used in past releases (see `gh release list` / `gh release view <tag>` for examples).

A few configs spread a whole upstream `recommended` preset instead, and those DO change what XO reports on an upstream release, including a minor or patch: `eslint-plugin-ava` and `eslint-package-json` and `eslint-node-test` in `index.js`, `eslint-plugin-unicorn` and `eslint-plugin-prettier` in `source/plugins-rules.js` and `index.js`, and the `languageOptions` of `@html-eslint` in `source/html.js`. `eslint-plugin-ava`, `eslint-node-test` and `eslint-package-json` are pre-1.0, so they are the likeliest to add rules without a major. For a release that bumps one of these, diff the actual preset rather than grepping this repo's own rule lists.

Always prefix rule names with their plugin/namespace (e.g. `unicorn/prefer-combined-guards`, not `prefer-combined-guards`), matching how they're referenced in this config's source files and in past release notes.
