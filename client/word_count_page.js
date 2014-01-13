WordCountPage = function(data) {
  this.contentElement = null;
  this.wordCounts = data.wordCounts;
  this.maxWordCount = this.wordCounts[0][1];
  this.books = data.books;
  this.bookId = data.bookId;
};

WordCountPage.prototype.render = function(element) {
  this.contentElement = element;

  this.contentElement.innerHTML = wordcountpage.templates.main({
    wordCounts: this.wordCounts,
    book: this.books[this.bookId]
  });

  $(this.contentElement).find('.word-count-bar').each(
      Util.bind(this.renderBar_, this));

  new Hovercard().setContent(
      new Menu([
        {
          text: 'Mark As Common',
          action: function(){},
        },
        {
          text: 'Mark As Pronoun',
          action: function(){}
        }
      ])).showOnClick($(this.contentElement).find('.word-count-word'));

  // $(window).scroll(Util.bind(function(event){
  //   console.log(event);
  // }, this));
};

WordCountPage.prototype.renderBar_ = function(index, elm) {
  elm.style.width = Math.max(1,
      710 * (this.wordCounts[index][1] / this.maxWordCount));
};

WordCountPage.prototype.getCounts = function(startIndex, endIndex) {
  $.ajax({
    url: '/getwordcounts.cgi',
    data: {
      startIndex: startIndex,
      endIndex: endIndex,
      bookId: this.bookId
    },
    success: Util.bind(this.onGetCountsSuccess, this, startIndex, endIndex),
    error: function(){console.log(arguments)}
  });
};

WordCountPage.prototype.onGetCountsSuccess = function(
    startIndex, endIndex, countsData) {
  console.log(arguments);
};
