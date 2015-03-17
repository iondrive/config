"use strict";

var path = require("path");

var CONFIG_PATH = path.resolve(process.env.NODE_CONFIG_PATH || "./config.js");
var CONFIG_PREFIX = process.env.NODE_CONFIG_PREFIX || "APP";

var definition;

try {
  definition = require(CONFIG_PATH);
} catch (err) {
  throw Error("CONFIG: Can't access config definition: Expecting a config.js file in the current working directory or an explicit location via NODE_CONFIG_PATH");
}

var parsers = {
  string: function (value) {
    return value;
  },
  boolean: function (value) {
    if (/^true|yes|y|1$/i.test(value)) return true;
    if (/^false|no|n|0$/i.test(value)) return false;
    throw Error("Cannot convert to a boolean");
  },
  integer: function (value) {
    if (/^(\-|\+)?[0-9]+$/.test(value)) return parseInt(value, 10);
    throw Error("Cannot convert to an integer");
  },
  number: function (value) {
    if (/^(\-|\+)?[0-9]+(\.[0-9]*)?$/.test(value)) return parseFloat(value, 10);
    throw Error("Cannot convert to a number");
  },
  "enum": function (value, values) {
    if (values.indexOf(value) > -1) return value;
    throw Error("Value not found in enumeration values");
  }
};

var config = module.exports = Object.create(null);

for (var key in definition) {
  var envKey = (CONFIG_PREFIX + "_" + key).toUpperCase();

  var def = definition[key];
  var type = def;
  var values = undefined,
      env = undefined;

  if (Array.isArray(def)) {
    type = "enum";
    values = def;
  } else if (typeof def === "object") {
    type = def.type;
    envKey = def.env || envKey;
    values = def.values;
  }

  var value = process.env[envKey];

  if (!value) {
    throw Error("CONFIG: Environment variable " + envKey + " is missing");
  }

  try {
    if (!parsers[type]) throw Error("Invalid def");
    config[key] = parsers[type](value, values);
  } catch (err) {
    throw Error("CONFIG: Error parsing environment variable " + envKey + ": " + err.message);
  }
}

Object.freeze(config);
