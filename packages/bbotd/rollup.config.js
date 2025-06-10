import typescript from "@rollup/plugin-typescript";
import resolve from "@rollup/plugin-node-resolve";
import copy from "rollup-plugin-copy";
import json from "@rollup/plugin-json";
import url from "@rollup/plugin-url";
import replace from "@rollup/plugin-replace";

export default {
  input: "src/index.ts",
  output: {
    dir: "dist",
    format: "umd",
    name: "bbotd",
    sourcemap: true,
    globals: {
      "@tensorflow/tfjs": "tf",
    },
  },
  external: ["@tensorflow/tfjs"],
  plugins: [
    resolve(),
    json(),
    typescript({
      tsconfig: "./tsconfig.json",
      declaration: true,
      declarationDir: "dist",
    }),
    url({
      include: ["**/*.json", "**/*.bin"],
      limit: 0,
      emitFiles: true,
      fileName: "[name][extname]",
    }),
    copy({
      targets: [
        {
          src: "public/models/*",
          dest: "assets/",
        },
      ],
      verbose: true,
      hook: "buildEnd",
    }),
    replace({
      preventAssignment: true,
      "process.env.NODE_ENV": JSON.stringify(
        process.env.NODE_ENV || "production",
      ),
    }),
  ],
};
