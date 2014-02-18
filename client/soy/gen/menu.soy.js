// This file was automatically generated from menu.soy.
// Please don't edit this file by hand.

if (typeof menu == 'undefined') { var menu = {}; }
if (typeof menu.templates == 'undefined') { menu.templates = {}; }


menu.templates.main = function(opt_data, opt_ignored) {
  var output = '<div>';
  var optionList82 = opt_data.options;
  var optionListLen82 = optionList82.length;
  for (var optionIndex82 = 0; optionIndex82 < optionListLen82; optionIndex82++) {
    var optionData82 = optionList82[optionIndex82];
    output += '<div class="menu-item menu-item-' + soy.$$escapeHtml(optionIndex82) + '" data-index="' + soy.$$escapeHtml(optionIndex82) + '">';
    var charList88 = optionData82.text;
    var charListLen88 = charList88.length;
    for (var charIndex88 = 0; charIndex88 < charListLen88; charIndex88++) {
      var charData88 = charList88[charIndex88];
      output += (optionData82.indices && optionData82.indices[charIndex88]) ? '<span class="highlight-char">' + soy.$$escapeHtml(charData88) + '</span>' : soy.$$escapeHtml(charData88);
    }
    output += '</div>';
  }
  output += '</div>';
  return output;
};
