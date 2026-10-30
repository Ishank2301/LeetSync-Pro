import fs from "node:fs";
import { execSync } from "node:child_process";

const outputZip = "leetcode-tracker-extension.zip";
const tmpPy = ".zip_build.py";

console.log("📦 Packaging LeetCode Tracker extension...");

const scriptContent = `
import zipfile
import os

output = "${outputZip}"
with zipfile.ZipFile(output, "w", zipfile.ZIP_DEFLATED) as z:
    for root, dirs, files in os.walk("extension"):
        for f in sorted(files):
            full_path = os.path.join(root, f)
            arcname = os.path.relpath(full_path, "extension")
            z.write(full_path, arcname)

size = os.path.getsize(output)
print(f"✅ Created {output} ({size:,} bytes)")
`;

try {
  fs.writeFileSync(tmpPy, scriptContent, "utf-8");
  execSync(`python3 ${tmpPy}`, { stdio: "inherit" });
} catch (e) {
  console.error("Packaging failed:", e);
  process.exit(1);
} finally {
  if (fs.existsSync(tmpPy)) {
    fs.unlinkSync(tmpPy);
  }
}
