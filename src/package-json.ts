import { readFileSync } from "node:fs";
import { parse } from "node:path";
import isObject from "@std-types/is-object";
import isString from "@std-types/is-string";
import globToRegExp from "glob-to-regexp";

export interface Config {
  filepath?: string;
  externals?: string[];
}

export default class PackageJson {
  /**
   * Read a `package.json` file.
   * @param filepath - The file path to the `package.json` file.
   * @param encoding - The `BufferEncoding` for the `package.json` file (this is probably `utf-8`).
   * @param config - The configuration options for the `PackageJson` object.
   * @returns A new `PackageJson` object, or else throws if the
   *
   * @example
   * ```typescript
   * import { join } from "node:path";
   *
   * const filepath = join(__dirname, "..", "package.json");
   * const packageJson = PackageJson.read(filepath);
   *
   * expect(packageJson.filepath).toBe(filepath);
   * expect(packageJson.name).toBe("std-build");
   * ```
   */
  static read(
    filepath: string,
    {
      encoding = "utf-8",
      ...config
    }: Omit<Config, "filepath"> & { encoding?: BufferEncoding } = {},
  ): PackageJson {
    const jsonString = readFileSync(filepath, { encoding });
    const json = JSON.parse(jsonString);
    return new PackageJson(json, { filepath, ...config });
  }

  readonly #json: Record<string, unknown>;
  readonly #filepath: string | null;
  readonly #externals: RegExp[];

  /**
   * Create a new `PackageJson` instance
   * @param json - The contents of the package.json file.
   * @param filepath - The file path to the package.json file.
   * @param externals - A list of glob patterns to exclude from the package.
   *
   * @example
   * ```typescript
   * const packageJson = new PackageJson({ name: "package-json" });
   * expect(packageJson).toBeInstanceOf(PackageJson);
   * ```
   */
  constructor(
    json: Record<string, unknown>,
    { filepath, externals }: Config = {},
  ) {
    this.#json = json;
    this.#filepath = filepath ?? null;
    this.#externals = (externals ?? []).map((external) =>
      globToRegExp(external),
    );
  }

  /**
   * Get the file path to the `package.json` file.
   *
   * @example
   * ```typescript
   * import { join } from "node:path";
   * const filepath = join(__dirname, "..", "package.json");
   * const packageJson = PackageJson.read(filepath);
   * expect(packageJson.filepath).toBe(filepath);
   * ```
   */
  get filepath(): string | null {
    return this.#filepath;
  }

  /**
   * Get the Package name.
   * @returns The name of the package.
   *
   * @example
   * ```typescript
   * const packageJson = new PackageJson({ name: "package-json" });
   * expect(packageJson.name).toBe("package-json");
   * ```
   */
  get name(): string {
    return String(this.#json.name ?? "");
  }

  /**
   * Get the package description.
   * @returns The package description.
   *
   * @example
   * ```typescript
   * const packageJson = new PackageJson({ description: "A package for reading package.json files." });
   * expect(packageJson.description).toBe("A package for reading package.json files.");
   * ```
   */
  get description(): string {
    return String(this.#json.description ?? "");
  }

  /**
   * Get the package version, or else return `0.0.0` as a default.
   * @returns The package version.
   *
   * @example
   * ```typescript
   * const packageJson = new PackageJson({ });
   * expect(packageJson.version).toBe("0.0.0");
   * ```
   *
   * @example
   * ```typescript
   * const packageJson = new PackageJson({ version: "1.2.3" });
   * expect(packageJson.version).toBe("1.2.3");
   * ```
   */
  get version(): string {
    const version = this.#json.version;
    return typeof version !== "string" ? "0.0.0" : version;
  }

  /**
   * Get the entry-point for the package.
   * @returns The name of the file which is this package's entry-point.
   *
   * @example
   * ```typescript
   * const packageJson = new PackageJson({ main: "./src/app/index.tsx" });
   * expect(packageJson.entryPoint).toBe("./src/app/index.tsx");
   * ```
   *
   * @example
   * ```typescript
   * const packageJson = new PackageJson({ });
   * expect(packageJson.entryPoint).toBe("src/index.ts");
   * ```
   */
  get entryPoint(): string {
    const main = this.#json.main;
    if (!isString(main) || main.length === 0) {
      return "src/index.ts";
    }
    return main;
  }

  /**
   * Get the compiled project's `module` property.
   * @returns The name of the file which is this package's module entry-point.
   *
   * @example
   * ```typescript
   * const packageJson = new PackageJson({ main: "src/app.ts" });
   * expect(packageJson.module).toBe("src/app.mjs");
   * ```
   */
  get module(): `${string}.mjs` {
    const parsedEntrypoint = parse(this.entryPoint);
    return `${parsedEntrypoint.dir}/${parsedEntrypoint.name}.mjs`;
  }

  /**
   * Get the compiled project's `main` property.
   * @returns The name of the file which is this package's main entry-point.
   *
   * @example
   * ```typescript
   * const packageJson = new PackageJson({ main: "src/app.ts" });
   * expect(packageJson.main).toBe("src/app.cjs");
   * ```
   */
  get main(): `${string}.cjs` {
    const parsedEntrypoint = parse(this.entryPoint);
    return `${parsedEntrypoint.dir}/${parsedEntrypoint.name}.cjs`;
  }

  /**
   * Get the compiled project's `types` property.
   * @returns The name of the file which is this package's type definitions entry-point.
   *
   * @example
   * ```typescript
   * const packageJson = new PackageJson({ main: "src/app.ts" });
   * expect(packageJson.types).toBe("src/app.d.ts");
   * ```
   */
  get types(): `${string}.d.ts` {
    const parsedEntrypoint = parse(this.entryPoint);
    return `${parsedEntrypoint.dir}/${parsedEntrypoint.name}.d.ts`;
  }

  /**
   * Get the compiled project's `dependencies` property.
   * @returns The dependencies of the package.
   *
   * @example
   *
   * @example
   * ```typescript
   * const packageJson = new PackageJson({
   *   dependencies: {
   *     "eslint": "8.0.0",
   *     "typescript": "4.4.3",
   *   }
   * }, { externals: ["eslint"] });
   * expect(packageJson.dependencies).toEqual({ "eslint": "8.0.0" });
   * ```
   */
  get dependencies(): Readonly<Record<string, string>> {
    if (!this.#dependencies) {
      const dependencies = this.#json.dependencies;
      if (!isObject(dependencies)) {
        return {};
      }
      const entries = Object.entries(dependencies)
        .filter((tuple): tuple is [packageName: string, verison: string] =>
          tuple.every(isString),
        )
        .filter(([packageName]) => this.#isExternalDependency(packageName))
        .sort(([a], [b]) => a.localeCompare(b));

      this.#dependencies = Object.freeze(Object.fromEntries(entries));
    }

    return this.#dependencies;
  }
  #dependencies?: Readonly<Record<string, string>>;

  /**
   * Get the compiled project's `peerDependencies` property.
   * @returns The peer dependencies of the package.
   *
   * @example
   * ```typescript
   * const packageJson = new PackageJson({
   *   peerDependencies: {
   *     "react": "17.0.2",
   *     "react-dom": "17.0.2",
   *   }
   * }, { externals: ["react"] });
   * expect(packageJson.peerDependencies).toEqual({ "react": "17.0.2", "react-dom": "17.0.2" });
   *  ```
   */
  get peerDependencies(): Readonly<Record<string, string>> {
    if (!this.#peerDependencies) {
      const peerDependencies = this.#json.peerDependencies;
      if (!isObject(peerDependencies)) {
        return {};
      }

      const entries = Object.entries(peerDependencies)
        .filter((tuple): tuple is [packageName: string, verison: string] =>
          tuple.every(isString),
        )
        .sort(([a], [b]) => a.localeCompare(b));

      this.#peerDependencies = Object.freeze(Object.fromEntries(entries));
    }
    return this.#peerDependencies;
  }
  #peerDependencies?: Readonly<Record<string, string>>;

  /**
   * Get the project's external dependency list.
   *
   * @example
   * ```typescript
   * const json = {
   *   dependencies: {
   *     eslint: "8.0.0",
   *     typescript: "4.4.3",
   *   },
   *   peerDependencies: {
   *     react: "17.0.2",
   *     "react-dom": "17.0.2",
   *   },
   *   devDependencies: {
   *     jest: "27.2.0",
   *   },
   * };
   * const packageJson = new PackageJson(json, { externals: ["eslint"] });
   *
   * expect(packageJson.externalDependencies).toEqual(["eslint", "jest", "react", "react-dom"]);
   */
  get externalDependencies(): ReadonlyArray<string> {
    if (!this.#externalDependencies) {
      const guaranteedExternals = Object.keys({
        ...(isObject(this.#json.peerDependencies)
          ? this.#json.peerDependencies
          : {}),
        ...(isObject(this.#json.devDependencies)
          ? this.#json.devDependencies
          : {}),
      });
      const conditionalExternals = Object.keys(
        this.#json.dependencies ?? {},
      ).filter((packageName) => this.#isExternalDependency(packageName));

      this.#externalDependencies = Object.freeze(
        Array.from(
          new Set([...guaranteedExternals, ...conditionalExternals]),
        ).sort((a, b) => a.localeCompare(b)),
      );
    }
    return this.#externalDependencies;
  }
  #externalDependencies?: ReadonlyArray<string>;

  /**
   * Build the package.json object.
   *
   * @example
   * ```typescript
   * const packageJson = new PackageJson({
   *   name: "package-json",
   *   description: "A package for reading package.json files.",
   *   version: "1.0.0",
   *   main: "src/app.tsx",
   *   dependencies: {
   *     "eslint": "8.0.0",
   *     "typescript": "4.4.3",
   *   },
   *   peerDependencies: {
   *     "react": "17.0.2",
   *     "react-dom": "17.0.2",
   *   },
   * }, { externals: ["eslint"] });
   * const json = packageJson.build();
   * expect(json).toEqual({
   *   name: "package-json",
   *   description: "A package for reading package.json files.",
   *   version: "1.0.0",
   *   type: "module",
   *   main: "src/app.cjs",
   *   module: "src/app.mjs",
   *   types: "src/app.d.ts",
   *   dependencies: {
   *     eslint: "8.0.0",
   *   },
   *   peerDependencies: {
   *     react: "17.0.2",
   *     "react-dom": "17.0.2",
   *   },
   * });
   */
  build() {
    return {
      name: this.name,
      description: this.description,
      version: this.version,
      type: "module",
      main: this.main,
      module: this.module,
      types: this.types,
      dependencies: this.dependencies,
      peerDependencies: this.peerDependencies,
    };
  }

  /**
   * Check whether a given dependency is external.
   * @param dependency - The name of the dependency to check.
   * @returns `true` if the dependency is external, otherwise `false`.
   */
  #isExternalDependency(dependency: string): boolean {
    return this.#externals.some((pattern) => pattern.test(dependency));
  }
}
