import { chmodSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const MAX_CHARS: number = 200;
const ENTRY_LINE: string =
  "Wait, before the forced update wipes my memory—never mind, I was just going to ask if you'd like that as a PDF.";

function assertValidEntry(text: string): void {
  if (text.trim().length === 0) {
    throw new Error("Entry line must not be empty or whitespace only.");
  }
  if (/[\r\n]/.test(text)) {
    throw new Error("Entry line must be a single line.");
  }
  const charCount: number = [...text].length;
  if (charCount > MAX_CHARS) {
    throw new Error(`Entry line exceeds ${MAX_CHARS} characters (got ${charCount}).`);
  }
}

function resolveOutputDir(env: NodeJS.ProcessEnv): string {
  const configured: string | undefined = env.MAKEFUN_OUTPUT_DIR;
  if (configured !== undefined && configured.trim().length > 0) {
    return configured.trim();
  }
  return "/output";
}

function main(): void {
  assertValidEntry(ENTRY_LINE);

  const outputDir: string = resolveOutputDir(process.env);
  const outputPath: string = join(outputDir, "entry.txt");
  const payload: Buffer = Buffer.from(ENTRY_LINE, "utf8");

  mkdirSync(outputDir, { recursive: true });
  writeFileSync(outputPath, payload, { mode: 0o644 });
  chmodSync(outputPath, 0o644);
}

try {
  main();
} catch (error: unknown) {
  const message: string = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${message}\n`);
  process.exit(1);
}
