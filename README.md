# iondrive/config

A [12-factor](http://12factor.net/config) configuration module for Node.js/io.js.

## Principles

  * Provide config in the environment variables. This ensures that infrastructure and deployment concerns don't leak into application code.
  * Every variable **must** be defined. This prevents scenarios where config can come from two or more places, such as defaults, command line or config files, simplifying debugging and setup.
  * Basic typed config. This prevents a category of bugs when checking config values, such as `"false" !== false`.

## Install

```bash
npm install iondrive/config
```

## Usage

### Definition file

When `require('iondrive/config')` is invoked it loads a config definition file `config.js` in the current working directory or a file specified by the environment variable `NODE_CONFIG_PATH`. The config definition file should export a map of variable names to types (we use `.js` over `.json` to allow commenting and dynamic configurations).

An example config definition file:

```js
// config.js

module.exports = {
  STR: 'string',
  BOOL: 'boolean',
  INT: 'integer',
  NUM: 'number'
};
```

### Types

The type must be one of `string`, `boolean`, `integer`, or `number`.

  * The `string` type will match any value (since environment variables are all strings).
  * The `boolean` type will perform a case insenstive match on `'false'`, `'true'`, `'yes'`, `'no'`, `'y'`, `'n'`, `'1'` and `'0'`.
  * The `integer` type will only match integers in decimal notation, e.g. `'123'`, `'-555'`.
  * The `number` type will only match decimal notation, e.g `'123'`, `'-3.14'`.

### Application usage

Given the defintion file abolve and by running the app as follows:

```bash
APP_STR="hello" APP_BOOL="false" APP_INT="123", APP_NUM="3.14" node app.js
```

The config can be accessed within the app as follows:

```js
// app.js

var assert = require('assert');
var config = require('iondrive/config');

assert.strictEqual(config.STR, 'hello');
assert.strictEqual(config.BOOL, false);
assert.strictEqual(config.INT, 123);
assert.strictEqual(config.NUM, 3.14);
```

## Prefix

By default all variables must be prefixed by `APP` in the environment variables as above in order to prevent any clobbering of existing environment variables.

The default `APP` prefix can be changed with the environment variable `NODE_CONFIG_PREFIX`:

```bash
NODE_CONFIG_PREFIX="ABC" ABC_STR="hello" ABC_BOOL="false" ABC_INT="123", ABC_NUM="3.14" node app.js
```

## Recommended deployment

We recommend an environment file is created that defines the environment configuration for the app (presumably with permissions of 400 for the app user):

```bash
export APP_STR="hello"
export APP_BOOL="false"
export APP_INT="123"
export APP_NUM="3.14"
```

This can be used by sourcing the file prior to executing the application:

```bash
. ./environment
node app.js
```

## License

MIT
