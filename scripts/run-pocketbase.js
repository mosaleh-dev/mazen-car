#!/usr/bin/env node

import { spawn } from 'child_process';
import process from 'process';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..'); // Go up one level from 'scripts'

// --- Helper function to run the download script ---
async function runDownloadScript() {
  return new Promise((resolve, reject) => {
    console.log(
      `\nPocketBase binary not found. Attempting to download via "npm run download-pocketbase"...`
    );

    // Spawn the download script using node
    const downloadProcess = spawn(
      'node',
      [path.join(projectRoot, 'scripts', 'download-pocketbase.js')],
      {
        stdio: 'inherit', // Inherit stdio so the user sees the download progress/output
        cwd: projectRoot, // Ensure the script runs from the project root
      }
    );

    downloadProcess.on('error', (err) => {
      // Handle errors like 'command not found' for 'node'
      reject(new Error(`Failed to start download process: ${err.message}`));
    });

    downloadProcess.on('exit', (code, signal) => {
      if (code === 0) {
        console.log('\nPocketBase download successful.');
        resolve(); // Resolve the promise on successful exit
      } else {
        // Reject the promise on non-zero exit code or signal
        reject(
          new Error(
            `PocketBase download script exited with code ${code || signal}`
          )
        );
      }
    });
  });
}
// --------------------------------------------------

async function main() {
  // Determine the expected binary name based on the platform
  const platform = os.platform();
  const binDir = path.join(projectRoot, 'bin');
  let pocketbaseBinaryName = 'pocketbase';

  if (platform === 'win32') {
    pocketbaseBinaryName = 'pocketbase.exe';
  } else if (platform !== 'linux' && platform !== 'darwin') {
    console.error(`Unsupported platform: ${platform}`);
    process.exit(1);
  }

  const pocketbaseBinaryPath = path.join(binDir, pocketbaseBinaryName);

  // Check if the binary exists. If not, run the download script.
  if (!fs.existsSync(pocketbaseBinaryPath)) {
    console.warn(`PocketBase binary not found at "${pocketbaseBinaryPath}".`);
    try {
      // Await the completion of the download script
      await runDownloadScript();
    } catch (e) {
      // If the download script failed, log the error and exit
      console.error(
        `\nError: Automatic PocketBase download failed. ${e.message}`
      );
      console.error(
        `Please try running "npm run download-pocketbase" manually to diagnose the issue.`
      );
      process.exit(1);
    }

    // After a successful download, the binary *should* now exist.
    // We could add another check here, but the download script is responsible
    // for putting the file there. If it's still missing, the spawn below will
    // fail with ENOENT, which is handled.
  }

  // Now, run the PocketBase binary (it either existed or was just downloaded)
  console.log(`\nRunning PocketBase binary: ${pocketbaseBinaryPath}`);

  const pocketbaseArgs = [
    'serve',
    '--migrationsDir',
    './pb_migrations/',
    '--dir',
    './pb_data/',
  ];

  const pocketbaseProcess = spawn(pocketbaseBinaryPath, pocketbaseArgs, {
    stdio: 'inherit', // This makes the PocketBase output appear in your console
    cwd: projectRoot, // Ensure the process runs from the project root
  });

  // --- Event handlers for the spawned PocketBase process ---
  pocketbaseProcess.on('error', (err) => {
    console.error(`Failed to start PocketBase process: ${err.message}`);
    if (err.code === 'ENOENT') {
      console.error(
        `Error: PocketBase binary not found at "${pocketbaseBinaryPath}".`
      );
      console.error(
        'This usually means the file does not exist or the path is incorrect.'
      );
      console.error(
        'If you just ran the download, check if it completed successfully and placed the file here.'
      );
    } else if (err.code === 'EACCES' && platform !== 'win32') {
      console.error(
        `Error: Permission denied when trying to run "${pocketbaseBinaryPath}".`
      );
      console.error(
        `On Linux/macOS, ensure the binary has execute permissions (e.g., run "chmod +x ${pocketbaseBinaryPath}")`
      );
      console.error(
        `The "npm run download-pocketbase" script should set these permissions.`
      );
    }
    process.exit(1); // Exit the main script if PocketBase fails to start
  });

  pocketbaseProcess.on('exit', (code) => {
    // Only report non-zero exit codes as errors
    if (code !== null && code !== 0) {
      console.error(`PocketBase process exited with code ${code}`);
    }
    // The script will naturally end here unless it's killed by a signal
  });
  // ----------------------------------------------------------

  // --- Handle signals for the main Node.js process ---
  // This allows Ctrl+C to be forwarded to the PocketBase process
  process.on('SIGINT', () => {
    console.log('Caught SIGINT. Shutting down PocketBase...');
    pocketbaseProcess.kill('SIGINT'); // Forward the signal to PocketBase
  });
  process.on('SIGTERM', () => {
    console.log('Caught SIGTERM. Shutting down PocketBase...');
    pocketbaseProcess.kill('SIGTERM'); // Forward the signal to PocketBase
  });
  // ---------------------------------------------------
}

// Execute the main async function
main();
