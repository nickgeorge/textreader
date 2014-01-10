Hovercard = function(anchor) {
  this.anchor = anchor;
  this.isHovered = false;
  this.isInContent = false;
  this.isVisible = false;

  this.contentDiv = document.createElement('div');
  $(this.contentDiv).addClass('hovercard-container');
  $(this.contentDiv).hide();
  this.contentDiv.innerHTML = hovercard.main();
  $('#hovercards').append(this.contentDiv);

  $(this.contentDiv).hover(Util.bind(this.onContentDivHover, this));
  $(anchor).hover(Util.bind(this.onHover, this));

};

Hovercard.prototype.onHover = function(event) {
  if (event.type == 'mouseenter') {
    this.isHovered = true;
    if (this.isVisible) return;
    this.isVisible = true;
    $(this.contentDiv).show();
    $(this.contentDiv).css('top', $(event.target).offset().top + $(event.target).height());
    $(this.contentDiv).css('left', $(event.target).offset().left);
  } else {
    this.isHovered = false;
    setTimeout(Util.bind(this.maybeHide, this), 150);
  }
};

Hovercard.prototype.onContentDivHover = function(event) {
  if (event.type == 'mouseenter') {
    this.isInContent = true;
  } else {
    this.isInContent = false;
    $(this.contentDiv)
    setTimeout(Util.bind(this.maybeHide, this), 150);
  }
};

Hovercard.prototype.maybeHide = function() {
  if (!this.isHovered && !this.isInContent) {
    $(this.contentDiv).hide();
    this.isVisible = false;
  }
};
