/**
 * @param {Array.<FuzzyScorer.option>} options
 */
FuzzyScorer = function(options) {
  this.options = options;
};


/**
 * @typedef {
 *   value: *,
 *   text: string
 * }
 */
FuzzyScorer.option;


/**
 * @typedef {
 *   option: FuzzyScorer.option,
 *   score: number,
 *   indices: Array.<number>
 * }
 */
FuzzyScorer.match;


/**
 * @typedef {
 *   searchIndex: number,
 *   optionIndex: number,
 *   consecutive: number
 * }
 */
FuzzyScorer.State_;


FuzzyScorer.INITIAL_STATE_ = {
  searchIndex: 0,
  optionIndex: 0,
  consecutive: 0
};


FuzzyScorer.INVALID_ = -1;


FuzzyScorer.prototype.match = function(searchString) {
  var matches = this.options.map(function(option) {
    return this.scoreOption(searchString.toLowerCase(), option,
        FuzzyScorer.INITIAL_STATE_);
  }, this);

  matches = matches.filter(function(match) {
    return match.score !=  FuzzyScorer.INVALID_;
  });
  matches.sort(function(a, b) {
    return b.score - a.score;
  });
  return matches;
};


FuzzyScorer.prototype.scoreOption = function(searchString, option, state) {
  if (state.searchIndex == searchString.length) {
    return {
      option: option,
      score: 0,
      indices: new Array(searchString.length)
    };
  }

  var letterToMatch = searchString[state.searchIndex];
  var bestResponse = {
    score: FuzzyScorer.INVALID_
  };
  for (var i = state.optionIndex; i < option.text.length; i++) {
    if (option.text[i].toLowerCase() == letterToMatch) {
      var consecutive = 0;
      if (i > 0 && i == state.optionIndex) {
        consecutive = state.consecutive + 1;
      }
      var newState = {
        searchIndex: state.searchIndex + 1,
        optionIndex: i + 1,
        consecutive: consecutive
      };
      var response = this.scoreOption(searchString, option, newState);
      if (response.score == FuzzyScorer.INVALID_) continue;
      response.score += Math.pow(2, consecutive);
      response.indices[i] = true;
      if (response.score  > bestResponse.score) {
        bestResponse = response;
      }
    }
  }
  return bestResponse;
};
