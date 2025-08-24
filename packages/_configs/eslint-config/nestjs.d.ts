import type { ESLint } from 'eslint';

export type FlatConfig = ESLint.ConfigData;

declare const nestjs: FlatConfig[];
export default nestjs;
