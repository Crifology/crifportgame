// compiles JS in code files to read in browser JS
// optimizations and compact code - least amount of space

import { defaultConfig, defineConfig } from "vite";

export default defineConfig({
    base: "./",
    build: {
        minify: "terser",
    },
})