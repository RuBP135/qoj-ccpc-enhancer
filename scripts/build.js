import { build } from "esbuild";

await build({
    entryPoints: ["src/main.js"],
    bundle: true,
    platform: "browser",
    format: "iife",
    outfile: "dist/qoj-ccpc-enhancer.user.js",
    minify: false,
    logLevel: "info",
});
