import type { JSONSchema7 } from 'json-schema';

import assert from 'node:assert/strict';
import { posix } from 'node:path';
import { afterEach, beforeEach, describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

import esmock from 'esmock';
import * as sinon from 'sinon';

const projectRoot = fileURLToPath(new URL('../../', import.meta.url));

void describe('generateApiJsonSchema', function () {
  let sandbox: sinon.SinonSandbox;
  let createGeneratorStub: sinon.SinonStub;
  let createSchemaStub: sinon.SinonStub;
  let writeFileStub: sinon.SinonStub;
  let consoleInfoStub: sinon.SinonStub;
  let consoleErrorStub: sinon.SinonStub;
  let generatedSchema: JSONSchema7;
  let mockedProcess: Pick<NodeJS.Process, 'argv' | 'exitCode'>;

  void beforeEach(function () {
    sandbox = sinon.createSandbox();
    mockedProcess = {
      argv: [...process.argv, '--production'],
      exitCode: 0,
    };
    generatedSchema = {
      $schema: 'http://json-schema.org/draft-07/schema#',
      type: 'object',
      properties: { name: { type: 'string' } },
    };
    createSchemaStub = sandbox.stub().returns(generatedSchema);
    createGeneratorStub = sandbox
      .stub()
      .returns({ createSchema: createSchemaStub });
    writeFileStub = sandbox.stub().resolves();
    consoleInfoStub = sandbox.stub(console, 'info').get(() => consoleInfoStub);
    consoleErrorStub = sandbox.stub(console, 'error');
  });

  void afterEach(function () {
    sandbox.restore();
  });

  async function build(): Promise<void> {
    const dependencies = new Map<string, unknown>([
      ['node:fs/promises', { writeFile: writeFileStub }],
      ['node:process', { default: mockedProcess }],
      ['ts-json-schema-generator', { createGenerator: createGeneratorStub }],
    ]);
    const completion = new Promise<void>((resolve, reject) => {
      consoleInfoStub.callsFake(() => resolve());
      consoleErrorStub.callsFake((error: Error) => reject(error));
    });
    await esmock('../../src/tools/build.ts', Object.fromEntries(dependencies));
    await completion;
  }

  void it('generates and writes the titled API schema', async function () {
    const schema = {
      $schema: generatedSchema.$schema,
      title: 'ApiIconSchema',
      type: 'object',
      properties: { name: { type: 'string' } },
    };

    await build();

    assert.equal(
      createGeneratorStub.calledOnceWithExactly({
        skipTypeCheck: true,
        topRef: false,
        tsconfig: posix.join(projectRoot, 'tsconfig.json'),
      }),
      true,
    );
    assert.equal(createSchemaStub.calledOnceWithExactly('ApiIconSchema'), true);
    assert.equal(
      writeFileStub.calledOnceWithExactly(
        posix.join(projectRoot, 'schemas/v1/schema.json'),
        `${JSON.stringify(schema, null, 2)}\n`,
      ),
      true,
    );
    assert.equal(
      consoleInfoStub.calledOnceWithExactly(
        '[vscode-icons-api] API schema file successfully generated!',
      ),
      true,
    );
    assert.equal(consoleInfoStub.calledAfter(writeFileStub), true);
    assert.equal(mockedProcess.exitCode, 0);
  });

  void it('throws an error when schema generation fails', async function () {
    const error = new Error('schema generation failed');
    createSchemaStub.throws(error);

    await assert.rejects(build(), { message: error.message });
    assert.equal(createSchemaStub.calledOnceWithExactly('ApiIconSchema'), true);
    assert.equal(writeFileStub.called, false);
    assert.equal(consoleInfoStub.called, false);
    assert.equal(consoleErrorStub.calledOnceWithExactly(error), true);
    assert.equal(mockedProcess.exitCode, 1);
  });
});
