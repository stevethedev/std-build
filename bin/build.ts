import { build } from "../src";

build({
  packageDir: "./",
  outputDir: "dist",
  copyFiles: ["README.md", "LICENSE.md"],
  buildOptions: {},
}).catch((error) => {
  console.error(error);
  process.exit(1);
});
