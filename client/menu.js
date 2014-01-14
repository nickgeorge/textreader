Menu = function(options) {
  this.contentElement = null;
  this.options = options;
};

Menu.prototype.render = function(element) {
  this.contentElement = element;
  this.contentElement.innerHTML = menu.main({
    options: this.options
  });

  $(this.contentElement).click(Util.bind(function(event) {
    this.options[$(event.target).attr('data-index')].action(event.target);
  }, this));
};

