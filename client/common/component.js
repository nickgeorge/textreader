Component = function(){
  this.contentElement = null;
};

Component.prototype.render = function(element) {
  this.contentElement = element;
};

Component.prototype.getContentElement = function() {
  return this.contentElement;
};

