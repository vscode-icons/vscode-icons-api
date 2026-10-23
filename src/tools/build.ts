import type { JSONSchema7 } from 'json-schema';
import type { Config } from 'ts-json-schema-generator';

import { writeFile } from 'node:fs/promises';
import { posix } from 'node:path';
import { fileURLToPath } from 'node:url';

import { createGenerator } from 'ts-json-schema-generator';

const schemaTypeName = 'ApiIconSchema';
const rootDir = fileURLToPath(new URL('../../', import.meta.url));
const schemaOutputPath = posix.join(rootDir, 'schemas/v1/schema.json');
const tsConfigPath = posix.join(rootDir, 'tsconfig.json');

async function generateApiJsonSchema(argv: string[]): Promise<void> {
  const production = argv.some((arg: string): boolean =>
    /release|production/.test(arg),
  );
  const config: Config = {
    skipTypeCheck: true,
    topRef: false,
    tsconfig: tsConfigPath,
  };
  const generatedSchema: JSONSchema7 =
    createGenerator(config).createSchema(schemaTypeName);
  const { $schema, ...schemaContent } = generatedSchema;
  const schema = { $schema, title: schemaTypeName, ...schemaContent };

  await writeFile(schemaOutputPath, `${JSON.stringify(schema, null, 2)}\n`);

  if (production) {
    console.info(`[vscode-icons-api] API schema file successfully generated!`);
  }
}

void generateApiJsonSchema(process.argv);
