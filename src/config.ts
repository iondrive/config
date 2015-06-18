import path = require('path');

import ms = require('ms');

import Duration = require('./Duration');

const CONFIG_PATH = path.resolve(process.env.NODE_CONFIG_PATH || './config.js');
const CONFIG_PREFIX = process.env.NODE_CONFIG_PREFIX || 'APP';

var definition;

try {
  definition = require(CONFIG_PATH);
} catch (err) {
  throw new Error('CONFIG: Can\'t access config definition: Expecting a config.js file in the current working directory or an explicit location via NODE_CONFIG_PATH');
}

const INTEGER_REGEX = /^(\-|\+)?[0-9]+$/;
const NUMBER_REGEX = /^(\-|\+)?[0-9]+(\.[0-9]*)?$/;

const parsers = Object.create(null);

parsers['string'] = value => value;
parsers['boolean'] = value => {
  if (/^true|yes|y|1$/i.test(value)) return true;
  if (/^false|no|n|0$/i.test(value)) return false;
  throw new Error('Cannot convert to a boolean');
};
parsers['integer'] = value => {
  if (INTEGER_REGEX.test(value)) return parseInt(value, 10);
  throw new Error('Cannot convert to an integer');
};
parsers['number'] = value => {
  if (NUMBER_REGEX.test(value)) return parseFloat(value);
  throw new Error('Cannot convert to a number');
};
parsers['duration'] = value => {  
  if (INTEGER_REGEX.test(value)) return new Duration(parseInt(value, 10));
  return new Duration(value);
};
parsers['enum'] = (value, values) => {
  if (values.indexOf(value) > -1) return value;
  throw new Error('Value not found in enumeration values');
};


// function addDurationParser(name: string, aliases: string[], conversionFunction: (milliseconds: number) => number) {
//   [name].concat(aliases).forEach(key => {
//     parsers[key] = value => {
//       if (INTEGER_REGEX.test(value)) return parseInt(value, 10);
//       var milliseconds = ms(value);
//       if (!milliseconds) throw new Error(`Cannot convert to ${name}`);
//       return Math.floor(conversionFunction(milliseconds));
//     }
//   });
// }

// addDurationParser('years', ['year', 'yrs', 'yr', 'y'], milliseconds => milliseconds / 1000 / 60 / 60 / 24 / 365);
// addDurationParser('days', ['day', 'd'], milliseconds => milliseconds / 1000 / 60 / 60 / 24);
// addDurationParser('hours', ['hour', 'hrs', 'hr', 'h'], milliseconds => milliseconds / 1000 / 60 / 60);
// addDurationParser('minutes', ['minute', 'mins', 'min', 'm'], milliseconds => milliseconds / 1000 / 60);
// addDurationParser('seconds', ['second', 'secs', 'sec', 's'], milliseconds => milliseconds / 1000);
// addDurationParser('milliseconds', ['millisecond', 'msecs', 'msec', 'ms'], milliseconds => milliseconds);


const config = Object.create(null);

for (let key in definition) {
  let envKey = (CONFIG_PREFIX + '_' + key).toUpperCase();

  let def = definition[key], type = def, values;

  if (Array.isArray(def)) {
    type = 'enum';
    values = def;
  } else if (typeof def === 'object') {
    type = def.type;
    envKey = def.env || envKey;
    values = def.values;
  }

  let value = process.env[envKey];

  if (!value) {
    throw new Error(`CONFIG: Environment variable ${envKey} is missing`);
  }

  try {
    if (!parsers[type]) throw new Error('Invalid type');
    if (typeof def.validator === 'function' && !def.validator(value)) {
      throw new Error('Value did not pass validator function');
    }
    config[key] = parsers[type](value, values);
  } catch (err) {
    throw new Error(`CONFIG: Error parsing environment variable ${envKey}: ${err.message}`);
  }
}

Object.freeze(config);

export = config;
