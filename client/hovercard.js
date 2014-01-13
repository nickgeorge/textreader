Hovercard = function() {
  this.isHovered = false;
  this.isInContent = false;
  this.isVisible = false;
  this.anchor = null;
  this.contentElement = document.createElement('div');

  $(this.contentElement).addClass('hovercard');
  $(this.contentElement).hide();
  if ($('#hovercards').length == 0) {
    var hovercardsDiv = document.createElement('div');
    hovercardsDiv.id = 'hovercards';
    document.body.appendChild(hovercardsDiv);
  }
  $('#hovercards').append(this.contentElement);


  Hovercard.instances.push(this);
};

Hovercard.instances = [];

Hovercard.prototype.showOnHover = function(selector) {
  $(this.contentElement).hover(Util.bind(this.onContentHover, this));
  $(selector).hover(Util.bind(this.onHover, this));
};

Hovercard.prototype.showOnClick = function(selector) {
  $(document.body).click(Util.bind(this.onClick, this));
};

Hovercard.prototype.setContent = function(component) {
  component.render(this.contentElement);
  return this;
};

Hovercard.prototype.onHover = function(event) {
  var isSameElement = event.target == this.anchor;
  if (event.type == 'mouseenter') {
    if (this.isVisible) {
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
      setTimeout(Util.bind(this.maybeHide, this), 75);
  }
};

Hovercard.prototype.onContentHover = function(event) {
  if (event.type == 'mouseenter') {
    this.isInContent = true;
  } else {
    this.isInContent = false;
    setTimeout(Util.bind(this.maybeHide, this), 75);
  }
};

Hovercard.prototype.onClick = function(event) {
  this.hide();
  if ($(event.target).hasClass('word-count-word')) {
    this.anchor = event.target;
    this.show();
  }
};

Hovercard.prototype.show = function() {
  this.isHovered = true;
  if (this.isVisible) return;
  //$('.hovercard').hide();
  this.isVisible = true;
  $(this.contentElement).show();
  var offset = $(this.anchor).offset();
  $(this.contentElement).css('top', offset.top + $(this.anchor).height() - 2);
  $(this.contentElement).css('left', Math.max(offset.left,
      Math.min(event.pageX - $(this.contentElement).width()/4,
          offset.left + $(this.anchor).width() - $(this.contentElement).width())));
};

Hovercard.prototype.hide = function() {
  $(this.contentElement).hide();
  this.isVisible = false;
  this.anchor = null;
};

Hovercard.prototype.maybeHide = function() {
  if (!this.isHovered && !this.isInContent) {
    this.hide();
  }
};
