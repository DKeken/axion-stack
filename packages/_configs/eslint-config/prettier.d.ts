import type { ESLint } from 'eslint';

export type FlatConfig = ESLint.ConfigData;

declare const prettier: FlatConfig[];
export default prettier;
