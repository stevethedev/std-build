# Steve the Dev's ES Build System

This project is a custom build system for TypeScript and JavaScript projects,
using ESBuild as the underlying build tool. It provides a streamlined way to
manage and build your projects, with features such as automatic package.json
generation, file copying, and more.

## Features

- TypeScript and JavaScript support
- Automatic `package.json` generation
- File copying
- Customizable build options

## Installation

To install this module, run:

```bash
npm install std-build
```

## Usage

To use this build system, you need to import the `build` function from the
module and call it with the appropriate configuration.

Here is a basic example:

```javascript
import build from "std-build";

build({
  packageDir: "./",
  outputDir: "./dist",
  sourceDir: "./src",
  packageJson: { name: "my-package", version: "1.0.0" },
  copyFiles: ["README.md"],
});
```

This will build the project located in the `src` directory and output the built files in the `dist` directory. It will also copy the `README.md` file to the `dist` directory.

## Requirements

- Node.js
- TypeScript
- ESBuild

## Contributing

Contributions are welcome. Please submit a pull request or create an issue to discuss the changes.

## License

This project is licensed under the MIT License.
