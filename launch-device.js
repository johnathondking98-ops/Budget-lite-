#!/usr/bin/env node
/**
 * launch-device.js
 * Cross-platform entry point for `npm run launch:device`.
 *
 * On macOS / Linux : delegates directly to launch-device.sh via bash.
 * On Windows       : locates Git for Windows bash.exe, then delegates.
 *
 * Usage:
 *   npm run launch:device
 *   node launch-device.js [device-serial]
 */

'use strict';

const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

const scriptDir = __dirname;
const shellScript = path.join(scriptDir, 'launch-device.sh');
const deviceSerial = process.argv[2] || '';
const spawnArgs = deviceSerial ? [shellScript, deviceSerial] : [shellScript];

function run(bash) {
  const result = spawnSync(bash, spawnArgs, { stdio: 'inherit', shell: false });
  process.exit(result.status !== null ? result.status : 1);
}

if (os.platform() === 'win32') {
  // On Windows, bash is not available by default.
  // Look for Git for Windows bash in common install locations.
  const candidates = [
    process.env.PROGRAMFILES         && path.join(process.env.PROGRAMFILES,         'Git', 'bin', 'bash.exe'),
    process.env['PROGRAMFILES(X86)'] && path.join(process.env['PROGRAMFILES(X86)'], 'Git', 'bin', 'bash.exe'),
    'C:\\Program Files\\Git\\bin\\bash.exe',
    'C:\\Program Files (x86)\\Git\\bin\\bash.exe',
  ].filter(Boolean);

  let bashExe = null;
  for (const candidate of candidates) {
    try {
      // Use F_OK on Windows (no execute-bit concept); X_OK on Unix
      const flag = os.platform() === 'win32' ? fs.constants.F_OK : fs.constants.X_OK;
      fs.accessSync(candidate, flag);
      bashExe = candidate;
      break;
    } catch (_) { /* not found here */ }
  }

  if (!bashExe) {
    console.error(
      'Error: bash not found on Windows.\n' +
      'Install Git for Windows (https://git-scm.com/download/win) which includes bash,\n' +
      'then retry: npm run launch:device'
    );
    process.exit(1);
  }

  run(bashExe);
} else {
  run('bash');
}
