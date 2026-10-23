import { ok } from 'node:assert/strict';

import apiManifest from '#api-json/v1' with { type: 'json' };

//#region exported typings

export type Theme = 'dark' | 'light';
export type State = 'closed' | 'opened';

export interface ApiFileOptions {
  includePath?: boolean;
  theme?: Theme;
}

export interface ApiFolderOptions extends ApiFileOptions {
  state?: State;
}

//#endregion

//#region internal typings
// @internal

export interface ApiIconSchema {
  $schema?: string;
  files: ApiIconFileDefinitions;
  folders: ApiIconFolderDefinitions;
  light: ApiIconDefinitions;
}
// @internal

export interface ApiIconDefinitions {
  files: ApiIconFileDefinitions;
  folders: ApiIconFolderDefinitions;
}
// @internal

export interface ApiIconFileDefinitions {
  _default: string;
  extensions: Record<string, string>;
  filenames: Record<string, string>;
}
// @internal

export interface ApiIconFolderDefinitions {
  [name: string]: Record<State, string>;
  _default: Record<State, string>;
}

//#endregion

function assert(name: unknown): void {
  ok(
    typeof name === 'string' && name.trim() !== '',
    new TypeError('missing required parameter: "name"'),
  );
}

function getIconPath(filePath: string, includePath: boolean): string {
  if (includePath) {
    return filePath;
  }

  // Extracts the filename from the full file path,
  // ignoring the directory part
  // Supports both Unix-style (/) and Windows-style (\\) path separators
  const separatorIndex = Math.max(
    filePath.lastIndexOf('/'),
    filePath.lastIndexOf('\\'),
  );

  return filePath.slice(separatorIndex + 1);
}

export function getFileIcon(name: string, options?: ApiFileOptions): string {
  assert(name);

  const normalizedName = name.toLocaleLowerCase();

  const theme = options?.theme ?? 'dark';
  const includePath = options?.includePath ?? false;

  const themeIcons: ApiIconFileDefinitions =
    theme === 'light' ? apiManifest.light.files : apiManifest.files;

  const getExtensionIcon = (
    extensions: Record<string, string>,
  ): string | undefined => {
    let matchedPath: string | undefined;
    let matchedExtensionLength = 0;
    for (const [extension, iconPath] of Object.entries(extensions)) {
      const normalizedExtension = extension.toLocaleLowerCase();
      if (
        extension.length > matchedExtensionLength &&
        normalizedName.endsWith(`.${normalizedExtension}`)
      ) {
        matchedPath = iconPath;
        matchedExtensionLength = extension.length;
      }
    }
    return matchedPath;
  };

  // Resolves the exact filename,
  // then the normalized filename,
  // then the longest extension suffix,
  // then theme default,
  // then the base default (dark)
  const filenamePath: string =
    themeIcons.filenames[name] ||
    themeIcons.filenames[normalizedName] ||
    getExtensionIcon(themeIcons.extensions) ||
    themeIcons._default ||
    apiManifest.files._default;

  return getIconPath(filenamePath, includePath);
}

export function getFolderIcon(
  name: string,
  options?: ApiFolderOptions,
): string {
  assert(name);

  const normalizedName = name.toLocaleLowerCase();

  const theme = options?.theme ?? 'dark';
  const state = options?.state ?? 'closed';
  const includePath = options?.includePath ?? false;

  const themeIcons: ApiIconFolderDefinitions =
    theme === 'light' ? apiManifest.light.folders : apiManifest.folders;

  // Resolves the name and state,
  // then the normalized name and state,
  // then the theme default and state,
  // then the base default (dark) and state
  const filenamePath: string =
    themeIcons[name]?.[state] ||
    themeIcons[normalizedName]?.[state] ||
    themeIcons._default?.[state] ||
    apiManifest.folders._default?.[state];

  if (filenamePath === undefined) {
    throw new Error(`No default folder icon for state "${state}"`);
  }

  return getIconPath(filenamePath, includePath);
}
