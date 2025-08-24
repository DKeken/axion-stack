import type { ESLint } from 'eslint';

export type FlatConfig = ESLint.ConfigData;

declare const base: FlatConfig[];
export default base;
