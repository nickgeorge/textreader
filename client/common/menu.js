util.require('menu.soy');
util.require('common/utils/keycodes.js');

Menu = function(options) {
  util.base(this);

  this.options = options;
  this.highlitIndex = 0;
  this.hovercard = null;
};
util.inherits(Menu, Component);

/**
 * @typdef {
 *    text: string,
 *    indices: Array.<boolean>,
 *    value: *
 * }
 */
Menu.options;

Menu.prototype.setOptions = function(options) {
  this.options = options;
  this.buildMenuOptions();
};

Menu.prototype.createDom = function() {
  this.buildMenuOptions();
  this.listen(this.getContentElement(), 'click', this.onClick);
};

Menu.prototype.buildMenuOptions = function() {
  util.renderSoy(this.getContentElement(), menu.templates.main, {
    options: this.options
  });
};

Menu.prototype.highlightSelected = function() {
  this.highlitIndex = Math.max(0,
      Math.min(this.options.length - 1, this.highlitIndex));
  this.findAll('.menu-item-highlight').forEach(function(menuOption) {
    menuOption.classList.remove('menu-item-highlight');
  });
  if (this.options.length > 0) {
    this.find('.menu-item-' + this.highlitIndex).
        classList.add('menu-item-highlight');
  }
};

Menu.prototype.setHovercard = function(hovercard) {
  this.hovercard = hovercard;
};

Menu.prototype.getAnchor = function() {
  return this.hovercard ? this.hovercard.getAnchor() : null;
};

Menu.prototype.listenForKeys = function(element, callback) {
  callback = callback || function(){};
  this.listen(element, 'keydown', function(event) {
    var preventDefault = true;
    switch (event.keyCode) {
      case util.events.KeyCodes.UP:
        this.highlitIndex--;
        break;
      case util.events.KeyCodes.DOWN:
        this.highlitIndex++;
        break;
      case util.events.KeyCodes.ENTER:
      case util.events.KeyCodes.COMMA:
        if (this.options.length > 0) {
          this.fireSelect(this.highlitIndex);
        }
        break;
      case util.events.KeyCodes.BACKSPACE:
        if (element.value == '') {
          this.firePop();
        }
        preventDefault = false;
        break;
      case util.events.KeyCodes.ESC:
        break;
      default:
        preventDefault = false;
        break;
    }
    if (preventDefault) event.preventDefault();
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
        this.highlitIndex = 0;
        this.highlightSelected();
    }
  });
};

Menu.prototype.onClick = function(event) {
  var menuItem = util.dom.getClosest(event.target, '.menu-item');
  this.fireSelect(util.dom.getData(menuItem, 'index'));
};

Menu.prototype.fireSelect = function(index) {
  this.dispatchEvent(new Menu.Event(Menu.EventType.SELECT,
      this.options[index].value, this.getAnchor(), event));
};

Menu.prototype.firePop = function() {
  this.dispatchEvent(new Menu.Event(Menu.EventType.POP));
};

Menu.Event = function(type, opt_value, opt_anchor, opt_event) {
  this.type = type;
  this.value = opt_value || null;
  this.anchor = opt_anchor || null;
  this.originalEvent = opt_event || null;
};

Menu.EventType = {
  SELECT: 'select',
  ACTION: 'action',
  POP: 'pop'
};
