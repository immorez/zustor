import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true, // Generate TypeScript declaration files
  sourcemap: true,
  clean: true,
  external: ['react', 'zustand'],
  minify: true
});