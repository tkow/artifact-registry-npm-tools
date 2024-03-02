// @ts-check
// Copyright 2019 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

const fs = require('fs');
const path = require('path');
const c = require('./config');
const {logger} = require('./logger');
const {parse: parseToml, stringify: stringifyToToml} = require('@iarna/toml');
const BUN_INSTALL_CONFIG_ID = "install";
const BUN_INSTALL_SCOPE_CONFIG_ID = "install.scopes";

/**
 * Update the project and user npmrc files.
 *
 * @param {string} npmrcFile Path to the npmrc file to read scope registry configs, should be the project npmrc file.
 * @param {string} from original bunfig path.
 * @param {string} bunfig output bunfig path.
 * @param {string} creds Encrypted credentials.
 * @return {!Promise<undefined>}
 */
async function generateBunfigFile(npmrcFile, from, bunfig, creds ) {
  npmrcFile = path.resolve(npmrcFile);

  // We do not use basic auth any more in `gcloud artifacts print-settings`; replace them.
  let npmrcFileLines = await fs.promises.readFile(npmrcFile, "utf8")
  const legacyRegex = /(\/\/[a-zA-Z1-9-]+[-]npm[.]pkg[.]dev\/.*\/):_password=.*(\n\/\/[a-zA-Z1-9-]+[-]npm[.]pkg[.]dev\/.*\/:username=oauth2accesstoken)/g;
  npmrcFileLines = npmrcFileLines.replace(legacyRegex, `$1:_authToken=${creds}`)

  from = path.resolve(from);

  let bunfigOutObj = fs.existsSync(from) ?  parseToml(fs.readFileSync(from, "utf8")) : {
    [BUN_INSTALL_SCOPE_CONFIG_ID]: {}
  };

  if(bunfigOutObj[BUN_INSTALL_SCOPE_CONFIG_ID]) {
    bunfigOutObj[BUN_INSTALL_SCOPE_CONFIG_ID] = {};
  }

  let appendedConfig = bunfigOutObj[BUN_INSTALL_SCOPE_CONFIG_ID]

  for (const line of npmrcFileLines.split('\n')) {
    let config = c.parseConfig(line.trim());
    switch (config.type) {
      case c.configType.Registry:
        if (!appendedConfig[config.scope]) {
          appendedConfig[config.scope] = {};
        }
        appendedConfig[config.scope] = {
          url: `https://${config.registry}`,
          token: creds,
        };
        break;
      case c.configType.Password:
        if (!appendedConfig[config.scope]) {
          appendedConfig[config.scope] = {};
        }
        appendedConfig[config.scope] = {
          url: `https://${config.registry}`,
          token: creds,
        };
        break;
    }
  }

  bunfig = path.resolve(bunfig);

  await fs.promises.writeFile(bunfig, stringifyToToml(bunfigOut));
}

module.exports = {
  generateBunfigFile,
};
