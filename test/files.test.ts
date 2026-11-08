import type {
  ApiIconFileDefinitions,
  ApiIconSchema,
  Theme,
} from '../src/index.ts';

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { getFileIcon } from '../src/index.ts';

import apiFile from '#api-json/v1' with { type: 'json' };

const iconsApi: ApiIconSchema = apiFile;
const themes: Theme[] = ['dark', 'light'];
const fileDefinitions: Record<Theme, ApiIconFileDefinitions> = {
  dark: iconsApi.files,
  light: iconsApi.light.files,
};

function iconFilename(iconPath: string): string {
  const separatorIndex = Math.max(
    iconPath.lastIndexOf('/'),
    iconPath.lastIndexOf('\\'),
  );

  return iconPath.slice(separatorIndex + 1);
}

void describe('getFileIcon', function () {
  for (const theme of themes) {
    const definitions: ApiIconFileDefinitions = fileDefinitions[theme];

    void describe(`for the ${theme} theme`, function () {
      void describe('filename mappings', function () {
        for (const [name, iconPath] of Object.entries(
          definitions.filenames,
        ).slice(0, 5)) {
          void it(`resolves '${name}' to an icon`, function () {
            assert.equal(
              getFileIcon(name, { theme, includePath: true }),
              iconPath,
            );
            assert.equal(getFileIcon(name, { theme }), iconFilename(iconPath));
          });
        }

        for (const [name, iconPath] of Object.entries(definitions.filenames)
          .filter(
            ([candidateName]) => candidateName === candidateName.toLowerCase(),
          )
          .slice(0, 3)) {
          const variations = [
            name.toUpperCase(),
            name.charAt(0).toUpperCase() + name.slice(1),
          ].filter(variation => !(variation in definitions.filenames));

          for (const variation of variations) {
            void it(`resolves '${variation}' like '${name}' to an icon`, function () {
              assert.equal(
                getFileIcon(variation, { theme, includePath: true }),
                iconPath,
              );
            });
          }
        }
      });

      void describe('extension mappings', function () {
        const extensions = Object.entries(definitions.extensions);
        const overlappingExtension = extensions.find(([extension]) =>
          extensions.some(
            ([candidate]) =>
              extension.length > candidate.length &&
              extension.endsWith(`.${candidate}`),
          ),
        )!;

        for (const [extension] of [
          ...extensions.slice(0, 4),
          overlappingExtension,
        ]) {
          void it(`resolves '.${extension}' to an icon`, function () {
            const name = `sample.${extension}`;
            const matchingExtensions = Object.entries(definitions.extensions)
              .filter(([candidate]) => name.endsWith(`.${candidate}`))
              .sort(([left], [right]) => right.length - left.length);
            const iconPath = matchingExtensions[0]?.[1];

            assert.ok(iconPath !== undefined);
            assert.equal(
              getFileIcon(name, { theme, includePath: true }),
              iconPath,
            );
            assert.equal(getFileIcon(name, { theme }), iconFilename(iconPath));
          });
        }
      });

      void it('prefers an exact filename over its extension mapping', function () {
        const match = Object.entries(definitions.filenames).find(
          ([name, iconPath]) =>
            Object.entries(definitions.extensions).some(
              ([extension, extensionPath]) =>
                name.endsWith(`.${extension}`) && extensionPath !== iconPath,
            ),
        );

        assert.ok(match, 'an overlapping filename mapping');
        const [name, iconPath] = match;

        assert.equal(getFileIcon(name, { theme, includePath: true }), iconPath);
      });

      void it('uses the longest matching extension', function () {
        const match = Object.entries(definitions.extensions)
          .flatMap(([shortExtension, shortPath]) =>
            Object.entries(definitions.extensions)
              .filter(
                ([longExtension, longPath]) =>
                  longExtension.length > shortExtension.length &&
                  longExtension.endsWith(`.${shortExtension}`) &&
                  longPath !== shortPath,
              )
              .map(([longExtension, iconPath]) => ({
                iconPath,
                name: `sample.${longExtension}`,
              })),
          )
          .sort((left, right) => right.name.length - left.name.length)[0];

        assert.ok(match, 'overlapping extension mappings');

        assert.equal(
          getFileIcon(match.name, { theme, includePath: true }),
          match.iconPath,
        );
      });

      void it('uses the theme default when no mapping matches', function () {
        assert.equal(
          getFileIcon('__unmapped_filename__', {
            theme,
            includePath: true,
          }),
          definitions._default || iconsApi.files._default,
        );
      });
    });
  }

  void it('defaults to the dark theme and excludes the icon path', function () {
    assert.equal(
      getFileIcon('__unmapped_filename__'),
      iconFilename(iconsApi.files._default),
    );
  });

  void it('ignores inherited filename mappings', function () {
    for (const name of ['constructor', 'toString', '__proto__']) {
      assert.equal(
        getFileIcon(name, { includePath: true }),
        iconsApi.files._default,
      );
    }
  });

  for (const name of ['', ' ', '\t\n', undefined, null]) {
    void it(`rejects an invalid 'name' of value: '${String(name)}'`, function () {
      assert.throws(() => getFileIcon(name as string), {
        name: 'TypeError',
        message: 'missing required parameter: "name"',
      });
    });
  }
});
