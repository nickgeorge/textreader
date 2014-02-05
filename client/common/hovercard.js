Hovercard = function() {
  this.isHovered = false;
  this.isInContent = false;
  this.visible = false;
  this.anchor = null;
  this.offset = {top: 0, left: 0};
  this.contentElement = document.createElement('div');

  $(this.contentElement).addClass('hovercard');
  $(this.contentElement).hide();
  if ($('#hovercards').length == 0) {
    var hovercardsDiv = document.createElement('div');
    hovercardsDiv.id = 'hovercards';
    document.body.appendChild(hovercardsDiv);
  }
  $('#hovercards').append(this.contentElement);
  $(this.contentElement).hover(util.bind(this.onContentHover, this));


  Hovercard.instances.push(this);
};
Hovercard.instances = [];

Hovercard.prototype.setAnchor = function(element) {
  this.anchor = element;
};

Hovercard.prototype.setOffset = function(offset) {
  this.offset = offset;
};

Hovercard.prototype.showOnHover = function(selectorOrJquery) {
  this.anchor = $(selectorOrJquery)[0];
  $(selectorOrJquery).hover(util.bind(this.onHover, this));
};

Hovercard.prototype.setContent = function(component) {
  component.render(this.contentElement);
  return this;
};

Hovercard.prototype.onHover = function(event) {
  var isSameElement = event.target == this.anchor;
  if (event.type == 'mouseenter') {
    if (this.visible) {
      if (isSameElement) {
        this.isHovered = true;
        return;
      }
      this.hide();
    }
    this.anchor = event.target;
    this.show();
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
  if (this.visible) return;
  this.visible = true;
  $(this.contentElement).show();
  var anchorPosition = $(this.anchor).offset();

  $(this.contentElement).css('top', anchorPosition.top +
      $(this.anchor).height() - $(window).scrollTop() + this.offset.top);
  $(this.contentElement).css('left', anchorPosition.left + this.offset.left);

  // $(this.contentElement).css('left', Math.max(offset.left,
  //     Math.min(event.pageX - $(this.contentElement).width()/4,
  //         offset.left + $(this.anchor).width() - $(this.contentElement).width())));
};

Hovercard.prototype.hide = function() {
  $(this.contentElement).hide();
  this.visible = false;
};

Hovercard.prototype.maybeHide = function() {
  if (!this.isHovered && !this.isInContent) {
    this.hide();
  }
};

Hovercard.prototype.isVisible = function() {
  return this.visible;
};
