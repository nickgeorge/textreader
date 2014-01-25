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
    output += '<div class="menu-item" data-index="' + soy.$$escapeHtml(optionIndex68) + '">' + soy.$$escapeHtml(opt_data.options[0].text) + '</div>';
  }
  output += '</div>';
  return output;
};
