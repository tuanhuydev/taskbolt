---
name: acquire-codebase-knowledge
description: 'Map, document, or onboard into an existing codebase using a high-performance Node.js scanner. Generates verifiable architectural documentation.'
compatibility: 'Node.js 18+. Cross-platform. Run scripts/scan.js from project root.'
metadata:
  version: "2.0-Node-Secure"
  capabilities: [Async FS crawling, Native JSON parsing, Token-optimized mapping]
  security_level: "Strict (Read-only, Zero-Execution)"
argument-hint: 'Optional: focus area (e.g., "authentication flow", "infrastructure")'
---

# Acquire Codebase Knowledge (Node.js Optimized)

Produces seven evidence-based documentation files in `docs/codebase/`. You must act as a strict technical auditor. **Rule Zero: If it isn't explicitly visible in the code, configuration, or scan output, it does not exist.** 

## 📋 Output Contract (Mandatory)
1. **The Seven Files:** Exactly these files must be created: `STACK.md`, `STRUCTURE.md`, `ARCHITECTURE.md`, `CONVENTIONS.md`, `INTEGRATIONS.md`, `TESTING.md`, `CONCERNS.md`.
2. **Hard Evidence:** Every technical claim must cite its source. Format: `[Claim] — (Source: path/to/file.ext)`.
3. **No Hallucinations:** Use `[TODO]` for unknowns. Use `[ASK USER]` for intent-based decisions.
4. **Validation Summary:** Your final response to the user must include a numbered list of `[ASK USER]` items and a "Divergence Report" (Intent vs. Actual Stack).

## 🔄 Execution Workflow

### Phase 1: Secure High-Speed Scan
1. Run the Node.js scanner from the project root. It will safely map the project without opening large binaries or artifact folders:
   ```bash
   node "$SKILL_ROOT/scripts/scan.js" --output docs/codebase/.codebase-scan.json
   ```
2. Read the resulting `.codebase-scan.json`. Look at the `metrics` to understand the dominant languages and framework.
3. Read high-level intent documents (`README.md`, `docs/`) to understand what the project *claims* to be.

### Phase 2: Targeted Investigation
Cross-reference the scan map against reality:
*   **Manifests First:** Parse `package.json`, `composer.json`, `go.mod`, or `requirements.txt` to find actual dependencies.
*   **Path Aliases:** Check `tsconfig.json` (compilerOptions.paths) or `vite.config.js` to map aliases (e.g., `@/components`) to real directories.
*   **Hidden Services:** Check `docker-compose.yml` or `.env.example` for required infrastructure (Redis, PostgreSQL).

### Phase 3: Populate Templates
Draft the seven documents in `docs/codebase/`. 
*   *Optimization:* Do not document `node_modules`, `dist`, `build`, or `.next` patterns. Source files only.
*   *Security:* **Never** record actual secret values. Document the keys required (e.g., "Requires `AWS_ACCESS_KEY`").

### Phase 4: Self-Audit & Delivery
Run this mental check before finalizing:
1. Did I assume an architecture (like MVC) just because of folder names, or did I verify the data flow?
2. Are my citations pointing to real files found in the scan?
3. Present the final summary to the user.

## 🎯 Focus Area Mode
If the user specifies a focus (e.g., "Just map the testing setup"):
1. Run the full Phase 1 scan (context is required).
2. Deep-dive and fully populate the requested documents (e.g., `TESTING.md` and `CONCERNS.md`).
3. For non-focus documents, populate only the Core Requirements based on the manifest, and mark the rest `[SKELETON - OUT OF SCOPE]`.

---

## 🛠️ Required Asset: scan.js
**Human Setup Instructions:** Before using this skill, create a `scripts/` folder in your AI's skill root and save the following code as `scan.js`. This is the engine the AI uses to map the repository securely.

```javascript
#!/usr/bin/env node

/**
 * Codebase Scanner (Node.js Optimized)
 * Safely maps directory structures, gathers metrics, and extracts manifest data 
 * without exposing sensitive info or crashing on large files.
 */

const fs = require('fs').promises;
const path = require('path');

// CLI Arguments parsing
const args = process.argv.slice(2);
const outIndex = args.indexOf('--output');
const outputFile = outIndex !== -1 ? args[outIndex + 1] : '.codebase-scan.json';

// Directories and files to always ignore to save AI context/tokens
const IGNORE_DIRS = new Set(['node_modules', '.git', 'dist', 'build', '.next', 'out', 'coverage', 'vendor', '__pycache__']);
const IGNORE_EXTS = new Set(['.png', '.jpg', '.jpeg', '.gif', '.ico', '.svg', '.mp4', '.pdf', '.zip', '.tar', '.gz', '.woff', '.ttf']);
const IMPORTANT_MANIFESTS = ['package.json', 'tsconfig.json', 'docker-compose.yml', 'requirements.txt', 'Cargo.toml', 'go.mod'];

async function scanDirectory(dir, baseDir = dir) {
    let results = { files: [], dirs: [] };
    
    try {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            const relPath = path.relative(baseDir, fullPath);

            if (entry.isDirectory()) {
                if (IGNORE_DIRS.has(entry.name)) continue;
                results.dirs.push(relPath);
                
                // Recursively scan subdirectories
                const subResults = await scanDirectory(fullPath, baseDir);
                results.files.push(...subResults.files);
                results.dirs.push(...subResults.dirs);
            } else if (entry.isFile()) {
                const ext = path.extname(entry.name).toLowerCase();
                if (IGNORE_EXTS.has(ext)) continue;
                
                results.files.push({
                    path: relPath,
                    ext: ext || 'no-extension',
                    name: entry.name
                });
            }
        }
    } catch (err) {
        console.warn(`[!] Skipping inaccessible directory: ${dir} - ${err.message}`);
    }
    
    return results;
}

async function extractManifests(baseDir) {
    const manifests = {};
    for (const filename of IMPORTANT_MANIFESTS) {
        try {
            const content = await fs.readFile(path.join(baseDir, filename), 'utf8');
            // If it's JSON, parse it to reduce token size by removing whitespace
            if (filename.endsWith('.json')) {
                const parsed = JSON.parse(content);
                // Remove heavy fields from package.json to save tokens
                if (parsed.description) delete parsed.description;
                if (parsed.repository) delete parsed.repository;
                manifests[filename] = parsed;
            } else {
                manifests[filename] = content.slice(0, 1500); // Cap at 1500 chars to save tokens
            }
        } catch (err) {
            // File doesn't exist, skip silently
        }
    }
    return manifests;
}

async function generateReport() {
    const rootDir = process.cwd();
    console.log(`[i] Starting optimized scan of: ${rootDir}`);
    
    const { files, dirs } = await scanDirectory(rootDir);
    
    // Tally file extensions to determine stack
    const extTally = files.reduce((acc, file) => {
        acc[file.ext] = (acc[file.ext] || 0) + 1;
        return acc;
    }, {});

    // Extract key configurations
    const manifests = await extractManifests(rootDir);

    const report = {
        scanTime: new Date().toISOString(),
        metrics: {
            totalFilesScanned: files.length,
            totalDirectories: dirs.length,
            languageExtensions: extTally
        },
        manifests: manifests,
        tree: files.map(f => f.path) // Flat list of relevant source files
    };

    // Ensure output directory exists
    const outPath = path.resolve(rootDir, outputFile);
    await fs.mkdir(path.dirname(outPath), { recursive: true });
    
    await fs.writeFile(outPath, JSON.stringify(report, null, 2));
    console.log(`[✓] Scan complete. Output saved to: ${outPath}`);
    console.log(`[i] Found ${files.length} relevant source files. Ready for AI analysis.`);
}

generateReport().catch(console.error);
```