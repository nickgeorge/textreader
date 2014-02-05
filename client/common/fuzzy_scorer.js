/**
 * @param {Array.<FuzzyScorer.option>} options
 */
FuzzyScorer = function(options) {
  this.options = options;
  // this.options = [options[2]];
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


FuzzyScorer.prototype.match = function(searchString, opt_caseSensitive) {
  if (!opt_caseSensitive) {
    searchString = searchString.toLowerCase();
  }
  var matches = this.options.map(function(option) {
    var response = this.scoreOption(searchString, option.text.toLowerCase());
    return {
      option: option,
      score: response.score,
      indices: response.indices
    };
  }, this);

  matches = matches.filter(function(match) {
    return match.score > 0;
  });
  matches.sort(function(a, b) {
    return b.score - a.score;
  });
  return matches;
};

/**
 * @typedef {
 *   score: number,
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

/**
 * @typedef {
 *   score: number,
 *   indices: Array.<number>
 * }
 */
FuzzyScorer.Response_;

FuzzyScorer.INVALID_ = -1;

FuzzyScorer.prototype.scoreOption = function(searchString, option, opt_state) {
  var state = opt_state || FuzzyScorer.INITIAL_STATE_;

  if (state.searchIndex == searchString.length) {
    return {
      score: 0,
      indices: new Array(searchString.length)
    };
  }

  var letterToMatch = searchString[state.searchIndex];
  var bestResponse = {
    score: FuzzyScorer.INVALID_,
    indices: []
  };
  for (var i = state.optionIndex; i < option.length; i++) {
    if (option[i] == letterToMatch) {
      var newState = util.object.shallowClone(state);
      if (i > 0 && i == state.optionIndex) {
        newState.consecutive++;
      } else {
        newState.consecutive = 0;
      }
      var scoreFromThisStep = Math.pow(2, newState.consecutive)
      newState.searchIndex++;
      newState.optionIndex = i + 1;
      var response = this.scoreOption(searchString, option, newState);
      if (response.score == FuzzyScorer.INVALID_) continue;
      response.score += scoreFromThisStep;
      response.indices[i] = true;
      if (response.score  > bestResponse.score) {
        bestResponse = response;
      }
    }
  }
  return bestResponse;
};
