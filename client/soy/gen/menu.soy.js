// This file was automatically generated from menu.soy.
// Please don't edit this file by hand.

if (typeof menu == 'undefined') { var menu = {}; }
if (typeof menu.templates == 'undefined') { menu.templates = {}; }


menu.templates.main = function(opt_data, opt_ignored) {
  var output = '<div>';
  var optionList84 = opt_data.options;
  var optionListLen84 = optionList84.length;
  for (var optionIndex84 = 0; optionIndex84 < optionListLen84; optionIndex84++) {
    var optionData84 = optionList84[optionIndex84];
    output += '<div class="menu-item" data-index="' + soy.$$escapeHtml(optionIndex84) + '">' + soy.$$escapeHtml(opt_data.options[0].text) + '</div>';
  }
  output += '</div>';
  return output;
};
