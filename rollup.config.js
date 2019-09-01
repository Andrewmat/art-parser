import resolve from 'rollup-plugin-node-resolve'

export default {
  input: 'src/index.mjs',
  output: [
    {
      file: 'page_test/dist/art-parser.js',
      format: 'esm',
    },
  ],
  plugins: [resolve()],
}
