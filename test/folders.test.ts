import type {
  ApiIconFolderDefinitions,
  ApiIconSchema,
  State,
  Theme,
} from '../src/index.ts';

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { getFolderIcon } from '../src/index.ts';

import apiFile from '#api-json/v1' with { type: 'json' };

const iconsApi: ApiIconSchema = apiFile;
const themes: Theme[] = ['dark', 'light'];
const states: State[] = ['closed', 'opened'];
const folderDefinitions: Record<Theme, ApiIconFolderDefinitions> = {
  dark: iconsApi.folders,
  light: iconsApi.light.folders,
};

function iconFilename(iconPath: string): string {
  const separatorIndex = Math.max(
    iconPath.lastIndexOf('/'),
    iconPath.lastIndexOf('\\'),
  );

  return iconPath.slice(separatorIndex + 1);
}

void describe('getFolderIcon', function () {
  for (const theme of themes) {
    const definitions = folderDefinitions[theme];

    void describe(`for the ${theme} theme`, function () {
      for (const [name, stateIcons] of Object.entries(definitions)
        .filter(([folderName]) => folderName !== '_default')
        .slice(0, 5)) {
        for (const state of states) {
          void it(`resolves '${name}' (${state}) to an icon`, function () {
            const iconPath =
              stateIcons[state] ||
              definitions._default[state] ||
              iconsApi.folders._default[state];

            assert.equal(
              getFolderIcon(name, { theme, state, includePath: true }),
              iconPath,
            );
            assert.equal(
              getFolderIcon(name, { theme, state }),
              iconFilename(iconPath),
            );
          });
        }
      }

      for (const [name, stateIcons] of Object.entries(definitions)
        .filter(
          ([folderName]) =>
            folderName !== '_default' &&
            folderName === folderName.toLowerCase(),
        )
        .slice(0, 3)) {
        const variations = [
          name.toUpperCase(),
          name.charAt(0).toUpperCase() + name.slice(1),
        ].filter(variation => !(variation in definitions));

        for (const variation of variations) {
          for (const state of states) {
            void it(`resolves '${variation}' like '${name}' (${state}) to an icon`, function () {
              const iconPath =
                stateIcons[state] ||
                definitions._default[state] ||
                iconsApi.folders._default[state];

              assert.equal(
                getFolderIcon(variation, { theme, state, includePath: true }),
                iconPath,
              );
            });
          }
        }
      }

      void it('uses the theme default for an unknown folder', function () {
        for (const state of states) {
          assert.equal(
            getFolderIcon('__unmapped_folder__', {
              theme,
              state,
              includePath: true,
            }),
            definitions._default[state] || iconsApi.folders._default[state],
          );
        }
      });
    });
  }

  void it('defaults to the dark theme and closed state', function () {
    assert.equal(
      getFolderIcon('__unmapped_folder__'),
      iconFilename(iconsApi.folders._default.closed),
    );
  });

  for (const name of ['', ' ', '\t\n', undefined, null]) {
    void it(`rejects an invalid 'name' of value: '${String(name)}'`, function () {
      assert.throws(() => getFolderIcon(name as string), {
        name: 'TypeError',
        message: 'missing required parameter: "name"',
      });
    });
  }
});
