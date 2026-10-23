import type { JSONSchema7 } from 'json-schema';

import { posix } from 'node:path';
import { fileURLToPath } from 'node:url';

import { expect } from 'chai';
import esmock from 'esmock';
import * as sinon from 'sinon';

const projectRoot = fileURLToPath(new URL('../../../', import.meta.url));

describe('generateApiJsonSchema', function () {
  let sandbox: sinon.SinonSandbox;
  let createGeneratorStub: sinon.SinonStub;
  let createSchemaStub: sinon.SinonStub;
  let writeFileStub: sinon.SinonStub;
  let consoleInfoStub: sinon.SinonStub;
  let generatedSchema: JSONSchema7;
  let build: () => Promise<void>;

  beforeEach(function () {
    sandbox = sinon.createSandbox();
    sandbox.stub(process, 'argv').value([...process.argv, '--production']);
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
    build = () => new Promise(resolve => resolve());
  });

  afterEach(function () {
    sandbox.restore();
  });

  async function loadBuild(): Promise<void> {
    const dependencies = new Map<string, unknown>([
      ['node:fs/promises', { writeFile: writeFileStub }],
      ['ts-json-schema-generator', { createGenerator: createGeneratorStub }],
    ]);
    await esmock(
      '../../../src/tools/build.ts',
      Object.fromEntries(dependencies),
    );
    await build();
  }

  it('generates and writes the titled API schema', async function () {
    const schema = {
      $schema: generatedSchema.$schema,
      title: 'ApiIconSchema',
      type: 'object',
      properties: { name: { type: 'string' } },
    };

    await loadBuild();

    expect(
      createGeneratorStub.calledOnceWithExactly({
        skipTypeCheck: true,
        topRef: false,
        tsconfig: posix.join(projectRoot, 'tsconfig.json'),
      }),
    ).to.be.true;
    expect(createSchemaStub.calledOnceWithExactly('ApiIconSchema')).to.be.true;
    expect(
      writeFileStub.calledOnceWithExactly(
        posix.join(projectRoot, 'schemas/v1/schema.json'),
        `${JSON.stringify(schema, null, 2)}\n`,
      ),
    ).to.be.true;
    expect(
      consoleInfoStub.calledOnceWithExactly(
        '[vscode-icons-api] API schema file successfully generated!',
      ),
    ).to.be.true;
    expect(consoleInfoStub.calledAfter(writeFileStub)).to.be.true;
  });

  it('does not write or log when schema generation fails', async function () {
    const error = new Error('schema generation failed');
    createSchemaStub.throws(error);

    const rejection = new Promise<unknown>(resolve => {
      process.once('unhandledRejection', resolve);
    });

    await loadBuild();

    expect(await rejection).to.equal(error);
    expect(createSchemaStub.calledOnceWithExactly('ApiIconSchema')).to.be.true;
    expect(writeFileStub.called).to.be.false;
    expect(consoleInfoStub.called).to.be.false;
  });
});
