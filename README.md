<div align="center">

<h1>VSCode Icons API</h1>

<p><strong>Resolve bundled vscode-icons file and folder icons from Node.js.</strong></p>

<p>
  <a href="https://www.npmjs.com/package/@vscode-icons/vscode-icons-api"><img alt="npm version" src="https://img.shields.io/npm/v/%40vscode-icons/vscode-icons-api"></a>
  <a href="https://nodejs.org/"><img alt="Node.js 22 or later" src="https://img.shields.io/badge/Node.js-%3E%3D22-339933?logo=node.js&amp;logoColor=white"></a>
  <a href="LICENSE"><img alt="MIT license" src="https://img.shields.io/badge/license-MIT-blue.svg"></a>
</p>

<p><strong>Icons are based on <a href="https://github.com/vscode-icons/vscode-icons">vscode-icons</a> version: <code>13.0.0</code></strong></p>

</div>

## Description

**VSCode Icons API** is a lightweight `Node.js` package for looking up the
[vscode-icons](https://github.com/vscode-icons/vscode-icons) assets used for a
file or folder. It bundles the icon manifest and SVG files, so you can resolve a
file icon by filename or extension, or a folder icon by name and open/closed
state. Choose the dark or light theme and return either the icon filename or its
package-relative path. Unmatched names use the theme’s default icon.

## Installation

Install the package from npm:

```sh
npm install @vscode-icons/vscode-icons-api
```

## API

The package exports these functions:

- `getFileIcon(name, options?)`: Returns the icon for a filename. It checks
  exact filename mappings first, then matches the longest file extension, and
  falls back to the theme default.
- `getFolderIcon(name, options?)`: Returns the icon for a folder name and state,
  falling back to the theme default when there is no matching folder.

Both functions require a non-empty `name` string. They return an icon filename
by default, or the icon path within the package when `includePath` is `true`.

## API options

`ApiFileOptions` is accepted by `getFileIcon`:

| Option        | Type                | Default  | Description                                                  |
| ------------- | ------------------- | -------- | ------------------------------------------------------------ |
| `includePath` | `boolean`           | `false`  | Return the icon's package path instead of only its filename. |
| `theme`       | `'dark' \| 'light'` | `'dark'` | Select the icon theme.                                       |

`ApiFolderOptions` extends `ApiFileOptions` and is accepted by `getFolderIcon`.
It adds:

| Option  | Type                   | Default    | Description                           |
| ------- | ---------------------- | ---------- | ------------------------------------- |
| `state` | `'closed' \| 'opened'` | `'closed'` | Select the folder icon for its state. |

The `Theme`, `State`, `ApiFileOptions`, and `ApiFolderOptions` types are also
exported.

## Usage

```js
import { getFileIcon, getFolderIcon } from 'vscode-icons-api';

const fileIcon = getFileIcon('package.json');
const lightFileIconPath = getFileIcon('data.json', {
  theme: 'light',
  includePath: true,
});
const openFolderIcon = getFolderIcon('src', {
  state: 'opened',
});
const closedFolderIcon = getFolderIcon('src');

console.log(fileIcon);
console.log(lightFileIconPath);
console.log(openFolderIcon);
console.log(closedFolderIcon);
```

Output:

```text
file_type_npm.svg
./icons/file_type_light_json.svg
folder_type_src_opened.svg
folder_type_src.svg
```

## License

The source code is licensed under the
[MIT](https://github.com/vscode-icons/vscode-icons-api/blob/master/LICENSE)
license.

The icons are licensed under the
[Creative Commons - ShareAlike (CC BY-SA)](https://creativecommons.org/licenses/by-sa/4.0/)
license.

Branded icons are licensed under their copyright license.

## Versioning

This repository follows [Semantic Versioning 2.0.0](https://semver.org/).

**Enjoy!**
