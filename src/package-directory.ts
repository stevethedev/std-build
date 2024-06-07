import { join, normalize } from "node:path";

/**
 * The configuration for the `PackageDirectory` class.
 */
export interface Config {
  /**
   * The path to the root directory.
   */
  packageDir: string;

  /**
   * The path to the source directory.
   */
  sourceDir?: string;

  /**
   * The path to the output directory.
   */
  outputDir: string;
}

/**
 * A class to manage the paths of a package.
 */
export default class PackageDirectory {
  readonly #packageDir: string;
  readonly #sourceDir: string;
  readonly #outputDir: string;

  constructor({ packageDir, sourceDir, outputDir }: Config) {
    this.#packageDir = packageDir;
    this.#sourceDir = sourceDir ?? path(packageDir, "src");
    this.#outputDir = outputDir;
  }

  /**
   * The path to the root directory for the package.
   * @param fp - The file path to resolve.
   * @returns The path to the root directory for the package.
   *
   * @example
   * ```typescript
   * const packageDir = new PackageDirectory({
   *   packageName: "package-name",
   *   outputDir: "dist",
   *   packageDir: "path/to/package",
   * });
   *
   * expect(packageDir.packageDir()).toBe("path/to/package"); // "path/to/package"
   * expect(packageDir.packageDir("file.txt")).toBe("path/to/package/file.txt"); // "path/to/package/file.txt"
   * ```
   */
  packageDir(...fp: string[]): string {
    return path(this.#packageDir, ...fp);
  }

  /**
   * The path to the output directory.
   * @param fp - The file path to resolve.
   * @returns The path to the output directory.
   *
   * @example
   * ```typescript
   * const packageDir = new PackageDirectory({
   *   packageName: "package-name",
   *   sourceDir: "src",
   *   outputDir: "dist",
   * });
   * expect(packageDir.outputDir()).toBe("dist"); // "dist"
   * expect(packageDir.outputDir("file.txt")).toBe("dist/file.txt"); // "dist/file.txt"
   * ```
   */
  outputDir(...fp: string[]): string {
    return path(this.#outputDir, ...fp);
  }

  /**
   * The path to the source directory.
   * @param fp - The file path to resolve.
   * @returns The path to the source directory.
   *
   * @example
   * ```typescript
   * const packageDir = new PackageDirectory({
   *   packageName: "package-name",
   *   sourceDir: "src",
   *   outputDir: "dist",
   * });
   * expect(packageDir.sourceDir()).toBe("src"); // "src"
   * expect(packageDir.sourceDir("file.txt")).toBe("src/file.txt"); // "src/file.txt"
   * ```
   */
  sourceDir(...fp: string[]): string {
    return path(this.#sourceDir, ...fp);
  }
}

function path(...fp: string[]): string {
  return normalize(join(...fp)).replace(/\\/g, "/");
}
