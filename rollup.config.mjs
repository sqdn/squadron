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
    'squadron.launch': './src/launch/index.ts',
    'squadron.launch.formation': './src/launch/formation/index.ts',
    'squadron.launch.hub': './src/launch/hub/index.ts',
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
    if (id.startsWith(path.resolve('src', 'launch', 'formation') + path.sep)) {
      return 'squadron.launch.formation';
    }
    if (id.startsWith(path.resolve('src', 'launch', 'hub') + path.sep)) {
      return 'squadron.launch.hub';
    }
    if (id.startsWith(path.resolve('src', 'launch') + path.sep)) {
      return 'squadron.launch';
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
          launch: {
            file: 'launch/index.d.ts',
          },
          'launch/formation': {
            file: 'launch/formation/index.d.ts',
          },
          'launch/hub': {
            file: 'launch/hub/index.d.ts',
          },
          testing: {
            file: 'testing/index.d.ts',
          },
        },
        internal: ['**/impl/**', '**/*.impl'],
      }),
    ],
  },
});
