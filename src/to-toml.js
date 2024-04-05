// https://bun.sh/docs/runtime/bunfig
// @ts-check
"use strict";
module.exports = stringify;

const validate = require('jsonschema').validate
const {logger} = require('./logger');

const EOL = require("os").EOL;

const bunSchema = {
  preload: {
    type: "array",
    items: {
      type: "string",
    },
  },
  jsx: {
    type: "string",
  },
  jsxFactory: {
    type: "string",
  },
  jsxFragment: {
    type: "string",
  },
  jsxImportSource: {
    type: "string",
  },
  smol: {
    type: "boolean",
  },
  logLevel: {
    type: "boolean",
  },
  define: {
    type: "object",
    additionalProperties: {
      type: "string"
    }
  },
  loader: {
    type: "object",
    additionalProperties: {
      type: "string"
    }
  },
  telemetry: {
    type: "boolean",
  },
  test: {
    type: "object",
    properties: {
      preload: {
        type: "array",
        items: {
          type: "string",
        },
      },
      smol: {
        type: "boolean",
      },
      coverage: {
        type: "boolean",
      },
      coverageThreshold: {
        oneOf: [
          { type: "number" },
          {
            type: "object",
            properties: {
              line: { type: "number" },
              function: { type: "number" },
              statement: { type: "number" },
            },
          },
        ],
      },
    },
    coverageSkipTestFiles: {
      type: "boolean",
    },
  },
  install: {
    type: "object",
    properties: {
      optional: {
        type: "boolean",
      },
      dev: {
        type: "boolean",
      },
      peer: {
        type: "boolean",
      },
      production: {
        type: "boolean",
      },
      exact: {
        type: "boolean",
      },
      auto: { type: "string" },
      frozenLockfile: {
        type: "boolean",
      },
      dryRun: {
        type: "boolean",
      },
      globalDir: { type: "string" },
      globalBinDir: { type: "string" },
      registry: {
        oneOf: [
          { type: "string" },
          {
            type: "object",
            properties: {
              url: { type: "string" },
              token: { type: "string" },
            },
          },
        ],
      },
    },
  },
  "install.scopes": {
    type: "object",
    additionalProperties: {
      oneOf: [
        { type: 'string' },
        {
          type: "object",
          properties: {
            url: { type: "string" },
            token: { type: "string" },
          },
          required: ['url', 'token']
        },
        {
          type: "object",
          properties: {
            url: { type: "string" },
            username: { type: "string" },
            password: { type: "string" },
          },
          required: ['url', 'username', 'password']
        },
      ],
    }
  },
  "install.cache": {
    type: "object",
    properties: {
      dir: { type: "string" },
      disable: {
        type: "boolean",
      },
      disableManifest: {
        type: "boolean",
      },
    },
  },
  "install.lockfile": {
    type: "object",
    properties: {
      save: {
        type: "boolean",
      },
      print: { type: "string" },
    },
  },
  run: {
    type: "object",
    properties: {
      shell: { type: "string" },
      bun: {
        type: "boolean",
      },
      silent: {
        type: "boolean",
      },
    },
  },
};


/**
 * Description
 * @param {string} key
 * @param {any} value
 * @returns {Array<string>}
 */
function writeTomlLine(key, value, valueType) {
  const sanitizedKey = ['@'].some(s => key.includes(s)) ? `"${key}"` : key
  if(Array.isArray(value)) {
    return [`${sanitizedKey} = ${JSON.stringify(value)}`]
  }
  if(typeof value === "object") {
    const serializedValue = Object.entries(value).map(([k, v]) => { return writeTomlLine(k , v, valueType)}).join(', ')
    const keyString = `${sanitizedKey} = { ${serializedValue} }`
    return [keyString]
  }
  if(typeof value === "string") {
    return [`${sanitizedKey} = "${value}"`]
  }
  return [`${sanitizedKey} = ${value}`]
}

/**
 * Description
 * @param {object} obj
 * @param {string} key
 * @param {any} valueType
 * @returns {string | undefined}
 */
function stringifyByNode(obj, key, valueType) {
  const keys = key.split(".");
  const accessData = keys.reduce((current, accessKey) => {
    if (!current) return current;
    return current[accessKey];
  }, obj);

  if (!accessData ) return;

  if(!validate(accessData, valueType).valid) {
    logger.warn(`key: ${key} has invalid value and skipped: ${JSON.stringify(accessData, null, 2)}`)
    return
  }

  let concatString = [];

  if (valueType.type === "object") {
    concatString.push(EOL);
    concatString.push(`[${key}]`);

    if('properties' in valueType)  {
      Object.keys(valueType.properties).forEach((k) => {
        if(typeof accessData[k] !== 'undefined') {
          concatString = concatString.concat(writeTomlLine(k, accessData[k], valueType))
        }
      });
    } else {
      Object.entries(accessData).forEach(([k, v]) => {
        concatString = concatString.concat(writeTomlLine(k, v, valueType))
      });
    }
    return concatString.join(EOL);
  }

  return concatString.concat(writeTomlLine(key, accessData, valueType)).join(EOL);
}

/**
 * Description
 * @param {any} obj
 * @returns {string}
 */
function stringify(obj) {
  let resultString = [];
  const topKeys = Object.entries(bunSchema);

  for (const [key, valueType] of topKeys) {
    // @ts-ignore
    resultString = resultString.concat([stringifyByNode(obj, key, valueType)]);
  }

  return resultString.filter(Boolean).join('') + EOL;
}
