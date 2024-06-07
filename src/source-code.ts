import { type BuildOptions, build as esbuild } from "esbuild";
import PackageDirectory from "./package-directory";
import PackageJson from "./package-json";

export interface Config {
  buildOptions?: BuildOptions;
  packageDirectory: PackageDirectory;
  packageJson: PackageJson;
}

export default class SourceCode {
  readonly #packageJson: PackageJson;
  readonly #packageDirectory: PackageDirectory;
  readonly #buildOptions: BuildOptions;

  constructor({ packageDirectory, packageJson, buildOptions = {} }: Config) {
    this.#packageJson = packageJson;
    this.#packageDirectory = packageDirectory;
    this.#buildOptions = buildOptions;
  }

  async build(): Promise<void> {
    const variants = [
      { outfile: this.#packageJson.main, format: "cjs" },
      { outfile: this.#packageJson.module, format: "esm" },
    ] as const;

    for (const variant of variants) {
      await this.#esbuildFile({
        ...variant,
        outfile: this.#packageDirectory.outputDir(variant.outfile),
      });
    }
  }

  async #esbuildFile(overrides: BuildOptions): Promise<void> {
    const { dtsPlugin } = await import("esbuild-plugin-d.ts");

    await esbuild({
      // Overridable Options
      target: "node20",
      platform: "node",

      // Global options
      ...this.#buildOptions,

      // Local options
      ...overrides,

      entryPoints: [
        this.#packageDirectory.packageDir(this.#packageJson.entryPoint),
      ],
      external: Array.from(
        new Set([
          ...(this.#buildOptions.external ?? []),
          ...(overrides.external ?? []),
          ...this.#packageJson.externalDependencies,
        ]),
      ),
      bundle: true,
      plugins: [
        ...(this.#buildOptions.plugins ?? []),
        ...(overrides.plugins ?? []),
        dtsPlugin({
          tsconfig: {
            compilerOptions: {
              // @ts-expect-error - This is a valid tsconfig option
              strictNullChecks: true,
              rootDir: this.#packageDirectory.packageDir(),
              outDir: this.#packageDirectory.outputDir(),
              esModuleInterop: true,
              target: "esnext",
              module: "nodenext",
              moduleResolution: "nodenext",
            },
          },
        }),
      ],
    });
  }
}
