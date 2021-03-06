Hovercard = function() {
  util.base(this);

  this.isHovered = false;
  this.isInContent = false;
  this.visible = false;
  this.anchor = null;
  this.offset = {top: 0, left: 0};
  this.anchorChangeCallback = function(){};

  Hovercard.instances.push(this);
};
util.inherits(Hovercard, Component);

Hovercard.instances = [];
Hovercard.root = null;

Hovercard.prototype.initialize = function() {
  if (!Hovercard.root) {
    Hovercard.root = document.createElement('div');
    Hovercard.root.id = 'hovercards';
    document.body.appendChild(Hovercard.root);
  }
  var contentElement = document.createElement('div');
  Hovercard.root.appendChild(contentElement);
  this.render(contentElement);
};

Hovercard.prototype.createDom = function() {
  util.dom.addClass(this.getContentElement(), 'hovercard');
  util.dom.hide(this.getContentElement());
  this.listen(this.getContentElement(), 'mouseenter', this.onContentHover);
  this.listen(this.getContentElement(), 'mouseleave', this.onContentHover);
};

Hovercard.prototype.setAnchor = function(element) {
  this.anchor = element;
  this.anchorChangeCallback(this.anchor);
};

Hovercard.prototype.setOffset = function(offset) {
  this.offset = offset;
};

Hovercard.prototype.showOnHover = function(elements,
    opt_anchorChangeCallback, opt_ctx) {
  var ctx = opt_ctx || this;
  if (opt_anchorChangeCallback) {
    this.anchorChangeCallback = 
        util.bind(opt_anchorChangeCallback, ctx);
  }
  this.listenAll(elements, 'mouseenter', this.onHover);
  this.listenAll(elements, 'mouseleave', this.onHover);
};

Hovercard.prototype.setContent = function(component) {
  component.render(this.getContentElement());
  return this;
};

Hovercard.prototype.onHover = function(event) {
  var isSameElement = event.target == this.anchor;
  if (event.type == 'mouseenter') {
    this.isHovered = true;
    if (!this.visible || !isSameElement) {
      this.anchor = event.target;
      this.anchorChangeCallback(this.anchor);
      this.isHovered = true; 
      this.show();
    }
  } else if (isSameElement){
    this.isHovered = false;
    setTimeout(util.bind(this.maybeHide, this), 75);
  }
};

Hovercard.prototype.onContentHover = function(event) {
  if (event.type == 'mouseenter') {
    this.isInContent = true;
  } else {
    this.isInContent = false;
    setTimeout(util.bind(this.maybeHide, this), 75);
  }
};

Hovercard.prototype.show = function() {
  this.isHovered = true;
  this.visible = true;
  $(this.getContentElement()).show();
  var anchorPosition = $(this.anchor).offset();

  $(this.getContentElement()).css('top', anchorPosition.top +
      $(this.anchor).height() - $(window).scrollTop() + this.offset.top);
  $(this.getContentElement()).css('left', anchorPosition.left + this.offset.left);

  this.anchorChangeCallback(this.anchor);  
};

Hovercard.prototype.hide = function() {
  $(this.getContentElement()).hide();
  this.visible = false;

  this.anchorChangeCallback(null);  
};

Hovercard.prototype.maybeHide = function() {
  if (!this.isHovered && !this.isInContent) {
    this.hide();
  }
};

Hovercard.prototype.isVisible = function() {
  return this.visible;
};

Hovercard.prototype.getAnchor = function() {
  return this.anchor;
};
