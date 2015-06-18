import ms = require('ms');

class Duration {
  private ms: number;

  constructor(duration: number);
  constructor(duration: string);
  constructor(duration: any) {
    if (typeof duration === 'number') {
      this.ms = duration;
    } else {
      this.ms = ms(duration);      
    }
    if (!this.ms) throw new Error('Cannot convert to duration');
  }
}

var s = 1000;
var m = s * 60;
var h = m * 60;
var d = h * 24;
var y = d * 365.25;

['milliseconds', 'seconds', 'minutes', 'hours', 'days', 'years'].forEach(key => {
  var keySuffix = key[0].toUpperCase() + key.slice(1);
  Duration.prototype['as' + keySuffix] = 
  Duration.prototype['to' + keySuffix] = function () { // Arrow syntax breaks `this` here
    switch(key) {
      case 'milliseconds': return this.ms;
      case 'seconds': return Math.round(this.ms / s);
      case 'minutes': return Math.round(this.ms / m);
      case 'hours': return Math.round(this.ms / h);
      case 'days': return Math.round(this.ms / d);
      case 'years': return Math.round(this.ms / y);
    }
  };
});

export = Duration;
