var assert = require('assert');
var path = require('path');

var ConfigFixture = require('./support/ConfigFixture');

describe('config', function () {
  var fixture;

  beforeEach(function () { fixture.resetEnv(); });

  describe('default definition location', function () {
    var cwd;

    before(function () {
      cwd = process.cwd();
      fixture = new ConfigFixture();
      process.chdir(path.resolve(__dirname, 'fixtures'));
    });

    after(function () { process.chdir(cwd); });

    it('should load config.js in current working directory', function () {
      var config = fixture.getConfig({ APP_FOO: 'hello' });

      assert.strictEqual(config.FOO, 'hello');
    });

    it('should prevent modification', function () {
      var config = fixture.getConfig({ APP_FOO: 'hello' });

      config.CANT_SET_ME = 123;

      assert.strictEqual(typeof config.CANT_SET_ME, 'undefined');
    });
  });

  describe('boolean', function () {
    before(function () { fixture = new ConfigFixture('boolean'); });

    it('should throw when not boolean', function () {
      assert.throws(function () { fixture.getConfig({ APP_FOO: 'hello', APP_BAR: 'true' }); });
      assert.throws(function () { fixture.getConfig({ APP_FOO: 'true', APP_BAR: 'hello' }); });
    });

    it('should resolve true values', function () {
      var trueValues = ['true', 'TRUE', 'yes', 'y', '1'];

      trueValues.forEach(function (value) {
        var config = fixture.getConfig({ APP_FOO: value, APP_BAR: value });
        assert.strictEqual(config.FOO, true);
        assert.strictEqual(config.BAR, true);
      });
    });

    it('should resolve false values', function () {
      var falseValues = ['false', 'FALSE', 'no', 'n', '0'];

      falseValues.forEach(function (value) {
        var config = fixture.getConfig({ APP_FOO: value, APP_BAR: value });
        assert.strictEqual(config.FOO, false);
        assert.strictEqual(config.BAR, false);
      });
    });
  });

  describe('integer', function () {
    before(function () { fixture = new ConfigFixture('integer'); });

    it('should throw when not integer', function () {
      assert.throws(function () { fixture.getConfig({ APP_FOO: 'hello', APP_BAR: '123' }); });
      assert.throws(function () { fixture.getConfig({ APP_FOO: '123', APP_BAR: 'hello' }); });
    });

    it('should resolve integer values', function () {
      var integerValues = ['0', '+123', '-456789'];

      integerValues.forEach(function (value) {
        var config = fixture.getConfig({ APP_FOO: value, APP_BAR: value });
        assert.strictEqual(config.FOO, parseInt(value, 10));
        assert.strictEqual(config.BAR, parseInt(value, 10));
      });
    });
  });

  describe('number', function () {
    before(function () { fixture = new ConfigFixture('number'); });

    it('should throw when not number', function () {
      assert.throws(function () { fixture.getConfig({ APP_FOO: 'hello', APP_BAR: '123.45' }); });
      assert.throws(function () { fixture.getConfig({ APP_FOO: '123.45', APP_BAR: 'hello' }); });
    });

    it('should resolve number values', function () {
      var integerValues = ['0', '+123.45', '-678.9'];

      integerValues.forEach(function (value) {
        var config = fixture.getConfig({ APP_FOO: value, APP_BAR: value });
        assert.strictEqual(config.FOO, parseFloat(value));
        assert.strictEqual(config.BAR, parseFloat(value));
      });
    });
  });

  describe('enum', function () {
    before(function () { fixture = new ConfigFixture('enum'); });

    it('should throw when not allowed value', function () {
      assert.throws(function () { fixture.getConfig({ APP_FOO: 'hello', APP_BAR: 'b' }); });
      assert.throws(function () { fixture.getConfig({ APP_FOO: 'b', APP_BAR: 'hello' }); });
    });

    it('should resolve when allowed value', function () {
      var allowedValues = ['a', 'b', 'c'];

      allowedValues.forEach(function (value) {
        var config = fixture.getConfig({ APP_FOO: value, APP_BAR: value });
        assert.strictEqual(config.FOO, value);
        assert.strictEqual(config.BAR, value);
      });
    });
  });

  describe('duration', function () {
    before(function () { fixture = new ConfigFixture('duration'); });

    it('should throw when invalid', function () {
      assert.throws(function () { fixture.getConfig({ APP_FOO: 'hello', APP_BAR: '1d' }); });
      assert.throws(function () { fixture.getConfig({ APP_FOO: '1d', APP_BAR: 'hello' }); });
    });

    it('should return duration when valid', function () {
      var durations = [100, 5000000, '1ms', '1s', '1m', '1h', '1d', '1y'];
      durations.forEach(function (value) {
        fixture.getConfig({ APP_FOO: value, APP_BAR: value });
      });
    });

    it('should expose conversion methods', function () {
      var config = fixture.getConfig({ APP_FOO: '2d', APP_BAR: '2y' });
      assert.equal(config.FOO.asMilliseconds(), 172800000);
      assert.equal(config.FOO.asSeconds(), 172800);
      assert.equal(config.FOO.asMinutes(), 2880);
      assert.equal(config.FOO.asHours(), 48);
      assert.equal(config.BAR.asDays(), 731); // rounded from 730.5
      assert.equal(config.BAR.asYears(), 2);
      console.log(config.FOO.asYears())
    });
  });

  describe('advanced', function () {
    before(function () { fixture = new ConfigFixture('advanced'); });

    it('should throw when not defined', function () {
      assert.throws(function () { fixture.getConfig({}); });
    });

    it('should override env name', function () {
      var config = fixture.getConfig({ NODE_ENV: 'production' });
      assert.strictEqual(config.NODE_ENV, 'production');
    });
  });

  describe('example', function () {
    before(function () { fixture = new ConfigFixture('example'); });

    it('should resolve values', function () {
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

  describe('custom prefix', function () {
    before(function () { fixture = new ConfigFixture('example'); });

    it('should use custom prefix', function () {
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

  describe('custom validator', function () {
    before(function () { fixture = new ConfigFixture('validator'); });

    it('should throw when validator returns false', function () {
      assert.throws(function () { fixture.getConfig({ APP_CUSTOM_STRING: 'not_ok' }); });
    });

    it('should use custom validator', function () {
      var config = fixture.getConfig({ APP_CUSTOM_STRING: 'ok' });
      assert.strictEqual(config.CUSTOM_STRING, 'ok');
    });
  });
});
