#!/usr/bin/env node
// @ts-check

// @ts-ignore
const os = require('os');
// @ts-ignore
const yargs = require('yargs/yargs')
// @ts-ignore
const { hideBin } = require('yargs/helpers')
const auth = require('./auth');
const { logger } = require('./logger');
const update = require('./update');
// @ts-ignore
const fs = require('fs');

/**
 * Determine which npmrc file should be the default repo configuration
 *
 * This will determine if a project-level npmrc file exists, otherwise default to the user-level npmrc file
 *
 * return {!Promise<String>}
 */
 async function determineDefaultRepoConfig() {
  try {
    await fs.promises.stat('.npmrc')
    return '.npmrc'
  } catch (e) {
    return `${os.homedir()}/.npmrc`
  }
}

/**
 * Get credentials and update .npmrc file.
 *
 * Usage:
 * - Add to scripts in package.json:
 * "scripts": {
 *   "artifactregistry-auth": "google-artifactregistry-auth --repo-config=[./.npmrc] --credential-config=[~/.npmrc]",
 *    ...
 * },
 * - Or run directly $ ./src/main.js --repo-config=[./.npmrc] --credential-config=[~/.npmrc]
 *
 * @return {!Promise<undefined>}
 */
async function main() {
  try {
    // @ts-ignore
    const allArgs = yargs(hideBin(process.argv))
      .option('repo-config', {
        type: 'string',
        describe: 'Path to the .npmrc file to read registry configs from, will use the project-level npmrc file if it exists, otherwise the user-level npmrc file',
        default: await determineDefaultRepoConfig(),
      })
      .option('from', {
        type: 'string',
        describe: 'Path to the original bunfig for version control without credential, usually the project-level bunfig file',
        default: `${os.homedir()}/bunfig.toml`,
      })
      .option('bunfig', {
        type: 'string',
        describe: 'Path to the bunfig.file file to append repository and credential and output, usually the project-level path',
        default: `${os.homedir()}/bunfig.toml`,
      })
      .help()
      .argv;

    logger.logVerbose = allArgs.verbose;
    const creds = await auth.getCreds();
    await update.generateBunfigFile(
      allArgs.repoConfig,
      allArgs.from,
      allArgs.bunfig,
      creds,
    );
    console.log("Success!");
  } catch (err) {
    console.error(err);
    // @ts-ignore
    process.exit(1);
  }
}

main();
