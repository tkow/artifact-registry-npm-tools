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
const c = require('../src/config');

describe('#config', function() {
  const tests = [
    {name: 'registry', config: 'myregistry.someProperty=someValue'},
    {name: 'auth token', config: '//us-west1-npm.pkg.dev/myproj/myrepo/:_authToken=myToken'},
    {name: 'auth', config: `_auth=${Buffer.from('user:password', 'utf-8').toString('base64')}`},
    {name: 'password', config: '//us-west1-npm.pkg.dev/myproj/myrepo/:_password=myPassword'},
    {name: 'registry', config: 'registry=https://us-west1-npm.pkg.dev/myproj/myrepo/'},
    {name: 'scoped registry', config: '@myscope:registry=https://us-west1-npm.pkg.dev/myproj/myrepo/'}
  ];

  tests.forEach(({name, config}) => {
    it(`parses config ${name} and converts it to string correctly`, () => {
      assert.equal(c.parseConfig(config).toString(), config);
    });
  });
})
