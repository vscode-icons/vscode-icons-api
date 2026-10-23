import type { ApiIconSchema } from '../src/index.ts';

import { Ajv } from 'ajv';
import { expect } from 'chai';

import schema from '../schemas/v1/schema.json' with { type: 'json' };

import apiFile from '#api-json/v1' with { type: 'json' };

const iconsApi: ApiIconSchema = apiFile;

describe('icon API schema', function () {
  it('validates the icon API data', function () {
    const validate = new Ajv().compile(schema);

    expect(validate(iconsApi), JSON.stringify(validate.errors)).to.equal(true);
  });
});
