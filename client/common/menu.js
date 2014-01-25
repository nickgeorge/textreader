util.require('menu.soy');

Menu = function(options) {
  this.contentElement = null;
  this.options = options;
};

Menu.prototype.render = function(element) {
  this.contentElement = element;
  this.contentElement.innerHTML = menu.templates.main({
    options: this.options
  });

  $(this.contentElement).click(util.bind(function(event) {
    this.options[$(event.target).attr('data-index')].action(event.target);
  }, this));
};

