module.exports = {
  CUSTOM_STRING: {
    type: 'string',
    validator: function (value) {
      return value === 'ok';
    }
  }
};
