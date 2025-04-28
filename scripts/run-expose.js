#!/usr/bin/env node

import { spawn } from 'child_process';
import process from 'process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const PB_PORT = 8090;
const VITE_ASSUMED_PORT = 5173;

const childProcesses = [];
let pbTunnelmoleUrl = null;
let viteTunnelmoleUrl = null;

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
      if (name.includes('PocketBase') || name.includes('Vite')) {
        shutdown();
      }
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
        if (name.includes('PocketBase') || name.includes('Vite')) {
          if (!process.exitCode) {
            shutdown();
          }
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

const printTunnelUrls = () => {
  if (pbTunnelmoleUrl && viteTunnelmoleUrl) {
    console.log('\n🎉 Tunnelmole Tunnels Ready! 🎉');
    console.log(`   PocketBase API: ${pbTunnelmoleUrl}`);
    console.log(`   Vite App:       ${viteTunnelmoleUrl}`);
    console.log('\nPress Ctrl+C to stop both servers and tunnels.');
  }
};

async function main() {
  try {
    spawnProcess('npm', ['run', 'pocketbase'], {}, 'PocketBase Server');

    // console.log(`⏳ Giving PocketBase 3 seconds to start...`);
    await new Promise((resolve) => setTimeout(resolve, 3000));

    try {
      // console.log('DEBUG: Attempting to spawn PB Tunnelmole process...');
      let pbStdoutBuffer = '';
      const pbTunnelmoleProcess = spawnProcess(
        'npx',
        ['tunnelmole', String(PB_PORT)],
        {
          stdio: ['ignore', 'pipe', 'inherit'],
        },
        `Tunnelmole (PB:${PB_PORT})`
      );
      console.log(
        'DEBUG: Successfully called spawnProcess for PB Tunnelmole. Attaching listeners...'
      );

      const httpsTunnelUrlRegex = /^(https:\/\/[^\s⟶]+)\s*⟶/;

      pbTunnelmoleProcess.stdout.on('data', (data) => {
        pbStdoutBuffer += data.toString();
        const lines = pbStdoutBuffer.split(/\r?\n/);
        pbStdoutBuffer = lines.pop();

        for (const line of lines) {
          const urlMatch = line.match(httpsTunnelUrlRegex);
          if (urlMatch && urlMatch[1]) {
            pbTunnelmoleUrl = urlMatch[1];
            // console.log(
            //   `✨ Captured PocketBase Public URL: ${pbTunnelmoleUrl}`
            // );

            if (!childProcesses.some((c) => c.name === 'Vite Dev Server')) {
              // console.log(
              //   `Injecting VITE_POCKETBASE_URL=${pbTunnelmoleUrl} into Vite process and starting Vite.`
              // );

              const env = {
                ...process.env,
                VITE_POCKETBASE_URL: pbTunnelmoleUrl,
                PATH: process.env.PATH,
              };

              console.log('DEBUG: Attempting to spawn Vite Dev Server...');
              const viteProcess = spawnProcess(
                'npm',
                ['run', 'dev'],
                { env: env },
                'Vite Dev Server'
              );
              console.log(
                'DEBUG: Successfully called spawnProcess for Vite Dev Server.'
              );

              console.log(
                'DEBUG: Attempting to spawn Vite Tunnelmole process...'
              );
              let viteStdoutBuffer = '';
              const viteTunnelmoleProcess = spawnProcess(
                'npx',
                ['tunnelmole', String(VITE_ASSUMED_PORT)],
                {
                  stdio: ['ignore', 'pipe', 'inherit'],
                },
                `Tunnelmole (Vite:${VITE_ASSUMED_PORT})`
              );
              console.log(
                'DEBUG: Successfully called spawnProcess for Vite Tunnelmole. Attaching listeners...'
              );

              viteTunnelmoleProcess.stdout.on('data', (data) => {
                viteStdoutBuffer += data.toString();
                const viteLines = viteStdoutBuffer.split(/\r?\n/);
                viteStdoutBuffer = viteLines.pop();

                for (const viteLine of viteLines) {
                  const viteUrlMatch = viteLine.match(httpsTunnelUrlRegex);
                  if (viteUrlMatch && viteUrlMatch[1]) {
                    viteTunnelmoleUrl = viteUrlMatch[1];
                    console.log(
                      `✨ Captured Vite Public URL: ${viteTunnelmoleUrl}`
                    );
                    printTunnelUrls();
                    viteTunnelmoleProcess.stdout.removeAllListeners('data');
                    viteStdoutBuffer = '';
                  }
                }
              });

              viteTunnelmoleProcess.on('error', (err) => {
                console.error(
                  `❌ Tunnelmole for Vite failed to start: ${err.message}`
                );
                shutdown();
              });
              viteTunnelmoleProcess.on('exit', (code, signal) => {
                if (viteTunnelmoleUrl === null && code !== null && code !== 0) {
                  console.error(
                    `❌ Tunnelmole for Vite exited before Public URL was captured! Code: ${code}, Signal: ${signal}`
                  );
                  console.error(
                    `Cannot fully expose the app without the Vite tunnel. Shutting down.`
                  );
                  shutdown();
                }
              });
            }
            printTunnelUrls();
            pbTunnelmoleProcess.stdout.removeAllListeners('data');
            pbStdoutBuffer = '';
          }
        }
      });

      pbTunnelmoleProcess.on('exit', (code, signal) => {
        if (pbTunnelmoleUrl === null && code !== null && code !== 0) {
          console.error(
            `❌ Tunnelmole for PocketBase exited before Public URL was captured! Code: ${code}, Signal: ${signal}`
          );
          console.error(
            `Cannot start Vite without the PocketBase URL. Shutting down.`
          );
          shutdown();
        }
      });
    } catch (innerError) {
      console.error(
        '❌ Caught an error during tunnel process setup:',
        innerError.message
      );
      shutdown();
      return;
    }
  } catch (outerError) {
    console.error(
      '❌ An outer error occurred during startup:',
      outerError.message
    );
    shutdown();
  }
}

main();
