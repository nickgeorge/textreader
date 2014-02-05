util.require('menu.soy');
util.require('common/utils/keycodes.js');

Menu = function(options) {
  this.options = options;
  this.selectedIndex = 0;
};
util.inherits(Menu, Component);

/**
 * @typdef {
 *    text: string,
 *    indices: Array.<boolean>,
 *    action: function
 * }
 */
Menu.options;

Menu.prototype.setOptions = function(options) {
  this.options = options;
  this.buildMenuOptions();
};

Menu.prototype.createDom = function() {
  this.buildMenuOptions();
  this.listen(this.getContentElement(), 'click', function(event) {
    this.options[$(event.target).attr('data-index')].action(event.target);
  });
};

Menu.prototype.buildMenuOptions = function() {
  util.renderSoy(this.getContentElement(), menu.templates.main, {
    options: this.options
  });
};

Menu.prototype.highlightSelected = function() {
  this.selectedIndex = Math.max(0,
      Math.min(this.options.length - 1, this.selectedIndex));
  this.findAll('.menu-item-highlight').forEach(function(menuOption) {
    menuOption.classList.remove('menu-item-highlight');
  });
  if (this.options.length > 0) {
    this.find('.menu-item-' + this.selectedIndex).
        classList.add('menu-item-highlight');
  }
};

Menu.prototype.listenForKeys = function(element, callback) {
  callback = callback || function(){};
  this.listen(element, 'keydown', function(event) {
    var caught = true;
    switch (event.keyCode) {
      case util.events.KeyCodes.UP:
        this.selectedIndex--;
        break;
      case util.events.KeyCodes.DOWN:
        this.selectedIndex++;
        break;
      case util.events.KeyCodes.ENTER:
        this.options[this.selectedIndex].action(event.target);
        break;
      case util.events.KeyCodes.ESC:
        break;
      default:
        caught = false;
        break;
    }
    if (caught) event.preventDefault();
    this.highlightSelected();
  });

  this.listen(element, 'keyup', function(event) {
    switch (event.keyCode) {
      case util.events.KeyCodes.UP:
      case util.events.KeyCodes.DOWN:
      case util.events.KeyCodes.ENTER:
      case util.events.KeyCodes.ESC:
        break;
      default:
        callback(event);
        this.selectedIndex = 0;
        this.highlightSelected();
    }
  });
};
