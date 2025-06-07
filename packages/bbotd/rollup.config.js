import typescript from "@rollup/plugin-typescript";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import copy from "rollup-plugin-copy";

export default {
  input: "src/index.ts",
  output: {
    file: "dist/bbotd.min.js",
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
    typescript({
      tsconfig: "./tsconfig.json",
      declaration: true,
      declarationDir: "dist",
      declarationMap: false,
    }),
    commonjs(),
    copy({
      targets: [
        {
          src: "public/models/**/*",
          dest: "dist/models",
        },
      ],
    }),
  ],
};
