# @iondrive/config

A [12-factor] configuration module for Node.js/io.js.

[![Build Status][travis-image]][travis-url]

## Principles

  * Application config is provided via environment variables. This ensures that infrastructure and deployment concerns don't leak into application code.
  * Every variable **must** be defined. This prevents scenarios where config can come from two or more places, such as defaults, command line or config files, simplifying debugging and setup.
  * Basic typed config, including enums. This prevents a category of bugs when checking config values, such as `"false" !== false`.

## Install

```bash
npm install @iondrive/config
```

## Usage

### Definition file

When `require('@iondrive/config')` is invoked it loads a config definition file `config.js` in the current working directory or a file specified by the environment variable `NODE_CONFIG_PATH`. The config definition file should export a map of variable names to types (we use `.js` over `.json` to allow commenting and dynamic configurations).

An example config definition file:

```js
// config.js

module.exports = {
  STR: 'string',
  BOOL: 'boolean',
  INT: 'integer',
  NUM: 'number',
  ENM: ['a', 'b', 'c'],
  DUR: 'duration'
};
```

### Types

The type must be one of `string`, `boolean`, `integer`, `number`, `enum` (`enum` is implied when the value is an array) or `duration`.

  * The `string` type will match any value (since environment variables are all strings).
  * The `boolean` type will perform a case insenstive match on `'false'`, `'true'`, `'yes'`, `'no'`, `'y'`, `'n'`, `'1'` and `'0'`.
  * The `integer` type will only match integers in decimal notation, e.g. `'123'`, `'-555'`.
  * The `number` type will only match decimal notation, e.g `'123'`, `'-3.14'`.
  * The `enum` type will only match the string values provided.
  * The `duration` type will match either integers (where the value represents milliseconds) or a duration string accepted by the [ms] package, e.g. `'15m'`, `'6h'` or `'14d'`.

### Advanced options

If the value of a config definition key is an object, it can declare the following properties:

  * `type`: the type of the config variable.
  * `env`: override the environment variable name (allows you to ignore the config prefix in special circumstances).
  * `values`: for an enum type, the values allowed.
  * `validator`: a custom validator function that is passed the config value string. If it returns false, the config value is invalid and an error will be thrown.

```js
// config.js

module.exports = {
  NODE_ENV: {
    type: 'enum',
    env: 'NODE_ENV',
    values: ['development', 'test', 'production']
  }
};

module.exports = {
  CUSTOM_STRING: {
    type: 'string',
    validator: function (value) {
      return /^[a-z]+$/.test(value);
    }
  }
};
```

### Application usage

Given the defintion file above and by running the app as follows:

```bash
APP_STR="hello" APP_BOOL="false" APP_INT="123" APP_NUM="3.14" APP_ENM="b" node app.js
```

The config can be accessed within the app as follows:

```js
// app.js

var assert = require('assert');
var config = require('@iondrive/config');

assert.strictEqual(config.STR, 'hello');
assert.strictEqual(config.BOOL, false);
assert.strictEqual(config.INT, 123);
assert.strictEqual(config.NUM, 3.14);
assert.strictEqual(config.ENM, 'b');
```

#### Duration

Duration types are special in that instead of returning a primitive value, an object with conversion methods is returned to ensure that at the point of use the duration is in the correct units. These conversion methods always round the value, so be careful with your precision.

```js
// Assuming APP_DUR has the value '2d'

config.DUR.asMilliseconds(); // 172800000
config.DUR.asSeconds(); // 172800
config.DUR.asMinutes(); // 2880
config.DUR.asHours(); // 48
config.DUR.asDays(); // 2
config.DUR.asYears(); // 0
```

## Prefix

By default all variables must be prefixed by `APP` in the environment variables as above in order to prevent any clobbering of existing environment variables.

The default `APP` prefix can be changed with the environment variable `NODE_CONFIG_PREFIX`:

```bash
NODE_CONFIG_PREFIX="ABC" ABC_STR="hello" ABC_BOOL="false" ABC_INT="123" ABC_NUM="3.14" APP_ENM="b" node app.js
```

## Recommended deployment

We recommend an environment file is created that defines the environment configuration for the app (presumably with permissions of 400 for the app user):

```bash
# environment

export APP_STR="hello"
export APP_BOOL="false"
export APP_INT="123"
export APP_NUM="3.14"
export APP_ENM="b"
```

This can be used by sourcing the file prior to executing the application:

```bash
. ./environment
node app.js
```

## License

[MIT](LICENSE)

[12-factor]: http://12factor.net/config
[travis-image]: https://img.shields.io/travis/iondrive/config.svg
[travis-url]: https://travis-ci.org/iondrive/config
[ms]: https://github.com/rauchg/ms.js
