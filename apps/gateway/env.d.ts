declare module 'bun' {
  interface Env {
    PORT?: string;
    NODE_ENV?: 'development' | 'production' | 'test';
  }
}
