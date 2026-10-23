import { glob } from 'node:fs/promises';

import Mocha from 'mocha';

const testRoot = process.argv[2]?.replace(/[\\/]+$/, '');

const mocha = new Mocha({
  color: true,
  retries: 2,
  timeout: 15000,
});

for await (const file of glob(`${testRoot}/**/*.test.ts`)) {
  mocha.addFile(file);
}

mocha.run((failures: number): void => {
  process.exitCode = failures === 0 ? 0 : 1;
});
