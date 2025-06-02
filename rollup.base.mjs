import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import json from '@rollup/plugin-json';
import babel from '@rollup/plugin-babel';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';

/**
 * Creates a base Rollup config for any package.
 * @param {{
 *   input: string,
 *   outputDir: string,
 *   tsconfig: string,
 *   external?: string[],
 *   useBabel?: boolean,
 *   babelPresets?: any[],
 *   additionalPlugins?: any[],
 * }} options
 */
export const createBaseConfig = ({
  input,
  outputDir,
  tsconfig,
  external = [],
  useBabel = false,
  babelPresets = ['@babel/preset-env', '@babel/preset-typescript'],
  additionalPlugins = [],
}) => {
  const plugins = [
    peerDepsExternal(),
    resolve(),
    commonjs(),
    json(),
    typescript({
      tsconfig,
      declaration: true,
      declarationDir: `${outputDir}/types`,
      rootDir: 'src',
    }),
    ...additionalPlugins,
  ];

  if (useBabel) {
    plugins.push(
      babel({
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
        babelHelpers: 'bundled',
        exclude: 'node_modules/**',
        presets: babelPresets,
      }),
    );
  }

  return {
    input,
    output: {
      dir: outputDir,
      format: 'esm',
      sourcemap: true,
      entryFileNames: '[name].js',
      chunkFileNames: '[name]-[hash].js',
    },
    external: ['react', 'react-dom', ...external],
    plugins,
  };
};
