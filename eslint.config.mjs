import babelParser from '@babel/eslint-parser'
import nextPlugin from '@next/eslint-plugin-next'

export default [
  {
    files: ['**/*.{js,jsx,mjs,ts,tsx,mts,cts}'],
    plugins: { '@next/next': nextPlugin },
    languageOptions: {
      parser: babelParser,
      parserOptions: {
        requireConfigFile: false,
        sourceType: 'module',
        allowImportExportEverywhere: true,
        babelOptions: {
          presets: [
            '@babel/preset-typescript',
            ['@babel/preset-react', { runtime: 'automatic' }],
          ],
          caller: { supportsTopLevelAwait: true },
        },
      },
    },
    rules: nextPlugin.configs['core-web-vitals'].rules,
  },
  { ignores: ['.next/**', 'out/**', 'node_modules/**'] },
]
