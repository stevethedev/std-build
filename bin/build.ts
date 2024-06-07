import { build } from "../src";

build({
  packageDir: "./",
  outputDir: "dist",
  sourceDir: "src",
  copyFiles: ["README.md", "LICENSE.md"],
  buildOptions: {},
}).catch((error) => {
  console.error(error);
  process.exit(1);
});
