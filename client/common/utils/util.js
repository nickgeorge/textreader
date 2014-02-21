util = {};

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

util.require = function(path) {
  document.write('<script src="/' + path + '"></script>')
};

util.useCss = function(path) {
  document.write(
      '<link rel="stylesheet" type="text/css" href="/' + path + '">');
};

util.renderSoy = function(element, template, params) {
  element.innerHTML = template(params);
};

util.assert = function(bool, message) {
  if (!bool) {
    throw new Error(message);
  }
};

util.assertEquals = function(a, b, message) {
  if (a != b) {
    throw new Error(message);
  }
};

/*********************/
/*    util.style     */
/*********************/
util.style = {};

util.style.getRgbValues = function(rgbString) {
  var parts = rgbString.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
  return {
    red: parseInt(parts[1]),
    green: parseInt(parts[2]),
    blue: parseInt(parts[3])
  };
};

util.style.toRgbString = function(color) {
  return 'rgb(' + color.red + ', ' + color.green + ', ' + color.blue + ')';
};



/********************/
/*     util.dom     */
/********************/
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

util.dom.getClosest = function(element, selector) {
  while (!util.dom.matches(element, selector) && element.parentElement) {
    element = element.parentElement;
  }
  if (!util.dom.matches(element, selector)) {
    return null;
  }
  return element;
};

util.dom.isChild = function(element, parent) {
  while (element != parent && element.parentElement) {
    element = element.parentElement;
  }
  return element == parent;
};

util.dom.findAll = function(selector, opt_parent) {
  var parent = opt_parent || document;
  return Array.prototype.slice.apply(
      parent.querySelectorAll(selector));
};

util.dom.hasClass = function(element, cssClass) {
  return element.classList.contains(cssClass);
};

util.dom.addClass = function(element, cssClass) {
  element.classList.add(cssClass);
};

util.dom.removeClass = function(element, cssClass) {
  element.classList.remove(cssClass);
};

// n.b. This will only work for nodes that have parents.
util.dom.matches = function(element, selector) {
  return util.dom.findAll(selector, element.parent).
      indexOf(element) != -1;
};

util.dom.getData = function(element, key) {
  return element.dataset[key];
};

util.dom.getIntData = function(element, key) {
  return parseInt(element.dataset[key]);
};

util.dom.hide = function(element) {
  element.style.display = 'none';
};


/********************/
/*      util.fn     */
/********************/
util.fn = {};

util.fn.addClass = function(cssClass) {
  return function(element) {
    element.classList.add(cssClass);
  }
};

util.fn.removeClass = function(cssClass) {
  return function(element) {
    element.classList.remove(cssClass);
  }
};

util.fn.pluck = function(attr) {
  return function(obj) {
    return obj[attr];
  }
};

util.fn.equals = function(ref) {
  return function(test) {
    return test === ref;
  }
};

util.fn.outputEquals = function(f, ref) {
  return function(test) {
    return f(test) === ref;
  }
};

util.fn.pluckEquals = function(attr, ref) {
  return function(obj) {
    return obj[attr] === ref;
  }
};

util.fn.not  = function(f) {
  return function() {
    return !f.apply(this, arguments);
  };
};

util.fn.greaterThan = function(ref) {
  return function(test) {
    return test > ref;
  }
};

util.fn.goTo = function(url) {
  return function() {
    window.location.href = url;
  };
};


/**********************/
/*     util.array     */
/**********************/
util.array = {};

util.array.pushAll = function(arr, addee) {
  for (var i = 0, length = addee.length; i < addee.length; i++) {
    arr.push(addee[i]);
  }
};

util.array.apply = function(arr, fnString, arg1, arg2, arg3) {
  for (var i = 0, elm; elm = arr[i]; i++) {
    elm[fnString](arg1, arg2, arg3);
  }
};

util.array.remove = function(arr, removee){
  var index;
  while((index = arr.indexOf(removee)) != -1){
      arr.splice(index, 1);
  }
  return arr;
};

util.array.flatten = function(arr) {
  var flattenedThis = [];
  for (var i = 0; arr[i]; i++) {
    if (arr[i].flatten) {
      arr.pushAll(arr[i].flatten());
    } else {
      flattenedThis.push(arr[i]);
    }
  }
};

util.array.average = function(arr) {
  var sum = 0;
  var length = arr.length;
  for (var i = 0; i < length; i++) {
    sum += arr[i];
  }
  return sum / (length);
};

util.array.pluck = function(arr, key) {
  var pluckedArray = [];
  arr.forEach(function(value) {
    pluckedArray.push(value[key]);
  });
  return pluckedArray;
};

util.array.forEach = function(arr, f, opt_ctx) {
  var l = arr.length;
  var arr2 = arr;
  for (var i = 0; i < l; i++) {
    if (i in arr2) {
      f.call(opt_ctx, arr2[i], i, arr);
    }
  }
};

util.array.getOnlyElement = function(arr) {
  util.assertEquals(1, arr.length,
      'Array must have only one element.  Length: ' + arr.length);
  return arr[0];
};


/**********************/
/*    util.object     */
/**********************/
util.object = {};
util.object.forEach = function(obj, f, opt_ctx) {
  for (var key in obj) {
    f.call(opt_ctx, obj[key], key, obj);
  }
};

util.object.toArray = function(obj, f, opt_ctx) {
  var arr = [];
  util.object.forEach(obj, function(elm,  key, origObj) {
    arr.push(f.call(opt_ctx, elm, key, origObj));
  }, opt_ctx);
  return arr;
};

util.object.shallowClone = function(obj) {
  var res = {};
  for (var key in obj) {
    res[key] = obj[key];
  }
  return res;
};
