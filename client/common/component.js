Component = function(){
  this.contentElement = null;
};

Component.prototype.render = function(element) {
  this.contentElement = element;
  this.createDom();
};

Component.prototype.createDom = util.unimplemented;

Component.prototype.getContentElement = function() {
  return this.contentElement;
};

Component.prototype.find = function(selector) {
  var targets = $(this.getContentElement()).find(selector);
  if (targets.length > 1) {
    throw new Error('Multiple elements found matching [' + selector + ']');
  }
  if (targets.length == 0) {
    throw new Error('No elements found matching [' + selector + ']');
  }
  return targets[0];
};

Component.prototype.findAll = function(selector) {
  return Array.prototype.slice.call(
      $(this.getContentElement()).find(selector), 0);
};

Component.prototype.listen = function(element, type, handler, opt_ctx) {
  element.addEventListener(type, util.bind(handler, opt_ctx || this));
};
