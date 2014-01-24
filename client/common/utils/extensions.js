
Array.prototype.apply = function(fnString, arg1, arg2, arg3) {
  for (var i = 0, elm; elm = this[i]; i++) {
    elm[fnString](arg1, arg2, arg3);
  }
};

Array.prototype.remove = function(removee){
  var index;
  while((index = this.indexOf(removee)) != -1){
      this.splice(index, 1);
  }
  return this;
};

Array.prototype.pushAll = function(addee) {
  for (var i = 0, length = addee.length; i < addee.length; i++) {
    this.push(addee[i]);
  }
};

Array.prototype.flatten = function() {
  var flattenedThis = [];
  for (var i = 0; this[i]; i++) {
    if (this[i].flatten) {
      this.pushAll(this[i].flatten());
    } else {
      flattenedThis.push(this[i]);
    }
  }
};

Array.prototype.average = function() {
  var sum = 0;
  var length = this.length;
  for (var i = 0; i < length; i++) {
    sum += this[i];
  }
  return sum / (length);
};

