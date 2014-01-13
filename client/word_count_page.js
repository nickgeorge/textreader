WordCountPage = function(data) {
  this.contentElement = null;
  this.wordCounts = data.wordCounts;
  this.maxWordCount = this.wordCounts[0][1];  //max words
};

WordCountPage.prototype.render = function(element) {
  this.contentElement = element;

  this.contentElement.innerHTML = wordcountpage.main({
    wordCounts: this.wordCounts,
    maxWordCount: this.maxWordCount
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
};

WordCountPage.prototype.renderBar_ = function(index, elm) {
  elm.style.width = Math.max(1,
      710 * (this.wordCounts[index][1] / this.maxWordCount));
};
