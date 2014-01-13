var pi = Math.PI;

Util = function(){};

Util.degToRad = function(degrees) {
  return degrees * Math.PI / 180;
};

Util.inherits = function(childCtor, parentCtor) {
  /** @constructor */
  function tempCtor() {};
  tempCtor.prototype = parentCtor.prototype;
  childCtor.superClass_ = parentCtor.prototype;
  childCtor.prototype = new tempCtor();
  /** @override */
  childCtor.prototype.constructor = childCtor;
  childCtor.prototype.super = parentCtor;
};

Util.partial = function(fn, var_args) {
  var args = Array.prototype.slice.call(arguments, 1);
  return function() {
    // Prepend the bound arguments to the current arguments.
    var newArgs = Array.prototype.slice.call(arguments);
    newArgs.unshift.apply(newArgs, args);
    return fn.apply(this, newArgs);
  };
};

Util.bind = function(fn, thisObj, var_args) {
  var args = Array.prototype.slice.call(arguments, 2);
  return function() {
    // Prepend the bound arguments to the current arguments.
    var newArgs = Array.prototype.slice.call(arguments);
    newArgs.unshift.apply(newArgs, args);
    return fn.apply(thisObj, newArgs);
  };
};

Util.base = function(me, opt_methodName, var_args) {
  var caller = arguments.callee.caller;
  if (caller.superClass_) {
    // This is a constructor. Call the superclass constructor.
    return caller.superClass_.constructor.apply(
        me, Array.prototype.slice.call(arguments, 1));
  }

  var args = Array.prototype.slice.call(arguments, 2);
  var foundCaller = false;
  for (var ctor = me.constructor;
       ctor; ctor = ctor.superClass_ && ctor.superClass_.constructor) {
    if (ctor.prototype[opt_methodName] === caller) {
      foundCaller = true;
    } else if (foundCaller) {
      return ctor.prototype[opt_methodName].apply(me, args);
    }
  }

  // If we did not find the caller in the prototype chain,
  // then one of two things happened:
  // 1) The caller is an instance method.
  // 2) This method was not called by the right caller.
  if (me[opt_methodName] === caller) {
    return me.constructor.prototype[opt_methodName].apply(me, args);
  } else {
    throw Error(
        'Util.base called from a method of one name ' +
        'to a method of a different name');
  }
};

Util.sqr = function(x) {
  return x*x;
};

Util.forEach = function(arr, f, opt_obj) {
  var l = arr.length;  // must be fixed during loop... see docs
  var arr2 = arr;
  for (var i = 0; i < l; i++) {
    if (i in arr2) {
      f.call(opt_obj, arr2[i], i, arr);
    }
  }
};

Util.assertEquals = function(expected, test) {
  if (expected !== test) throw new Error('Assertion failed: ' +
      'Expected {' + expected + '} but got {' + test + '}.');
};

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
