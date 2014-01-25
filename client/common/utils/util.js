var pi = Math.PI;

util = function(){};

util.degToRad = function(degrees) {
  return degrees * Math.PI / 180;
};

util.inherits = function(childCtor, parentCtor) {
  /** @constructor */
  function tempCtor() {};
  tempCtor.prototype = parentCtor.prototype;
  childCtor.superClass_ = parentCtor.prototype;
  childCtor.prototype = new tempCtor();
  /** @override */
  childCtor.prototype.constructor = childCtor;
  childCtor.prototype.super = parentCtor;
};

util.unimplemented = function() {
  throw new Error("Unsupported Operation");
};

util.partial = function(fn, var_args) {
  var args = Array.prototype.slice.call(arguments, 1);
  return function() {
    // Prepend the bound arguments to the current arguments.
    var newArgs = Array.prototype.slice.call(arguments);
    newArgs.unshift.apply(newArgs, args);
    return fn.apply(this, newArgs);
  };
};

util.bind = function(fn, thisObj, var_args) {
  var args = Array.prototype.slice.call(arguments, 2);
  return function() {
    // Prepend the bound arguments to the current arguments.
    var newArgs = Array.prototype.slice.call(arguments);
    newArgs.unshift.apply(newArgs, args);
    return fn.apply(thisObj, newArgs);
  };
};

util.base = function(me, opt_methodName, var_args) {
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
        'util.base called from a method of one name ' +
        'to a method of a different name');
  }
};

util.forEach = function(arr, f, opt_obj) {
  var l = arr.length;
  var arr2 = arr;
  for (var i = 0; i < l; i++) {
    if (i in arr2) {
      f.call(opt_obj, arr2[i], i, arr);
    }
  }
};

util.require = function(path) {
  document.write('<script src="/' + path + '"></script>')
};

util.useCss = function(path) {
  document.write(
      '<link rel="stylesheet" type="text/css" href="/' + path + '">');
};

util.dom = {};
util.dom.expandToFit = function(elm, text, isUpExpand) {
  var initialHeight = getComputedStyle(elm).height;

  elm.innerHTML = text;
  var textSection = $(containerId + ' .context-section-text')[0];
  var finalHeight = getComputedStyle(textSection).height;

  textSection.style.height = initialHeight;
  textSection.offsetHeight; // Forces render
  textSection.style.transition = 'height .4s ease-in-out';
  textSection.style.height = finalHeight;

  textSection.addEventListener('transitionend', function transitionEnd(event) {
    if (event.propertyName == 'height') {
      textSection.style.transition = '';
      textSection.style.height = 'auto';
      textSection.removeEventListener('transitionend', transitionEnd, false);
    }
  }, false)

  if (isUpExpand) {
    var delta = parseInt(finalHeight) - parseInt(initialHeight);
    $('html, body').animate({
      scrollTop: $(window).scrollTop() + delta
    }, 400);
  }
};

