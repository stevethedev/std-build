import { existsSync } from "node:fs";
import { copyFile, mkdir, rm, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

export default class FileSystem {
  async cleanFolder(fp: string): Promise<void> {
    try {
      await rm(fp, { recursive: true, force: true });
    } catch {
      // Do nothing
    }
    await this.createFolder(fp);
  }

  async createFolder(fp: string): Promise<void> {
    try {
      await mkdir(fp, { recursive: true });
    } catch {
      // Do nothing
    }
  }

  async copyFile(source: string, destination: string): Promise<boolean> {
    if (!existsSync(source)) {
      return false;
    }

    try {
      await mkdir(dirname(destination), { recursive: true });
      await copyFile(source, destination);
    } catch {
      return false;
    }

    return true;
  }

  async writeFile(filepath: string, data: string | Buffer): Promise<void> {
    await mkdir(dirname(filepath), { recursive: true });
    await writeFile(filepath, data);
  }
}
