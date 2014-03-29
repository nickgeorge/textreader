EventSource = function() {
  this.listeners_ = {};

};

EventSource.prototype.addEventListener = function(type, action) {
  this.listeners_[type] = this.listeners_[type] || [];
  this.listeners_[type].push(action);
};

EventSource.prototype.dispatchEvent = function(event) {
  var listeners = this.listeners_[event.type];
  if (!listeners) return;
  util.array.forEach(listeners, function(listener) {
    listener(event);
  });
};

EventSource.prototype.listen = function(src, type, handler, opt_ctx) {
  src.addEventListener(type, util.bind(handler, opt_ctx || this));
};

EventSource.prototype.listenAll = function(srcs, type, handler, opt_ctx) {
  util.array.forEach(srcs, function(src) {
    this.listen(src, type, handler, opt_ctx);
  }, this);
};
