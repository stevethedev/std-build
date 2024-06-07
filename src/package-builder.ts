import { BuildOptions } from "esbuild";
import FileSystem from "./file-system";
import type PackageDirectory from "./package-directory";
import PackageJson from "./package-json";
import SourceCode from "./source-code";

export interface Config {
  packageDirectory: PackageDirectory;
  packageJson?: PackageJson | null;
  fileSystem?: FileSystem | null;
  copyFiles?: string[] | null;
}

export default class PackageBuilder {
  readonly #packageDirectory: PackageDirectory;
  readonly #packageJson: PackageJson;
  readonly #fileSystem: FileSystem;
  readonly #copyFiles: ReadonlyArray<string>;

  constructor({
    packageDirectory,
    packageJson,
    fileSystem,
    copyFiles,
  }: Config) {
    this.#packageDirectory = packageDirectory;
    this.#fileSystem = fileSystem ?? new FileSystem();
    this.#packageJson =
      packageJson ??
      PackageJson.read(packageDirectory.packageDir("package.json"));
    this.#copyFiles = [...(copyFiles ?? [])];
  }

  async build(buildOptions?: BuildOptions): Promise<void> {
    await this.#fileSystem.cleanFolder(this.#packageDirectory.outputDir());
    await this.#fileSystem.createFolder(
      this.#packageDirectory.outputDir("src"),
    );

    await this.#buildPackageJson();
    await this.#buildJavaScript(buildOptions);
    await this.#buildCopiedFiles();
  }

  async #buildJavaScript(buildOptions?: BuildOptions): Promise<void> {
    const sourceCode = new SourceCode({
      packageDirectory: this.#packageDirectory,
      packageJson: this.#packageJson,
      buildOptions,
    });

    await sourceCode.build();
  }

  async #buildPackageJson(): Promise<void> {
    const packageJsonData = JSON.stringify(this.#packageJson.build(), null, 2);
    const packageJsonPath = this.#packageDirectory.outputDir("package.json");

    await this.#fileSystem.writeFile(packageJsonPath, packageJsonData);
  }

  async #buildCopiedFiles(): Promise<void> {
    const promises = this.#copyFiles.map(async (file) => {
      const source = this.#packageDirectory.packageDir(file);
      const destination = this.#packageDirectory.outputDir(file);
      await this.#fileSystem.copyFile(source, destination);
    });
    await Promise.all(promises);
  }
}
