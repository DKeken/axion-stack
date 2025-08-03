/**
 * TypeScript declarations for @repo/eslint-config
 */

import type { ESLint } from 'eslint';

// ESLint flat config type
export type FlatConfig = ESLint.ConfigData;

// Configuration options interface
export interface ConfigOptions {
  withPrettier?: boolean;
}

// Individual configuration exports
export declare const base: FlatConfig[];
export declare const nestjs: FlatConfig[];
export declare const react: FlatConfig[];
export declare const prettier: FlatConfig[];

// Utility functions
export declare function defineConfig(...configs: FlatConfig[][]): FlatConfig[];

export declare function createBaseConfig(options?: ConfigOptions): FlatConfig[];
export declare function createNestJSConfig(options?: ConfigOptions): FlatConfig[];
export declare function createReactConfig(options?: ConfigOptions): FlatConfig[];

// Predefined configurations
export declare const configs: {
  base: FlatConfig[];
  nestjs: FlatConfig[];
  react: FlatConfig[];
  baseOnly: FlatConfig[];
  nestjsOnly: FlatConfig[];
  reactOnly: FlatConfig[];
};

// Default export
declare const defaultExport: typeof configs;
export default defaultExport;
