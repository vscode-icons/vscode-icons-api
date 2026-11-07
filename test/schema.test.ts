import type { ApiIconSchema } from '../src/index.ts';

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { Ajv } from 'ajv';

import schema from '../schemas/v1/schema.json' with { type: 'json' };

import apiFile from '#api-json/v1' with { type: 'json' };

const iconsApi: ApiIconSchema = apiFile;

void describe('icon API schema', function () {
  void it('validates the icon API data', function () {
    const validate = new Ajv().compile(schema);

    assert.equal(validate(iconsApi), true, JSON.stringify(validate.errors));
  });
});
