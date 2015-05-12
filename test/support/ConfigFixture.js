var path = require('path');

function ConfigFixture(fixtureName) {
  this.originalEnv = JSON.parse(JSON.stringify(process.env));
  this.fixtureName = fixtureName;
}

ConfigFixture.prototype.resetEnv = function () {
  // Assume that we're not going to delete any variables from process.env during
  // our tests.
  Object.keys(process.env).forEach(function (key) {
    if (!this.originalEnv[key]) {
      delete process.env[key];
    } else {
      process.env[key] = this.originalEnv[key];
    }
  }, this);
};

ConfigFixture.prototype.getConfig = function (env) {
  Object.keys(env).forEach(function (key) {
    process.env[key] = env[key];
  });
  if (this.fixtureName) {
    process.env.NODE_CONFIG_PATH = path.resolve(__dirname, '../fixtures', this.fixtureName);
  }
  delete require.cache[require.resolve('../../lib/config.js')];
  return require('../../');
};

module.exports = ConfigFixture;