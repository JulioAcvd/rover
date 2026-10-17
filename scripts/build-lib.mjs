import { execSync } from "node:child_process";
import { cpSync, rmSync } from "node:fs";

rmSync("dist", { recursive: true, force: true });
execSync("tsc -p tsconfig.build.json", { stdio: "inherit" });
cpSync("src/data/map.png", "dist/data/map.png");
