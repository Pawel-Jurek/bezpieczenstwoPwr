import typescript from "@rollup/plugin-typescript";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import { babel } from "@rollup/plugin-babel";
import copy from "rollup-plugin-copy";
import { terser } from "rollup-plugin-terser";

export default {
  input: "src/index.ts",
  output: {
    file: "dist/index.js",
    sourcemap: true,
    format: "umd",
    name: "bbotd",
    globals: {
      "@tensorflow/tfjs": "tf",
    },
  },
  external: ["@tensorflow/tfjs"],
  plugins: [
    nodeResolve({
      browser: true,
      preferBuiltins: false,
    }),
    commonjs(),
    typescript({
      tsconfig: "./tsconfig.json",
      declaration: true,
      declarationDir: "dist/types",
    }),
    babel({
      babelHelpers: "bundled",
      extensions: [".ts", ".js"],
    }),
    terser({
      format: {
        comments: false,
      },
    }),
    copy({
      targets: [
        {
          src: "models/*",
          dest: "dist",
        },
      ],
    }),
  ],
};
