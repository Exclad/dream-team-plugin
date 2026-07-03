#!/usr/bin/env node

/**
 * create-dream-team — Install the AI Agent Dream Team into your Claude Code project.
 *
 * What it does:
 * 1. Installs the dream-team Claude Code plugin via marketplace
 * 2. Scaffolds .claude/memory/ with all templates
 * 3. Creates CLAUDE.md bootstrap file (or merges with existing)
 * 4. Creates .claude/rules/ directory
 * 5. Adds recommended permissions to .claude/settings.json
 *
 * Usage: npx create-dream-team
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const cwd = process.cwd();
const templateDir = path.join(__dirname, '..', 'templates');

// ANSI colors
const green = (s) => `\x1b[32m${s}\x1b[0m`;
const yellow = (s) => `\x1b[33m${s}\x1b[0m`;
const cyan = (s) => `\x1b[36m${s}\x1b[0m`;
const bold = (s) => `\x1b[1m${s}\x1b[0m`;

function log(msg) { console.log(msg); }
function success(msg) { console.log(green('✓ ' + msg)); }
function warn(msg) { console.log(yellow('⚠ ' + msg)); }
function info(msg) { console.log(cyan('→ ' + msg)); }

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function fileExists(p) { return fs.existsSync(p); }

// ─── Step 1: Install the plugin ────────────────────────────────────────────
log(bold('\n🤖 AI Agent Dream Team — Installer\n'));

info('Step 1/5: Installing dream-team plugin...');

let pluginInstalled = false;
try {
  // Try adding the marketplace
  execSync('claude plugin marketplace add Exclad/dream-team-plugin', {
    stdio: 'pipe',
    timeout: 30000
  });
  log('  Marketplace registered.');
} catch (e) {
  // Marketplace might already be registered — that's fine
  if (e.stderr && e.stderr.toString().includes('already')) {
    log('  Marketplace already registered.');
  } else {
    warn('  Could not register marketplace. You can add it manually:');
    warn('  claude plugin marketplace add Exclad/dream-team-plugin');
  }
}

try {
  execSync('claude plugin install dream-team@dream-team-marketplace', {
    stdio: 'pipe',
    timeout: 60000
  });
  pluginInstalled = true;
  success('Plugin installed: dream-team@dream-team-marketplace');
} catch (e) {
  warn('  Could not auto-install plugin. Install manually:');
  warn('  claude plugin install dream-team@dream-team-marketplace');
}

// ─── Step 2: Scaffold memory infrastructure ─────────────────────────────────
info('Step 2/5: Scaffolding memory infrastructure...');

const claudeDir = path.join(cwd, '.claude');
const memoryDir = path.join(claudeDir, 'memory');
const templateMemoryDir = path.join(templateDir, 'memory');

if (!fileExists(memoryDir)) {
  copyDir(templateMemoryDir, memoryDir);
  success('Created .claude/memory/ with all templates');
} else {
  // Merge: only copy templates that don't already exist
  function mergeTemplates(src, dest) {
    for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      if (entry.isDirectory()) {
        fs.mkdirSync(destPath, { recursive: true });
        mergeTemplates(srcPath, destPath);
      } else if (!fileExists(destPath)) {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }
  mergeTemplates(templateMemoryDir, memoryDir);
  success('Merged memory templates into existing .claude/memory/');
}

// ─── Step 3: Create CLAUDE.md ───────────────────────────────────────────────
info('Step 3/5: Setting up CLAUDE.md...');

const templateClaudeMd = path.join(templateDir, 'CLAUDE.md');
const projectClaudeMd = path.join(cwd, 'CLAUDE.md');

const DREAM_TEAM_MARKER = '<!-- dream-team:managed -->';

if (!fileExists(projectClaudeMd)) {
  fs.copyFileSync(templateClaudeMd, projectClaudeMd);
  success('Created CLAUDE.md');
} else {
  const existing = fs.readFileSync(projectClaudeMd, 'utf-8');
  if (!existing.includes(DREAM_TEAM_MARKER)) {
    // Append dream team section to existing CLAUDE.md
    const dreamTeamSection = fs.readFileSync(templateClaudeMd, 'utf-8');
    fs.appendFileSync(projectClaudeMd, '\n\n---\n\n' + dreamTeamSection);
    success('Appended Dream Team section to existing CLAUDE.md');
  } else {
    log('  CLAUDE.md already has the Dream Team section — skipping.');
  }
}

// ─── Step 4: Create rules directory ─────────────────────────────────────────
info('Step 4/5: Setting up .claude/rules/...');

const rulesDir = path.join(claudeDir, 'rules');
const templateRulesDir = path.join(templateDir, 'rules');

if (!fileExists(rulesDir)) {
  copyDir(templateRulesDir, rulesDir);
  success('Created .claude/rules/');
} else {
  log('  .claude/rules/ already exists — skipping.');
}

// ─── Step 5: Settings recommendations ───────────────────────────────────────
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

// ─── Done ───────────────────────────────────────────────────────────────────
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
log('Learn more: https://github.com/Exclad/dream-team-plugin');
log('');
