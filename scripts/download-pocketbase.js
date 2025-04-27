#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import os from 'os';
import AdmZip from 'adm-zip';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..'); // Go up one level from 'scripts'

const packageJsonPath = path.join(projectRoot, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
const pocketbaseVersion = packageJson.config?.pocketbaseVersion;

if (!pocketbaseVersion) {
  console.error("Error: 'pocketbaseVersion' not found in package.json config.");
  process.exit(1);
}

const platform = os.platform();
const arch = os.arch();
const binDir = path.join(projectRoot, 'bin');
let targetBinaryName = 'pocketbase';
let osMapping = '';
let archMapping = '';

console.log(`Detecting platform: ${platform}, architecture: ${arch}`);

if (platform === 'win32' && arch === 'x64') {
  osMapping = 'windows';
  archMapping = 'amd64'; // PocketBase uses amd64 for x64 on Windows
  targetBinaryName = 'pocketbase.exe'; // Expected name inside the zip
} else if (platform === 'linux' && arch === 'x64') {
  osMapping = 'linux';
  archMapping = 'amd64';
  targetBinaryName = 'pocketbase'; // Expected name inside the zip
} else if (platform === 'linux' && arch === 'arm64') {
  osMapping = 'linux';
  archMapping = 'arm64';
  targetBinaryName = 'pocketbase'; // Expected name inside the zip
} else if (platform === 'darwin' && arch === 'x64') {
  // macOS Intel
  osMapping = 'darwin';
  archMapping = 'amd64';
  targetBinaryName = 'pocketbase'; // Expected name inside the zip
} else if (platform === 'darwin' && arch === 'arm64') {
  // macOS Apple Silicon
  osMapping = 'darwin';
  archMapping = 'arm64';
  targetBinaryName = 'pocketbase'; // Expected name inside the zip
} else {
  console.error(
    `Error: Unsupported platform/architecture combination: ${platform}/${arch}`
  );
  console.error(
    'Please download the appropriate PocketBase binary manually and place it in the ./bin folder.'
  );
  process.exit(1);
}

const assetFileName = `pocketbase_${pocketbaseVersion}_${osMapping}_${archMapping}.zip`;
const targetBinaryPath = path.join(binDir, targetBinaryName);

const downloadUrl = `https://github.com/pocketbase/pocketbase/releases/download/v${pocketbaseVersion}/${assetFileName}`;

async function downloadAndExtract() {
  console.log(
    `Attempting to download PocketBase v${pocketbaseVersion} for ${platform}/${arch}...`
  );
  console.log(`Downloading from: ${downloadUrl}`);

  try {
    const zipResponse = await fetch(downloadUrl);
    if (!zipResponse.ok) {
      if (zipResponse.status === 404) {
        console.error(
          `Error: PocketBase asset "${assetFileName}" not found for version v${pocketbaseVersion}.`
        );
        console.error(
          `Please check the version number and platform/architecture mapping in the script/package.json.`
        );
        console.error(`URL attempted: ${downloadUrl}`);
      } else {
        console.error(
          `Error downloading zip file: ${zipResponse.status} ${zipResponse.statusText}`
        );
      }
      process.exit(1);
    }
    const zipBuffer = await zipResponse.arrayBuffer();

    if (!fs.existsSync(binDir)) {
      fs.mkdirSync(binDir, { recursive: true });
    }

    console.log(`Processing downloaded zip file...`);
    const zip = new AdmZip(Buffer.from(zipBuffer)); // Use Buffer.from() with ArrayBuffer
    const zipEntries = zip.getEntries();

    let binaryEntry = null;
    for (const entry of zipEntries) {
      if (
        !entry.isDirectory &&
        entry.name === targetBinaryName &&
        entry.entryName === targetBinaryName
      ) {
        binaryEntry = entry;
        break;
      }
    }

    if (!binaryEntry) {
      console.error(
        `Error: Could not find the executable "${targetBinaryName}" at the root of the zip archive.`
      );
      console.error(
        'Please inspect the zip contents manually or update the script.'
      );
      process.exit(1);
    }

    console.log(`Found target binary entry: ${binaryEntry.entryName}`);
    console.log(
      `Extracting "${binaryEntry.entryName}" to "${targetBinaryPath}"...`
    );

    if (fs.existsSync(targetBinaryPath)) {
      console.log(`Removing existing binary at ${targetBinaryPath}`);
      fs.unlinkSync(targetBinaryPath);
    }

    zip.extractEntryTo(binaryEntry.entryName, binDir, false, true);

    if (platform !== 'win32') {
      console.log(`Setting execute permissions for ${targetBinaryName}...`);
      fs.chmodSync(targetBinaryPath, '755'); // rwxr-xr-x
    }

    console.log(
      `Successfully downloaded and extracted PocketBase binary to ${targetBinaryPath}`
    );
  } catch (error) {
    console.error('Error during download or extraction:', error.message);
    process.exit(1);
  }
}

downloadAndExtract();
