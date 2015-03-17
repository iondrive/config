'use strict';

const path = require('path');

const CONFIG_PATH = path.resolve(process.env.NODE_CONFIG_PATH || './config.js');
const CONFIG_PREFIX = process.env.NODE_CONFIG_PREFIX || 'APP';

var definition;

try {
  definition = require(CONFIG_PATH);
} catch (err) {
  throw Error('CONFIG: Can\'t access config definition: Expecting a config.js file in the current working directory or an explicit location via NODE_CONFIG_PATH');
}

const parsers = {
  string: value => value,
  boolean: value => {
    if (/^true|yes|y|1$/i.test(value)) return true;
    if (/^false|no|n|0$/i.test(value)) return false;
    throw Error('Cannot convert to a boolean');
  },
  integer: value => {
    if (/^(\-|\+)?[0-9]+$/.test(value)) return parseInt(value, 10);
    throw Error('Cannot convert to an integer');
  },
  number: value => {
    if (/^(\-|\+)?[0-9]+(\.[0-9]*)?$/.test(value)) return parseFloat(value, 10);
    throw Error('Cannot convert to a number');
  }
};

const config = module.exports = Object.create(null);

for (let key in definition) {
  let envKey = (CONFIG_PREFIX + '_' + key).toUpperCase();
  let value = process.env[envKey];

  if (!value) {
    throw Error(`CONFIG: Environment variable ${envKey} is missing`);
  }

  let type = definition[key];
  try {
    if (!parsers[type]) throw Error('Invalid type');
    config[key] = parsers[type](value);
  } catch (err) {
    throw Error(`CONFIG: Error parsing environment variable ${envKey}: ${err.message}`);
  }
}

Object.freeze(config);
