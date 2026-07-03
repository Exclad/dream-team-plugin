#!/usr/bin/env node

/**
 * create-dream-team — Install, update, or uninstall the AI Agent Dream Team.
 *
 * Usage:
 *   npx create-dream-team              Install (default)
 *   npx create-dream-team update       Update plugin + merge any new templates
 *   npx create-dream-team uninstall    Remove plugin + project files
 *                                      (keeps .claude/memory/ unless --purge)
 *
 * Flags:
 *   --purge   with uninstall: also delete .claude/memory/ and .claude/rules/
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const cwd = process.cwd();
const templateDir = path.join(__dirname, '..', 'templates');

const PLUGIN_ID = 'dream-team@dream-team-marketplace';
const MARKETPLACE = 'dream-team-marketplace';
const MARKETPLACE_SOURCE = 'Exclad/dream-team-plugin';
const MARKER_START = '<!-- dream-team:managed -->';
const MARKER_END = '<!-- dream-team:end -->';

// ANSI colors
const green = (s) => `\x1b[32m${s}\x1b[0m`;
const yellow = (s) => `\x1b[33m${s}\x1b[0m`;
const cyan = (s) => `\x1b[36m${s}\x1b[0m`;
const bold = (s) => `\x1b[1m${s}\x1b[0m`;

function log(msg) { console.log(msg); }
function success(msg) { console.log(green('✓ ' + msg)); }
function warn(msg) { console.log(yellow('⚠ ' + msg)); }
function info(msg) { console.log(cyan('→ ' + msg)); }

function fileExists(p) { return fs.existsSync(p); }

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(srcPath, destPath);
    else fs.copyFileSync(srcPath, destPath);
  }
}

// Merge: only copy templates that don't already exist (never overwrite user files)
function mergeTemplates(src, dest) {
  let added = 0;
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      fs.mkdirSync(destPath, { recursive: true });
      added += mergeTemplates(srcPath, destPath);
    } else if (!fileExists(destPath)) {
      fs.copyFileSync(srcPath, destPath);
      added += 1;
    }
  }
  return added;
}

function tryClaude(cmd, timeout) {
  try {
    execSync(cmd, { stdio: 'pipe', timeout: timeout || 60000 });
    return { ok: true };
  } catch (e) {
    return { ok: false, err: e };
  }
}

const claudeDir = path.join(cwd, '.claude');
const memoryDir = path.join(claudeDir, 'memory');
const rulesDir = path.join(claudeDir, 'rules');
const projectClaudeMd = path.join(cwd, 'CLAUDE.md');
const templateClaudeMd = path.join(templateDir, 'CLAUDE.md');
const templateMemoryDir = path.join(templateDir, 'memory');
const templateRulesDir = path.join(templateDir, 'rules');

// ─────────────────────────────────────────────────────────────────────────────
function installCmd() {
  log(bold('\n🤖 AI Agent Dream Team — Installer\n'));

  info('Step 1/5: Installing dream-team plugin...');
  const mk = tryClaude(`claude plugin marketplace add ${MARKETPLACE_SOURCE}`, 30000);
  if (mk.ok) log('  Marketplace registered.');
  else if (mk.err.stderr && mk.err.stderr.toString().includes('already')) log('  Marketplace already registered.');
  else {
    warn('  Could not register marketplace. You can add it manually:');
    warn(`  claude plugin marketplace add ${MARKETPLACE_SOURCE}`);
  }
  if (tryClaude(`claude plugin install ${PLUGIN_ID}`).ok) {
    success(`Plugin installed: ${PLUGIN_ID}`);
  } else {
    warn('  Could not auto-install plugin. Install manually:');
    warn(`  claude plugin install ${PLUGIN_ID}`);
  }

  info('Step 2/5: Scaffolding memory infrastructure...');
  if (!fileExists(memoryDir)) {
    copyDir(templateMemoryDir, memoryDir);
    success('Created .claude/memory/ with all templates');
  } else {
    mergeTemplates(templateMemoryDir, memoryDir);
    success('Merged memory templates into existing .claude/memory/');
  }

  info('Step 3/5: Setting up CLAUDE.md...');
  if (!fileExists(projectClaudeMd)) {
    fs.copyFileSync(templateClaudeMd, projectClaudeMd);
    success('Created CLAUDE.md');
  } else {
    const existing = fs.readFileSync(projectClaudeMd, 'utf-8');
    if (!existing.includes(MARKER_START)) {
      const section = fs.readFileSync(templateClaudeMd, 'utf-8');
      fs.appendFileSync(projectClaudeMd, '\n\n---\n\n' + section);
      success('Appended Dream Team section to existing CLAUDE.md');
    } else {
      log('  CLAUDE.md already has the Dream Team section — skipping.');
    }
  }

  info('Step 4/5: Setting up .claude/rules/...');
  if (!fileExists(rulesDir)) {
    copyDir(templateRulesDir, rulesDir);
    success('Created .claude/rules/');
  } else {
    log('  .claude/rules/ already exists — skipping.');
  }

  info('Step 5/5: Checking permissions...');
  // Never write permissions silently — granting Bash access is a security-relevant
  // decision the user should make in their own settings. Print recommendations only.
  const settingsPath = path.join(claudeDir, 'settings.json');
  log('  Dream Team works best with these permissions in .claude/settings.json');
  log('  (add them yourself — this installer never grants permissions for you):');
  log('');
  log('  "permissions": {');
  log('    "allow": [');
  log('      "Bash(git:*)",');
  log('      "Bash(npm:*)",');
  log('      "Bash(npx:*)",');
  log('      "Bash(node:*)",');
  log('      "WebSearch"');
  log('    ]');
  log('  }');
  log('');
  if (fileExists(settingsPath)) {
    log('  Your .claude/settings.json already exists — merge the block above into it.');
  } else {
    log('  Create .claude/settings.json with the block above, or manage permissions');
    log('  interactively when Claude Code prompts you.');
  }

  log('');
  log(bold('🎉 Dream Team installed!'));
  log('');
  log('What you got:');
  log('  • 29 specialized agents (concierge, PM, architect, devs, reviewers...)');
  log('  • 10 slash commands (/dream-team, /plan, /build, /review, /debug...)');
  log('  • 7 verification gates (smoke, code, security, tests, perf, a11y, verify)');
  log('  • Memory infrastructure (.claude/memory/)');
  log('  • Self-learning system (patterns → rules)');
  log('');
  log(bold('Next steps:'));
  log('  1. Start a new Claude Code session (or restart current)');
  log('  2. Type ' + bold('/dream-team "I want to build..."'));
  log('  3. The concierge will interview you and the pipeline begins');
  log('');
  log('Update later:    npx create-dream-team update');
  log('Uninstall later: npx create-dream-team uninstall');
  log('Learn more: https://github.com/Exclad/dream-team-plugin');
  log('');
}

// ─────────────────────────────────────────────────────────────────────────────
function updateCmd() {
  log(bold('\n🤖 AI Agent Dream Team — Update\n'));

  info('Step 1/2: Updating plugin...');
  tryClaude(`claude plugin marketplace update ${MARKETPLACE}`, 30000);
  if (tryClaude(`claude plugin update ${PLUGIN_ID}`).ok) {
    success('Plugin updated to the latest version (restart Claude Code to apply).');
  } else {
    warn('  Could not auto-update. Run manually:');
    warn(`  claude plugin update ${PLUGIN_ID}`);
  }

  info('Step 2/2: Merging new memory templates...');
  if (fileExists(memoryDir)) {
    const added = mergeTemplates(templateMemoryDir, memoryDir);
    success(added > 0
      ? `Added ${added} new template file(s) — your existing files were not touched.`
      : 'No new templates — your memory is already up to date.');
  } else {
    log('  No .claude/memory/ in this project — nothing to merge.');
  }

  log('');
  log(bold('✅ Update complete.'));
  log('  New config options (if any) are documented in .claude/memory/config.md');
  log('  and the changelog: https://github.com/Exclad/dream-team-plugin/blob/main/CHANGELOG.md');
  log('');
}

// ─────────────────────────────────────────────────────────────────────────────
function uninstallCmd(purge) {
  log(bold('\n🤖 AI Agent Dream Team — Uninstall\n'));

  info('Step 1/3: Removing plugin...');
  if (tryClaude(`claude plugin uninstall ${PLUGIN_ID}`).ok) {
    success('Plugin uninstalled.');
  } else {
    warn('  Could not auto-uninstall (already removed, or claude CLI unavailable). Run manually:');
    warn(`  claude plugin uninstall ${PLUGIN_ID}`);
  }
  if (tryClaude(`claude plugin marketplace remove ${MARKETPLACE}`, 30000).ok) {
    success('Marketplace removed.');
  } else {
    log('  Marketplace not removed (may already be gone). Manual command:');
    log(`  claude plugin marketplace remove ${MARKETPLACE}`);
  }

  info('Step 2/3: Cleaning CLAUDE.md...');
  if (fileExists(projectClaudeMd)) {
    const content = fs.readFileSync(projectClaudeMd, 'utf-8');
    if (content.includes(MARKER_START)) {
      const start = content.indexOf(MARKER_START);
      const endIdx = content.indexOf(MARKER_END);
      const end = endIdx === -1 ? content.length : endIdx + MARKER_END.length;
      // Also strip the separator the installer added before the section
      const head = content.slice(0, start).replace(/\n*---\n*$/, '\n');
      const remainder = (head + content.slice(end)).trim();
      if (remainder === '') {
        fs.unlinkSync(projectClaudeMd);
        success('Removed CLAUDE.md (it contained only the Dream Team section).');
      } else {
        fs.writeFileSync(projectClaudeMd, remainder + '\n');
        success('Stripped the Dream Team section from CLAUDE.md (rest of the file kept).');
      }
    } else {
      log('  No Dream Team section in CLAUDE.md — leaving it alone.');
    }
  } else {
    log('  No CLAUDE.md — nothing to clean.');
  }

  info('Step 3/3: Project memory...');
  if (purge) {
    for (const dir of [memoryDir, rulesDir]) {
      if (fileExists(dir)) fs.rmSync(dir, { recursive: true, force: true });
    }
    // Remove .claude/ itself if now empty
    if (fileExists(claudeDir) && fs.readdirSync(claudeDir).length === 0) fs.rmdirSync(claudeDir);
    success('Deleted .claude/memory/ and .claude/rules/ (--purge).');
  } else {
    log('  Kept .claude/memory/ and .claude/rules/ — they contain YOUR project\'s');
    log('  decisions, patterns, and history, which may be useful even without the plugin.');
    log('  To delete them too, re-run: npx create-dream-team uninstall --purge');
  }

  log('');
  log(bold('👋 Dream Team uninstalled.'));
  log('  Restart Claude Code to fully unload the plugin.');
  log('');
}

// ─── Dispatch ────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const command = args.find((a) => !a.startsWith('--')) || 'install';
const purge = args.includes('--purge');

switch (command) {
  case 'install': installCmd(); break;
  case 'update': updateCmd(); break;
  case 'uninstall': uninstallCmd(purge); break;
  default:
    warn(`Unknown command: ${command}`);
    log('Usage: npx create-dream-team [install|update|uninstall] [--purge]');
    process.exit(1);
}
