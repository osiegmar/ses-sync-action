# Modernize ses-sync Project Setup

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development
> (if subagents available) or superpowers:executing-plans to implement this
> plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Modernize ses-sync to match the s3-sync-action reference project's
tooling, config, and CI setup.

**Architecture:** Migrate from CommonJS/Node 20/@vercel/ncc to ESM/Node
24/Rollup. Replace legacy ESLint config with flat config. Update Prettier style.
Add comprehensive CI workflows and linting configs.

**Tech Stack:** TypeScript, ESM, Node 24, Rollup, ESLint 10 flat config,
Prettier, Jest 30, GitHub Actions

---

## Chunk 1: Infrastructure Modernization

### Task 1: Remove old config files and update .gitignore

**Files:**

- Delete: `.eslintrc.json`
- Delete: `.eslintignore`
- Delete: `.prettierrc.json`
- Delete: `jest.config.js`
- Modify: `.gitignore`
- Modify: `.gitattributes`
- Create: `.node-version`

- [ ] **Step 1: Delete legacy config files**

```bash
rm .eslintrc.json .eslintignore .prettierrc.json jest.config.js
```

- [ ] **Step 2: Create `.node-version`**

```
24.4.0
```

- [ ] **Step 3: Update `.gitignore`**

Replace contents with:

```
node_modules/
lib/
coverage/
*.lcov

.idea/
.DS_Store
*.tsbuildinfo

.env
.env.test
```

- [ ] **Step 4: Update `.gitattributes`**

Replace contents with:

```
* text=auto eol=lf

dist/** -diff linguist-generated=true
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: remove legacy config files, add .node-version"
```

---

### Task 2: Update package.json

**Files:**

- Modify: `package.json`

- [ ] **Step 1: Rewrite package.json**

Replace entire contents with:

```json
{
  "name": "ses-sync",
  "version": "1.0.0",
  "private": true,
  "description": "Sync email templates to Amazon Simple Email Service (SES)",
  "type": "module",
  "exports": {
    ".": "./dist/index.js"
  },
  "engines": {
    "node": ">=24.0.0"
  },
  "scripts": {
    "bundle": "npm run format:write && npm run package",
    "ci-test": "NODE_OPTIONS=--experimental-vm-modules NODE_NO_WARNINGS=1 npx jest",
    "coverage": "npx make-coverage-badge --output-path ./badges/coverage.svg",
    "format:write": "npx prettier --write .",
    "format:check": "npx prettier --check .",
    "lint": "npx eslint .",
    "package": "npx rimraf ./dist && npx rollup --config rollup.config.ts --configPlugin @rollup/plugin-typescript",
    "package:watch": "npm run package -- --watch",
    "test": "NODE_OPTIONS=--experimental-vm-modules NODE_NO_WARNINGS=1 npx jest",
    "all": "npm run format:write && npm run lint && npm run test && npm run coverage && npm run package"
  },
  "keywords": [],
  "author": "Oliver Siegmar",
  "license": "MIT",
  "dependencies": {
    "@actions/core": "^3.0.0",
    "@aws-sdk/client-sesv2": "^3.1000.0"
  },
  "devDependencies": {
    "@eslint/js": "^10.0.1",
    "@rollup/plugin-commonjs": "^29.0.0",
    "@rollup/plugin-json": "^6.1.0",
    "@rollup/plugin-node-resolve": "^16.0.3",
    "@rollup/plugin-typescript": "^12.3.0",
    "@types/jest": "^30.0.0",
    "@types/node": "^22.18.1",
    "@typescript-eslint/eslint-plugin": "^8.56.0",
    "eslint": "^10.0.0",
    "eslint-config-prettier": "^10.1.8",
    "eslint-plugin-jest": "^29.15.0",
    "eslint-plugin-prettier": "^5.5.5",
    "globals": "^16.0.0",
    "jest": "^30.2.0",
    "make-coverage-badge": "^1.2.0",
    "prettier": "^3.6.2",
    "rimraf": "^6.0.0",
    "rollup": "^4.57.1",
    "ts-jest": "^29.4.6",
    "ts-jest-resolver": "^2.0.1",
    "typescript": "^5.9.2"
  },
  "overrides": {
    "test-exclude": "^8.0.0"
  }
}
```

Note: Removed `async`, `mime-types`, `minimatch` (unused by ses-sync),
`@vercel/ncc`, `eslint-plugin-github`, old `@types/*`. Added Rollup stack, flat
ESLint stack, Jest 30.

- [ ] **Step 2: Commit**

```bash
git add package.json
git commit -m "chore: modernize package.json to ESM/Node 24/Rollup"
```

---

### Task 3: Create new config files

**Files:**

- Create: `tsconfig.json` (overwrite)
- Create: `.prettierrc.yml`
- Create: `.prettierignore` (overwrite)
- Create: `eslint.config.mjs`
- Create: `jest.config.js`
- Create: `rollup.config.ts`

- [ ] **Step 1: Rewrite `tsconfig.json`**

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "compilerOptions": {
    "allowSyntheticDefaultImports": true,
    "declaration": false,
    "declarationMap": false,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "isolatedModules": true,
    "lib": ["ES2023"],
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "newLine": "lf",
    "noImplicitAny": true,
    "noUnusedLocals": true,
    "noUnusedParameters": false,
    "outDir": "./dist",
    "pretty": true,
    "resolveJsonModule": true,
    "strict": true,
    "strictNullChecks": true,
    "target": "ES2023"
  },
  "exclude": ["coverage", "dist", "node_modules", "**/*.test.ts"],
  "include": ["src"]
}
```

- [ ] **Step 2: Create `.prettierrc.yml`**

```yaml
# See: https://prettier.io/docs/en/configuration

printWidth: 80
tabWidth: 2
useTabs: false
semi: false
singleQuote: true
quoteProps: as-needed
jsxSingleQuote: false
trailingComma: none
bracketSpacing: true
bracketSameLine: true
arrowParens: always
proseWrap: always
htmlWhitespaceSensitivity: css
endOfLine: lf
```

- [ ] **Step 3: Update `.prettierignore`**

```
.DS_Store
.licenses/
dist/
node_modules/
coverage/
```

- [ ] **Step 4: Create `eslint.config.mjs`**

```javascript
import js from '@eslint/js'
import typescriptEslint from '@typescript-eslint/eslint-plugin'
import jest from 'eslint-plugin-jest'
import prettierPlugin from 'eslint-plugin-prettier'
import prettierConfig from 'eslint-config-prettier'
import globals from 'globals'

export default [
  {
    ignores: [
      '**/coverage',
      '**/dist',
      '**/lib',
      '**/node_modules',
      'templates/*'
    ]
  },
  js.configs.recommended,
  ...typescriptEslint.configs['flat/recommended'],
  jest.configs['flat/recommended'],
  prettierConfig,
  {
    plugins: {
      prettier: prettierPlugin
    },

    languageOptions: {
      globals: {
        ...globals.node
      },

      ecmaVersion: 2023,

      parserOptions: {
        projectService: {
          allowDefaultProject: [
            'eslint.config.mjs',
            'jest.config.js',
            'rollup.config.ts',
            '__tests__/*.test.ts'
          ]
        },
        tsconfigRootDir: import.meta.dirname
      }
    },

    rules: {
      'prettier/prettier': 'error',
      '@typescript-eslint/explicit-member-accessibility': [
        'error',
        { accessibility: 'no-public' }
      ],
      '@typescript-eslint/array-type': 'error',
      '@typescript-eslint/consistent-type-assertions': 'error',
      '@typescript-eslint/explicit-function-return-type': [
        'error',
        { allowExpressions: true }
      ],
      '@typescript-eslint/no-inferrable-types': 'error',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/prefer-for-of': 'warn',
      '@typescript-eslint/prefer-function-type': 'warn'
    }
  }
]
```

- [ ] **Step 5: Create `jest.config.js`**

```javascript
/** @type {import('ts-jest').JestConfigWithTsJest} **/
export default {
  clearMocks: true,
  collectCoverage: true,
  collectCoverageFrom: ['./src/**', '!./src/index.ts'],
  coverageDirectory: './coverage',
  coveragePathIgnorePatterns: ['/node_modules/', '/dist/'],
  coverageReporters: ['json-summary', 'text', 'lcov'],
  extensionsToTreatAsEsm: ['.ts'],
  moduleFileExtensions: ['ts', 'js'],
  preset: 'ts-jest',
  reporters: ['default'],
  resolver: 'ts-jest-resolver',
  testEnvironment: 'node',
  testMatch: ['**/*.test.ts'],
  testPathIgnorePatterns: ['/dist/', '/node_modules/'],
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.json',
        useESM: true
      }
    ]
  },
  verbose: true
}
```

- [ ] **Step 6: Create `rollup.config.ts`**

```typescript
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import nodeResolve from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'

const config = {
  input: 'src/index.ts',
  output: {
    esModule: true,
    file: 'dist/index.js',
    format: 'es',
    inlineDynamicImports: true,
    sourcemap: true
  },
  plugins: [
    typescript(),
    nodeResolve({ preferBuiltins: true }),
    commonjs(),
    json()
  ]
}

export default config
```

- [ ] **Step 7: Commit**

```bash
git add tsconfig.json .prettierrc.yml .prettierignore eslint.config.mjs jest.config.js rollup.config.ts
git commit -m "chore: add modern config files (ESM, Rollup, flat ESLint)"
```

---

### Task 4: Migrate source code to ESM + new formatting

**Files:**

- Modify: `src/index.ts`
- Modify: `src/main.ts`
- Modify: `src/ses.ts`
- Modify: `src/templates.ts`

All source files need two changes:

1. Add `.js` extensions to relative imports (ESM requirement)
2. Reformat to new Prettier style (2-space indent, 80 char width,
   `bracketSpacing: true`, `arrowParens: always`)

- [ ] **Step 1: Update `src/index.ts`**

```typescript
import { run } from './main.js'

run()
```

- [ ] **Step 2: Update `src/main.ts`**

```typescript
import * as core from '@actions/core'
import { SES } from './ses.js'
import { findTemplates } from './templates.js'

export async function run(): Promise<void> {
  try {
    const srcDir: string = core.getInput('dir', { required: true })

    const ses = new SES()
    const storedTemplates = await ses.listTemplates()

    core.info(`Found ${storedTemplates.length} templates in SES`)

    const localTemplates = await findTemplates(srcDir)
    core.info(`Found ${localTemplates.length} templates locally`)

    for (const localTemplate of localTemplates) {
      core.info(
        `Processing template ${localTemplate.basename} ("${localTemplate.subject}")`
      )

      if (storedTemplates.includes(localTemplate.basename)) {
        await ses.updateTemplate(localTemplate)
      } else {
        await ses.createTemplate(localTemplate)
      }
    }

    core.info('Finished')
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message)
    }
  }
}
```

- [ ] **Step 3: Update `src/ses.ts`**

```typescript
import {
  CreateEmailTemplateCommand,
  ListEmailTemplatesCommand,
  SESv2Client,
  UpdateEmailTemplateCommand
} from '@aws-sdk/client-sesv2'
import * as core from '@actions/core'
import { LocalTemplate } from './templates.js'

export class SES {
  private client: SESv2Client

  constructor() {
    // SES template API is limited to 1 request per second
    this.client = new SESv2Client({ maxAttempts: 10 })
  }

  async listTemplates(): Promise<string[]> {
    let templates: string[] = []

    let NextToken = undefined
    for (;;) {
      const command = new ListEmailTemplatesCommand({
        PageSize: 100,
        NextToken
      })
      const response = await this.client.send(command)

      if (response.$metadata.httpStatusCode !== 200) {
        throw new Error(
          `Failed to list templates: SES responded with status ${response.$metadata.httpStatusCode}`
        )
      }

      for (const e of response.TemplatesMetadata ?? []) {
        if (e.TemplateName) {
          templates = templates.concat(e.TemplateName)
        }
      }

      if (response.NextToken === undefined) {
        break
      }

      NextToken = response.NextToken
    }

    return templates
  }

  async createTemplate(localTemplate: LocalTemplate): Promise<void> {
    core.info(`Creating template ${localTemplate.basename}`)

    const command = new CreateEmailTemplateCommand({
      TemplateName: localTemplate.basename,
      TemplateContent: {
        Subject: localTemplate.subject,
        Html: localTemplate.html,
        Text: localTemplate.text
      }
    })
    const response = await this.client.send(command)

    if (response.$metadata.httpStatusCode !== 200) {
      throw new Error(
        `Failed to create template ${localTemplate.basename}: SES responded with status ${response.$metadata.httpStatusCode}`
      )
    }
  }

  async updateTemplate(localTemplate: LocalTemplate): Promise<void> {
    core.info(`Updating template ${localTemplate.basename}`)

    const command = new UpdateEmailTemplateCommand({
      TemplateName: localTemplate.basename,
      TemplateContent: {
        Subject: localTemplate.subject,
        Html: localTemplate.html,
        Text: localTemplate.text
      }
    })
    const response = await this.client.send(command)

    if (response.$metadata.httpStatusCode !== 200) {
      throw new Error(
        `Failed to update template ${localTemplate.basename}: SES responded with status ${response.$metadata.httpStatusCode}`
      )
    }
  }
}
```

- [ ] **Step 4: Update `src/templates.ts`**

```typescript
import fs from 'node:fs'

export async function findTemplates(srcDir: string): Promise<LocalTemplate[]> {
  const templates: LocalTemplate[] = []

  const files = fs.readdirSync(srcDir)
  for (const file of files) {
    if (file.endsWith('.json')) {
      const basename = file.substring(0, file.length - 5)
      templates.push(new LocalTemplate(srcDir, basename))
    }
  }

  return templates
}

export class LocalTemplate {
  private readonly _path: string
  private readonly _basename: string

  constructor(path: string, basename: string) {
    this._path = path
    this._basename = basename
  }

  get basename(): string {
    return this._basename
  }

  get subject(): string {
    const config = fs.readFileSync(
      `${this._path}/${this._basename}.json`,
      'utf8'
    )
    const data = JSON.parse(config)
    return data.subject
  }

  get html(): string {
    return fs.readFileSync(`${this._path}/${this._basename}.html`, 'utf8')
  }

  get text(): string {
    return fs.readFileSync(`${this._path}/${this._basename}.txt`, 'utf8')
  }
}
```

- [ ] **Step 5: Commit**

```bash
git add src/
git commit -m "refactor: migrate source code to ESM with .js extensions"
```

---

### Task 5: Update action.yml

**Files:**

- Modify: `action.yml`

- [ ] **Step 1: Update `action.yml` to node24**

```yaml
name: 'SES Sync'
author: 'Oliver Siegmar'
description: 'Sync email templates to Amazon Simple Email Service (SES)'
inputs:
  dir:
    description: 'Source directory read files from'
    required: true
runs:
  using: 'node24'
  main: 'dist/index.js'
branding:
  icon: upload-cloud
  color: blue
```

- [ ] **Step 2: Commit**

```bash
git add action.yml
git commit -m "chore: update action runtime to node24"
```

---

## Chunk 2: CI Workflows and Linting Configs

### Task 6: Add linting config files

**Files:**

- Create: `.checkov.yml`
- Create: `.markdown-lint.yml`
- Create: `.yaml-lint.yml`
- Create: `.licensed.yml`
- Create: `actionlint.yml`
- Create: `.github/codeql/codeql-config.yml`

- [ ] **Step 1: Create `.checkov.yml`**

```yaml
# See: https://www.checkov.io/1.Welcome/Quick%20Start.html

compact: true
quiet: true
skip-path:
  - coverage
  - node_modules
```

- [ ] **Step 2: Create `.markdown-lint.yml`**

```yaml
# See: https://github.com/DavidAnson/markdownlint

# Unordered list style
MD004:
  style: dash

# Disable line length for tables
MD013:
  tables: false

# Ordered list item prefix
MD029:
  style: one

# Spaces after list markers
MD030:
  ul_single: 1
  ol_single: 1
  ul_multi: 1
  ol_multi: 1

# Allow duplicate headings in different sections (e.g. CHANGELOG)
MD024:
  siblings_only: true

# Code block style
MD046:
  style: fenced
```

- [ ] **Step 3: Create `.yaml-lint.yml`**

```yaml
# See: https://yamllint.readthedocs.io/en/stable/

rules:
  document-end: disable
  document-start:
    level: warning
    present: false
  line-length:
    level: warning
    max: 80
    allow-non-breakable-words: true
    allow-non-breakable-inline-mappings: true
```

- [ ] **Step 4: Create `.licensed.yml`**

```yaml
# See: https://github.com/licensee/licensed/blob/main/docs/configuration.md

sources:
  npm: true

allowed:
  - apache-2.0
  - bsd-2-clause
  - bsd-3-clause
  - isc
  - mit
  - cc0-1.0
  - other
```

- [ ] **Step 5: Create `actionlint.yml`**

```yaml
# See: https://github.com/rhysd/actionlint/blob/v1.7.7/docs/config.md

paths:
  .github/workflows/**/*.{yml,yaml}:
    ignore:
      - invalid runner name "node24"
```

- [ ] **Step 6: Create `.github/codeql/codeql-config.yml`**

```bash
mkdir -p .github/codeql
```

```yaml
name: JavaScript CodeQL Configuration

paths-ignore:
  - node_modules
  - dist
```

- [ ] **Step 7: Commit**

```bash
git add .checkov.yml .markdown-lint.yml .yaml-lint.yml .licensed.yml actionlint.yml .github/codeql/
git commit -m "chore: add linting and security config files"
```

---

### Task 7: Replace CI workflows

**Files:**

- Delete: `.github/workflows/build.yml`
- Create: `.github/workflows/ci.yml`
- Create: `.github/workflows/check-dist.yml`
- Create: `.github/workflows/codeql-analysis.yml`
- Create: `.github/workflows/licensed.yml`
- Create: `.github/workflows/linter.yml`

- [ ] **Step 1: Delete old workflow**

```bash
rm .github/workflows/build.yml
```

- [ ] **Step 2: Create `.github/workflows/ci.yml`**

```yaml
name: Continuous Integration

on:
  pull_request:
    branches:
      - main
  push:
    branches:
      - main

permissions:
  contents: read

jobs:
  test-typescript:
    name: TypeScript Tests
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        id: checkout
        uses: actions/checkout@v6

      - name: Setup Node.js
        id: setup-node
        uses: actions/setup-node@v6
        with:
          node-version-file: .node-version
          cache: npm

      - name: Install Dependencies
        id: npm-ci
        run: npm ci

      - name: Check Format
        id: npm-format-check
        run: npm run format:check

      - name: Lint
        id: npm-lint
        run: npm run lint

      - name: Test
        id: npm-ci-test
        run: npm run ci-test
```

- [ ] **Step 3: Create `.github/workflows/check-dist.yml`**

```yaml
# In TypeScript actions, `dist/` is a special directory. When you reference
# an action with the `uses:` property, `dist/index.js` is the code that
# will be run. For this project, the `dist/index.js` file is transpiled
# from other source files. This workflow ensures the `dist/` directory
# contains the expected transpiled code.
#
# If this workflow is run from a feature branch, it will act as an
# additional CI check and fail if the checked-in `dist/` directory does
# not match what is expected from the build.
name: Check Transpiled JavaScript

on:
  pull_request:
    branches:
      - main
  push:
    branches:
      - main

permissions:
  contents: read

jobs:
  check-dist:
    name: Check dist/
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        id: checkout
        uses: actions/checkout@v6

      - name: Setup Node.js
        id: setup-node
        uses: actions/setup-node@v6
        with:
          node-version-file: .node-version
          cache: npm

      - name: Remove dist/ Directory
        id: remove-dist
        run: npx rimraf ./dist

      - name: Install Dependencies
        id: install
        run: npm ci

      - name: Build dist/ Directory
        id: build
        run: npm run bundle

      # This will fail the workflow if the `dist/` directory is different
      # than expected.
      - name: Compare Directories
        id: diff
        run: |
          if [ ! -d dist/ ]; then
            echo "Expected dist/ directory does not exist."
            ls -la ./
            exit 1
          fi
          if [ "$(git diff --ignore-space-at-eol --text dist/ | wc -l)" -gt "0" ]; then
            echo "Detected uncommitted changes after build."
            git diff --ignore-space-at-eol --text dist/
            exit 1
          fi

      # If `dist/` was different than expected, upload the expected
      # version as a workflow artifact.
      - if: ${{ failure() && steps.diff.outcome == 'failure' }}
        name: Upload Artifact
        id: upload
        uses: actions/upload-artifact@v6
        with:
          name: dist
          path: dist/
```

- [ ] **Step 4: Create `.github/workflows/codeql-analysis.yml`**

```yaml
name: CodeQL

on:
  pull_request:
    branches:
      - main
  push:
    branches:
      - main
  schedule:
    - cron: '31 7 * * 3'

permissions:
  actions: read
  checks: write
  contents: read
  security-events: write

jobs:
  analyze:
    name: Analyze
    runs-on: ubuntu-latest

    strategy:
      fail-fast: false
      matrix:
        language:
          - typescript

    steps:
      - name: Checkout
        id: checkout
        uses: actions/checkout@v6

      - name: Initialize CodeQL
        id: initialize
        uses: github/codeql-action/init@v4
        with:
          config-file: .github/codeql/codeql-config.yml
          languages: ${{ matrix.language }}
          source-root: src

      - name: Autobuild
        id: autobuild
        uses: github/codeql-action/autobuild@v4

      - name: Perform CodeQL Analysis
        id: analyze
        uses: github/codeql-action/analyze@v4
```

- [ ] **Step 5: Create `.github/workflows/licensed.yml`**

```yaml
name: Licensed

on:
  workflow_dispatch:

permissions:
  contents: write

jobs:
  licensed:
    name: Check Licenses
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        id: checkout
        uses: actions/checkout@v6

      - name: Setup Node.js
        id: setup-node
        uses: actions/setup-node@v6
        with:
          node-version-file: .node-version
          cache: npm

      - name: Install Dependencies
        id: npm-ci
        run: npm ci

      - name: Setup Ruby
        id: setup-ruby
        uses: ruby/setup-ruby@v1
        with:
          ruby-version: ruby

      - uses: licensee/setup-licensed@v1.3.2
        with:
          version: 4.x
          github_token: ${{ secrets.GITHUB_TOKEN }}

      # If this is a workflow_dispatch event, update the cached licenses.
      - if: ${{ github.event_name == 'workflow_dispatch' }}
        name: Update Licenses
        id: update-licenses
        run: licensed cache

      # Then, commit the updated licenses to the repository.
      - if: ${{ github.event_name == 'workflow_dispatch' }}
        name: Commit Licenses
        id: commit-licenses
        run: |
          git config --local user.email "licensed-ci@users.noreply.github.com"
          git config --local user.name "licensed-ci"
          git add .
          git commit -m "Auto-update license files"
          git push

      # Last, check the status of the cached licenses.
      - name: Check Licenses
        id: check-licenses
        run: licensed status
```

- [ ] **Step 6: Create `.github/workflows/linter.yml`**

```yaml
name: Lint Codebase

on:
  pull_request:
    branches:
      - main
  push:
    branches:
      - main

permissions:
  contents: read
  packages: read
  statuses: write

jobs:
  lint:
    name: Lint Codebase
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        id: checkout
        uses: actions/checkout@v6
        with:
          fetch-depth: 0

      - name: Setup Node.js
        id: setup-node
        uses: actions/setup-node@v6
        with:
          node-version-file: .node-version
          cache: npm

      - name: Install Dependencies
        id: install
        run: npm ci

      - name: Lint Codebase
        id: super-linter
        uses: super-linter/super-linter/slim@v8
        env:
          CHECKOV_FILE_NAME: .checkov.yml
          DEFAULT_BRANCH: main
          FILTER_REGEX_EXCLUDE: dist/**/*
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          LINTER_RULES_PATH: .
          VALIDATE_ALL_CODEBASE: true
          VALIDATE_BIOME_FORMAT: false
          VALIDATE_BIOME_LINT: false
          VALIDATE_GITHUB_ACTIONS_ZIZMOR: false
          VALIDATE_JAVASCRIPT_ES: false
          VALIDATE_JSCPD: false
          VALIDATE_TYPESCRIPT_ES: false
          VALIDATE_JSON: false
```

- [ ] **Step 7: Commit**

```bash
git add .github/
git commit -m "chore: add comprehensive CI workflows"
```

---

### Task 8: Install dependencies, build, and verify

**Files:**

- Modify: `package-lock.json`
- Modify: `dist/` (rebuilt)

- [ ] **Step 1: Install dependencies**

```bash
npm install
```

- [ ] **Step 2: Run prettier to reformat all files**

```bash
npx prettier --write .
```

- [ ] **Step 3: Run lint**

```bash
npx eslint .
```

Fix any lint errors that arise (likely minimal since source was already
well-typed).

- [ ] **Step 4: Build the bundle**

```bash
npm run package
```

Verify `dist/index.js` is created and is an ES module.

- [ ] **Step 5: Create badges directory**

```bash
mkdir -p badges
```

- [ ] **Step 6: Commit everything**

```bash
git add -A
git commit -m "chore: install deps, rebuild dist with Rollup"
```

---

### Task 9: Update CLAUDE.md and dependabot.yml

**Files:**

- Modify: `CLAUDE.md`
- Modify: `.github/dependabot.yml`

- [ ] **Step 1: Update CLAUDE.md**

Update to reflect new tooling:

- ESM project targeting Node 24
- Rollup bundler (not ncc)
- Prettier: 80 char width, 2-space indent
- ESLint: flat config with TypeScript + Jest + Prettier plugins
- All relative imports use `.js` extensions
- `npm run all` = format + lint + test + coverage + package
- `npm run bundle` = format + package

- [ ] **Step 2: Update dependabot.yml formatting**

Reformat to match Prettier YAML style (single quotes).

- [ ] **Step 3: Commit**

```bash
git add CLAUDE.md .github/dependabot.yml
git commit -m "docs: update CLAUDE.md for modernized setup"
```
