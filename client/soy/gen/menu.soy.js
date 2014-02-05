// This file was automatically generated from menu.soy.
// Please don't edit this file by hand.

if (typeof menu == 'undefined') { var menu = {}; }
if (typeof menu.templates == 'undefined') { menu.templates = {}; }


menu.templates.main = function(opt_data, opt_ignored) {
  var output = '<div>';
  var optionList68 = opt_data.options;
  var optionListLen68 = optionList68.length;
  for (var optionIndex68 = 0; optionIndex68 < optionListLen68; optionIndex68++) {
    var optionData68 = optionList68[optionIndex68];
    output += '<div class="menu-item menu-item-' + soy.$$escapeHtml(optionIndex68) + '" data-index="' + soy.$$escapeHtml(optionIndex68) + '">';
    var charList74 = optionData68.text;
    var charListLen74 = charList74.length;
    for (var charIndex74 = 0; charIndex74 < charListLen74; charIndex74++) {
      var charData74 = charList74[charIndex74];
      output += (optionData68.indices && optionData68.indices[charIndex74]) ? '<span class="highlight-char">' + soy.$$escapeHtml(charData74) + '</span>' : soy.$$escapeHtml(charData74);
    }
    output += '</div>';
  }
  output += '</div>';
  return output;
};
