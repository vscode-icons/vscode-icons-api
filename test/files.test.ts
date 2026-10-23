import type {
  ApiIconFileDefinitions,
  ApiIconSchema,
  Theme,
} from '../src/index.ts';

import { expect } from 'chai';

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

describe('getFileIcon', function () {
  for (const theme of themes) {
    const definitions: ApiIconFileDefinitions = fileDefinitions[theme];

    context(`for the ${theme} theme`, function () {
      context('filename mappings', function () {
        for (const [name, iconPath] of Object.entries(
          definitions.filenames,
        ).slice(0, 5)) {
          it(`resolves '${name}' to an icon`, function () {
            expect(getFileIcon(name, { theme, includePath: true })).to.equal(
              iconPath,
            );
            expect(getFileIcon(name, { theme })).to.equal(
              iconFilename(iconPath),
            );
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
            it(`resolves '${variation}' like '${name}' to an icon`, function () {
              expect(
                getFileIcon(variation, { theme, includePath: true }),
              ).to.equal(iconPath);
            });
          }
        }
      });

      context('extension mappings', function () {
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
          it(`resolves '.${extension}' to an icon`, function () {
            const name = `sample.${extension}`;
            const matchingExtensions = Object.entries(definitions.extensions)
              .filter(([candidate]) => name.endsWith(`.${candidate}`))
              .sort(([left], [right]) => right.length - left.length);
            const iconPath = matchingExtensions[0]?.[1];

            expect(iconPath).to.not.be.undefined;
            expect(getFileIcon(name, { theme, includePath: true })).to.equal(
              iconPath,
            );
            expect(getFileIcon(name, { theme })).to.equal(
              iconFilename(iconPath!),
            );
          });
        }
      });

      it('prefers an exact filename over its extension mapping', function () {
        const match = Object.entries(definitions.filenames).find(
          ([name, iconPath]) =>
            Object.entries(definitions.extensions).some(
              ([extension, extensionPath]) =>
                name.endsWith(`.${extension}`) && extensionPath !== iconPath,
            ),
        );

        expect(match, 'an overlapping filename mapping').to.not.be.undefined;
        const [name, iconPath] = match!;

        expect(getFileIcon(name, { theme, includePath: true })).to.equal(
          iconPath,
        );
      });

      it('uses the longest matching extension', function () {
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

        expect(match, 'overlapping extension mappings').to.not.be.undefined;

        expect(getFileIcon(match!.name, { theme, includePath: true })).to.equal(
          match!.iconPath,
        );
      });

      it('uses the theme default when no mapping matches', function () {
        expect(
          getFileIcon('__unmapped_filename__', {
            theme,
            includePath: true,
          }),
        ).to.equal(definitions._default || iconsApi.files._default);
      });
    });
  }

  it('defaults to the dark theme and excludes the icon path', function () {
    expect(getFileIcon('__unmapped_filename__')).to.equal(
      iconFilename(iconsApi.files._default),
    );
  });

  for (const name of ['', ' ', '\t\n', undefined, null]) {
    it(`rejects an invalid 'name' of value: '${String(name)}'`, function () {
      expect(() => getFileIcon(name as string)).to.throw(
        TypeError,
        'missing required parameter: "name"',
      );
    });
  }
});
