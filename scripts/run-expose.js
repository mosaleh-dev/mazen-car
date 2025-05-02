#!/usr/bin/env node

import { spawn } from 'child_process';
import process from 'process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const VITE_ASSUMED_PORT = 5173;

const childProcesses = [];

const shutdown = () => {
  console.log('\nShutting down child processes...');
  childProcesses.forEach((child) => {
    if (!child.killed) {
      try {
        child.kill('SIGINT');
      } catch (e) {
        console.warn(`Failed to kill process ${child.pid}: ${e.message}`);
      }
    }
  });

  setTimeout(() => {
    console.log('Shutdown complete.');
    process.exit(0);
  }, 1500);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

function spawnProcess(command, args = [], options = {}, name = 'Process') {
  console.log(`▶️ Starting: ${command} ${args.join(' ')}`);
  try {
    const child = spawn(command, args, {
      cwd: options.cwd || projectRoot,
      stdio: 'inherit',
      env: options.env || process.env,
      ...options,
    });
    child.name = name;

    childProcesses.push(child);

    child.on('error', (err) => {
      console.error(
        `❌ Failed to start ${name} process (command: ${command}): ${err.message}`
      );
      shutdown();
    });

    child.on('exit', (code, signal) => {
      const index = childProcesses.indexOf(child);
      if (index !== -1) {
        childProcesses.splice(index, 1);
      }
      if (code !== null && code !== 0) {
        console.warn(
          `⚠️ ${name} process exited unexpectedly with code ${code} or signal ${signal}`
        );
        if (!process.exitCode) {
          shutdown();
        }
      } else {
        console.log(`✅ ${name} process exited cleanly.`);
      }
    });

    return child;
  } catch (error) {
    console.error(
      `❌ Synchronous error spawning ${name} (command: ${command}): ${error.message}`
    );
    throw error;
  }
}

async function main() {
  try {
    spawnProcess('npm', ['start'], {}, 'Vite Dev Server');

    let viteStdoutBuffer = '';
    const viteTunnelmoleProcess = spawnProcess(
      'npx',
      ['tunnelmole', String(VITE_ASSUMED_PORT)],
      {
        stdio: ['ignore', 'pipe', 'inherit'],
      },
      `Tunnelmole (Vite:${VITE_ASSUMED_PORT})`
    );

    const httpsTunnelUrlRegex = /^(https:\/\/[^\s⟶]+)\s*⟶/;

    viteTunnelmoleProcess.stdout.on('data', (data) => {
      viteStdoutBuffer += data.toString();
      const viteLines = viteStdoutBuffer.split(/\r?\n/);
      viteStdoutBuffer = viteLines.pop();

      for (const viteLine of viteLines) {
        const viteUrlMatch = viteLine.match(httpsTunnelUrlRegex);
        if (viteUrlMatch && viteUrlMatch[1]) {
          console.log(`✨ Captured Vite Public URL: ${viteUrlMatch[1]}`);
          viteTunnelmoleProcess.stdout.removeAllListeners('data');
          viteStdoutBuffer = '';
        }
      }
    });

    viteTunnelmoleProcess.on('error', (err) => {
      console.error(`❌ Tunnelmole for Vite failed to start: ${err.message}`);
      shutdown();
    });

    viteTunnelmoleProcess.on('exit', (code, signal) => {
      if (code !== null && code !== 0) {
        console.error(
          `❌ Tunnelmole for Vite exited before Public URL was captured! Code: ${code}, Signal: ${signal}`
        );
        shutdown();
      }
    });
  } catch (outerError) {
    console.error(
      '❌ An outer error occurred during startup:',
      outerError.message
    );
    shutdown();
  }
}

main();
