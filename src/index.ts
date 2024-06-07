import isObject from "@std-types/is-object";
import isString from "@std-types/is-string";
import { BuildOptions } from "esbuild";
import PackageBuilder from "./package-builder";
import PackageDirectory from "./package-directory";
import PackageJson from "./package-json";
import FileSystem from "./file-system";

export {
  type BuildOptions,
  PackageBuilder,
  PackageDirectory,
  PackageJson,
  FileSystem,
};

export interface Config {
  packageDir: string;
  outputDir: string;
  packageJson?: string | Record<string, unknown>;
  copyFiles?: string[];
  buildOptions?: BuildOptions;
}

export async function build({
  packageDir,
  outputDir,
  packageJson,
  copyFiles,
  buildOptions,
}: Config): Promise<void> {
  const packageBuilder = new PackageBuilder({
    packageDirectory: new PackageDirectory({
      packageDir,
      outputDir,
    }),
    packageJson: getPackageJson(packageJson),
    fileSystem: new FileSystem(),
    copyFiles,
  });

  await packageBuilder.build(buildOptions);
}

function getPackageJson(
  packageJson?: string | Record<string, unknown>,
): PackageJson | undefined {
  if (isString(packageJson)) {
    return PackageJson.read(packageJson);
  }
  if (isObject(packageJson)) {
    return new PackageJson(packageJson);
  }
  return undefined;
}
