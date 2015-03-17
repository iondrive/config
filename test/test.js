'use strict';

const assert = require('assert');
const path = require('path');

class ConfigFixture {
  constructor(fixtureName) {
    this.originalEnv = JSON.parse(JSON.stringify(process.env));
    this.fixtureName = fixtureName;
  }

  resetEnv() {
    // Assume that we're not going to delete any variables from process.env during
    // our tests.
    Object.keys(process.env).forEach(key => {
      if (!this.originalEnv[key]) {
        delete process.env[key];
      } else {
        process.env[key] = this.originalEnv[key];
      }
    }, this);
  }

  getConfig(env) {
    Object.keys(env).forEach(key => process.env[key] = env[key]);
    if (this.fixtureName) {
      process.env.NODE_CONFIG_PATH = path.resolve(__dirname, 'fixtures', this.fixtureName);
    }
    delete require.cache[require.resolve('../lib/config.js')]
    return require('../');
  }
}

describe('config', () => {
  var fixture;

  beforeEach(() => fixture.resetEnv());

  describe('default definition location', () => {
    var cwd;

    before(() => {
      cwd = process.cwd()
      fixture = new ConfigFixture();
      process.chdir(path.resolve(__dirname, 'fixtures'));
    });

    after(() => process.chdir(cwd));

    it('should load config.js in current working directory', () => {
      var config = fixture.getConfig({ APP_FOO: 'hello' });

      assert.strictEqual(config.FOO, 'hello');
    });

    it('should prevent modification', () => {
      var config = fixture.getConfig({ APP_FOO: 'hello' });

      assert.throws(() => {
        config.CANT_SET_ME = 123;
      });
    });
  });

  describe('boolean', () => {
    before(() => fixture = new ConfigFixture('boolean'));

    it('should throw when not boolean', () => {
      assert.throws(() => fixture.getConfig({ APP_FOO: 'hello', APP_BAR: 'true' }));
      assert.throws(() => fixture.getConfig({ APP_FOO: 'true', APP_BAR: 'hello' }));
    });

    it('should resolve true values', () => {
      var trueValues = ['true', 'TRUE', 'yes', 'y', '1'];

      trueValues.forEach(value => {
        var config = fixture.getConfig({ APP_FOO: value, APP_BAR: value });
        assert.strictEqual(config.FOO, true);
        assert.strictEqual(config.BAR, true);
      });
    });

    it('should resolve false values', () => {
      var falseValues = ['false', 'FALSE', 'no', 'n', '0'];

      falseValues.forEach(value => {
        var config = fixture.getConfig({ APP_FOO: value, APP_BAR: value });
        assert.strictEqual(config.FOO, false);
        assert.strictEqual(config.BAR, false);
      });
    });
  });

  describe('integer', () => {
    before(() => fixture = new ConfigFixture('integer'));

    it('should throw when not integer', () => {
      assert.throws(() => fixture.getConfig({ APP_FOO: 'hello', APP_BAR: '123' }));
      assert.throws(() => fixture.getConfig({ APP_FOO: '123', APP_BAR: 'hello' }));
    });

    it('should resolve integer values', () => {
      var integerValues = ['0', '+123', '-456789'];

      integerValues.forEach(value => {
        var config = fixture.getConfig({ APP_FOO: value, APP_BAR: value });
        assert.strictEqual(config.FOO, parseInt(value, 10));
        assert.strictEqual(config.BAR, parseInt(value, 10));
      });
    });
  });

  describe('number', () => {
    before(() => fixture = new ConfigFixture('number'));

    it('should throw when not number', () => {
      assert.throws(() => fixture.getConfig({ APP_FOO: 'hello', APP_BAR: '123.45' }));
      assert.throws(() => fixture.getConfig({ APP_FOO: '123.45', APP_BAR: 'hello' }));
    });

    it('should resolve number values', () => {
      var integerValues = ['0', '+123.45', '-678.9'];

      integerValues.forEach(value => {
        var config = fixture.getConfig({ APP_FOO: value, APP_BAR: value });
        assert.strictEqual(config.FOO, parseFloat(value, 10));
        assert.strictEqual(config.BAR, parseFloat(value, 10));
      });
    });
  });

  describe('enum', () => {
    before(() => fixture = new ConfigFixture('enum'));

    it('should throw when not allowed value', () => {
      assert.throws(() => fixture.getConfig({ APP_FOO: 'hello', APP_BAR: 'b' }));
      assert.throws(() => fixture.getConfig({ APP_FOO: 'b', APP_BAR: 'hello' }));
    });

    it('should resolve when allowed value', () => {
      var allowedValues = ['a', 'b', 'c'];

      allowedValues.forEach(value => {
        var config = fixture.getConfig({ APP_FOO: value, APP_BAR: value });
        assert.strictEqual(config.FOO, value);
        assert.strictEqual(config.BAR, value);
      });
    });
  });

  describe('advanced', () => {
    before(() => fixture = new ConfigFixture('advanced'));

    it('should throw when not defined', () => {
      assert.throws(() => fixture.getConfig({}));
    });

    it('should override env name', () => {
      var config = fixture.getConfig({ NODE_ENV: 'production' });
      assert.strictEqual(config.NODE_ENV, 'production');
    });
  });

  describe('example', () => {
    before(() => fixture = new ConfigFixture('example'));

    it('should resolve values', () => {
      var config = fixture.getConfig({
        APP_STR: 'hello',
        APP_BOOL: 'false',
        APP_INT: '1234',
        APP_NUM: '3.14',
        APP_ENM: 'b'
      });
      assert.strictEqual(config.STR, 'hello');
      assert.strictEqual(config.BOOL, false);
      assert.strictEqual(config.INT, 1234);
      assert.strictEqual(config.NUM, 3.14);
      assert.strictEqual(config.ENM, 'b');
    });
  });

  describe('custom prefix', () => {
    before(() => fixture = new ConfigFixture('example'));

    it('should use custom prefix', () => {
      var config = fixture.getConfig({
        NODE_CONFIG_PREFIX: 'FOO',
        FOO_STR: 'hello',
        FOO_BOOL: 'false',
        FOO_INT: '1234',
        FOO_NUM: '3.14',
        FOO_ENM: 'b'
      });
      assert.strictEqual(config.STR, 'hello');
      assert.strictEqual(config.BOOL, false);
      assert.strictEqual(config.INT, 1234);
      assert.strictEqual(config.NUM, 3.14);
      assert.strictEqual(config.ENM, 'b');
    });
  });
});

