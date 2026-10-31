import { readFile } from "node:fs/promises";
import { build } from "esbuild";

const userscriptMetadata = await readFile("userscript.meta.js", "utf8");

await build({
    entryPoints: ["src/main.js"],
    bundle: true,
    platform: "browser",
    format: "iife",
    outfile: "dist/qoj-ccpc-enhancer.user.js",
    banner: {
        js: userscriptMetadata.trim(),
    },
    minify: false,
    logLevel: "info",
});
