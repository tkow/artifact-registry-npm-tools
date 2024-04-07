/**
 * Copyright 2021 Google LLC. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');
var update = require('../src/update');

const creds = 'abcd';

function getTestDir() {
  return path.join(process.cwd(), 'tmp');
}

// Writing to a file whose name starts with a dot is tricky on Windows, thus
// changing the name of the config file to "npmrc".
function getFixturePath() {
  return path.join(process.cwd(),'fixtures');
}

describe('#update', () => {
  describe('#generateBunfigFile', () => {
    beforeEach(function(){
      const toTestDir = getTestDir();
      if (!fs.existsSync(toTestDir)){
          fs.mkdirSync(toTestDir);
      }
    });

    afterEach(function(){
      // fs.rmdirSync(getTestDir(), {recursive: true});
    });

    it('with --from, --repo-config, --bunfig', async function() {
      const repoConfig = path.join(getFixturePath(), '.npmrc');
      const fromConfigPath = path.join(getFixturePath(), 'bunfig.base.toml');
      const toConfigPath = path.join(getTestDir(), 'bunfig.toml');
      update.generateBunfigFile(repoConfig, fromConfigPath, toConfigPath, creds)
    });

    // it('with --from, --bunfig', async function() {
    //   const repoConfig = path.join(getFixturePath(), '.npmrc');
    //   const fromConfigPath = path.join(getFixturePath(), 'bunfig.base.toml');
    //   const toConfigPath = path.join(getTestDir(), 'bunfig.toml');
    //   await update.generateBunfigFile(repoConfig, fromConfigPath, toConfigPath, creds)

    //   await assert.rejects(
    //     update.generateBunfigFile(repoConfig, toConfigPath, toConfigPath, creds)
    //   );
    // });
  });
})
