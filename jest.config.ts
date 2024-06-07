/**
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

import { type Config } from "jest";

export default {
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageProvider: "v8",
  preset: "std-jest",
  testEnvironment: "jest-environment-node",
  testPathIgnorePatterns: ["/node_modules/", "/dist/", "/coverage/"],
} satisfies Config;
