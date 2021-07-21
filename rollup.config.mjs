import nodeResolve from '@rollup/plugin-node-resolve';
import { externalModules } from '@run-z/rollup-helpers';
import path from 'path';
import { defineConfig } from 'rollup';
import flatDts from 'rollup-plugin-flat-dts';
import sourcemaps from 'rollup-plugin-sourcemaps';
import ts from 'rollup-plugin-typescript2';
import typescript from 'typescript';

export default defineConfig({
  input: {
    squadron: './src/index.ts',
    'squadron.testing': './src/testing/index.ts',
    'squadron.vm-loader': './src/vm-loader/index.ts',
    'squadron.vm-loader.formation': './src/vm-loader/formation/index.ts',
  },
  plugins: [
    ts({
      typescript,
      tsconfig: 'tsconfig.main.json',
      cacheRoot: 'target/.rts2_cache',
    }),
    nodeResolve(),
    sourcemaps(),
  ],
  external: externalModules(),
  manualChunks(id) {
    if (id.startsWith(path.resolve('src', 'testing') + path.sep)) {
      return 'squadron.testing';
    }
    if (id.startsWith(path.resolve('src', 'vm-loader', 'formation') + path.sep)) {
      return 'squadron.vm-loader.formation';
    }
    if (id.startsWith(path.resolve('src', 'vm-loader') + path.sep)) {
      return 'squadron.vm-loader';
    }
    return 'squadron';
  },
  output: {
    dir: '.',
    format: 'esm',
    sourcemap: true,
    entryFileNames: 'dist/[name].js',
    chunkFileNames: 'dist/_[name].js',
    plugins: [
      flatDts({
        tsconfig: 'tsconfig.main.json',
        lib: true,
        compilerOptions: {
          declarationMap: true,
        },
        entries: {
          testing: {
            file: 'testing/index.d.ts',
          },
          'vm-loader': {
            file: 'vm-loader/index.d.ts',
          },
          'vm-loader/formation': {
            file: 'vm-loader/formation/index.d.ts',
          },
        },
        internal: ['**/impl/**', '**/*.impl'],
      }),
    ],
  },
});
