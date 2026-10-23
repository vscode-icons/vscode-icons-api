import type {
  ApiIconFolderDefinitions,
  ApiIconSchema,
  State,
  Theme,
} from '../src/index.ts';

import { expect } from 'chai';

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

describe('getFolderIcon', function () {
  for (const theme of themes) {
    const definitions = folderDefinitions[theme];

    context(`for the ${theme} theme`, function () {
      for (const [name, stateIcons] of Object.entries(definitions)
        .filter(([folderName]) => folderName !== '_default')
        .slice(0, 5)) {
        for (const state of states) {
          it(`resolves '${name}' (${state}) to an icon`, function () {
            const iconPath =
              stateIcons[state] ||
              definitions._default[state] ||
              iconsApi.folders._default[state];

            expect(
              getFolderIcon(name, { theme, state, includePath: true }),
            ).to.equal(iconPath);
            expect(getFolderIcon(name, { theme, state })).to.equal(
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
            it(`resolves '${variation}' like '${name}' (${state}) to an icon`, function () {
              const iconPath =
                stateIcons[state] ||
                definitions._default[state] ||
                iconsApi.folders._default[state];

              expect(
                getFolderIcon(variation, { theme, state, includePath: true }),
              ).to.equal(iconPath);
            });
          }
        }
      }

      it('uses the theme default for an unknown folder', function () {
        for (const state of states) {
          expect(
            getFolderIcon('__unmapped_folder__', {
              theme,
              state,
              includePath: true,
            }),
          ).to.equal(
            definitions._default[state] || iconsApi.folders._default[state],
          );
        }
      });
    });
  }

  it('defaults to the dark theme and closed state', function () {
    expect(getFolderIcon('__unmapped_folder__')).to.equal(
      iconFilename(iconsApi.folders._default.closed),
    );
  });

  for (const name of ['', ' ', '\t\n', undefined, null]) {
    it(`rejects an invalid 'name' of value: '${String(name)}'`, function () {
      expect(() => getFolderIcon(name as string)).to.throw(
        TypeError,
        'missing required parameter: "name"',
      );
    });
  }
});
