# Project Guidelines

## Project Structure

```text
icons/                 # SVG assets synced automatically from upstream
manifests/v1/          # API manifest synced automatically from upstream
schemas/v1/schema.json # Generated API JSON schema
src/
  index.ts             # Public icon lookup API
  tools/
    build.ts           # Generates the API JSON schema
test/
  files.test.ts        # File icon lookup tests
  folders.test.ts      # Folder icon lookup tests
  schema.test.ts       # Manifest and schema tests
  tools/
    build.test.ts      # Schema generation tests
```

## Development

- Use Node.js version as mentioned in `package.json` `engines` property.
- This package uses native ES modules and strict TypeScript.
- `npm test` runs the Node.js test suite and enforces 100% per-file coverage for
  lines, functions, branches, and statements in `src/**/*.ts`.
- `npm run build:dev` runs the TypeScript development build and regenerates the
  API schema.
- `npm run build` runs the production TypeScript build and regenerates the API
  schema.
- `build:dev` and `build` run cleanup first, removing `coverage/`, `out/`,
  `index.js`, and `index.d.ts`.
- `npm run format` formats the repository.
- `npm run lint` runs linting with autofix. Review changes after running
  autofixing commands.
- `npm run lint:md` runs Markdown linting with output enabled, rewriting
  Markdown files.

## Conventions

- Update the TypeScript source and regenerate the schema instead of editing the
  generated file directly.
- Keep TypeScript types and interfaces in `types.ts` when adding or changing
  declarations.

## Code Style

- Follow the repository’s formatting and lint conventions.
- Follow the repository’s TypeScript settings.

## Validation

- Run the relevant tests, then `npm test` for broader coverage when behavior
  changes. The test suite enforces 100% per-file coverage for lines, functions,
  branches, and statements in `src/**/*.ts`.
- Run `npm run build` to validate the production TypeScript build and regenerate
  the API schema.
- For changed files, run:
  - `npx prettier --check <files>`
  - `npx eslint <files>`
  - `npx remark <files> --quiet --frail` for Markdown, so warnings fail as in
    CI.
- `npm run check` formats the repository, then runs linting with autofix and
  Markdown linting with output enabled. Review the resulting diff because this
  command can modify files.

## Commit Convention

Use Conventional Commits with a relevant scope:

```text
feat(api): add filename matching
fix(api): correct folder icon fallback
docs(agents): clarify project structure
test(api): cover light theme lookup
```

## PR Convention

- Use a concise title with a Conventional Commit prefix.
- Reference the related issue in the description, for example `Fixes #123`.
- Summarize the behavior or files changed and list the validation performed.
