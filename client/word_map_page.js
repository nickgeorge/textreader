util.require('word_map.soy');
util.require('common/searchbar.js');
util.require('common/hovercard.js');
util.require('common/menu.js');
util.useCss('word_map_page.css');

WordMapPage = function(data) {
  util.base(this);

  this.bookIds = data.bookIds;
  this.booksData = data.allBooks;
  this.uncommonShared = data.uncommonShared;
  this.commonUnsharedMap = data.commonUnsharedMap;
  this.hovercard = new Hovercard();
  this.menu = new Menu([
    {
      text: 'Show contexts',
      value: 'context'
    }
  ]);
  this.searchbar = null;

  this.wordListContainer = null;
  this.wordListPlaceholder = null;
};
util.inherits(WordMapPage, Component);


WordMapPage.prototype.createDom = function() {
  soy.renderElement(this.getContentElement(), wordmap.templates.main, {
    booksData: this.booksData,
    bookIds: this.bookIds
  });

  this.searchbar = new Searchbar(this.booksData);
  this.searchbar.render(this.find('#search-bar-container'));
  this.searchbar.setSelectedBookIds(this.bookIds);

  this.wordListContainer = this.find('.word-list-container');
  this.wordListPlaceholder = this.find('.word-list-placeholder');
  this.wordMapCard = this.find('.word-map-card');

  var count = this.bookIds.length;
  var parentStyle = getComputedStyle(this.find('.word-map-card'));
  var centerX =  parseInt(parentStyle.width) / 2;
  var centerY = parseInt(parentStyle.height) / 2;

  var bookNodes = this.findAll('.node-book');
  bookNodes.forEach(function(element, index) {
    var angle = Math.PI * 2 * index / count;
    element.style.left = centerX + 250 * Math.cos(angle) + 'px';
    element.style.top = centerY + 250 * Math.sin(angle) + 'px';
  });

  for (var i = 0; i < bookNodes.length; i++) {
    for (var j = i + 1; j < bookNodes.length; j++) {
      this.buildMiddleNode(i, j);
    }
  }

  this.listen(this.wordMapCard, 'click', this.onMapClick);

  this.hovercard.initialize();
  this.hovercard.setContent(this.menu);
  this.menu.setHovercard(this.hovercard);
  this.hovercard.setOffset({top: -19, left: -95});

  this.listen(this.menu, Menu.EventType.SELECT, function(event){
    var word = util.dom.getData(event.anchor, 'word');
    window.location.href = '/search?bookIds=' +
        this.selectedBookIds.join(',') +
        '&word=' + word;
  });
};


WordMapPage.prototype.onMapClick = function(event) {
  element = event.target;
  while (!element.classList.contains('node') && element.parentElement) {
    element = element.parentElement;
  }
  if (!element.classList.contains('node')) {
    return;
  }
  this.findAll('.node-selected').forEach(util.fn.removeClass('node-selected'));
  element.classList.add('node-selected');
  setTimeout(util.bind(function() {
    this.selectedBookIds = util.dom.getData(element, 'suffix').split('-');
    var key = 0;
    this.selectedBookIds.forEach(util.bind(function(bookId) {
      key += Math.pow(2, this.bookIds.indexOf(parseInt(bookId)));
    }, this));
    var words = this.uncommonShared[key] || [];

    this.wordListContainer.style.display = 'none';
    this.wordListPlaceholder.style.display = 'block';
    setTimeout(util.bind(function() {
      soy.renderElement(this.wordListContainer, wordmap.templates.wordlist, {
        words: util.array.pluck(words, 0)
      });
      this.wordListPlaceholder.style.display = 'none';
      this.wordListContainer.style.display = 'block';
      this.hovercard.showOnHover(this.findAll('.word-list-item'),
          util.bind(this.updateHover, this));
    }, this), 0);
  }, this), 0);
};


WordMapPage.prototype.buildMiddleNode = function(i, j) {
  var nodeName = 'middle';
  var suffix = this.bookIds[i] + '-' + this.bookIds[j];
  this.wordMapCard.innerHTML += wordmap.templates.node({
    text: '',
    nodeName: nodeName,
    nodeSuffix: suffix
  });

  var nodeA = this.find('.node-book-' + this.bookIds[i]);
  var nodeB = this.find('.node-book-' + this.bookIds[j]);
  var newNode = this.find('.node-' + nodeName + '-' + suffix);

  // var distance = Math.sqrt((nodeA.left)

  newNode.style.left = (parseInt(nodeA.style.left) +
      parseInt(nodeB.style.left)) / 2 + 'px';
  newNode.style.top = (parseInt(nodeA.style.top) +
      parseInt(nodeB.style.top)) / 2 + 'px';

  var angle = Math.atan2(parseInt(nodeA.style.top) - parseInt(nodeB.style.top),
      parseInt(nodeA.style.left) - parseInt(nodeB.style.left));
  newNode.style['-webkit-transform'] = 'rotate(' + angle + 'rad)';
};


WordMapPage.prototype.updateHover = function(anchor) {
  util.array.forEach(this.findAll('.word-list-item-hover'),
      util.fn.removeClass('word-list-item-hover'));
  if (anchor) {
    util.dom.addClass(anchor, 'word-list-item-hover');
  }
};
