// This file was automatically generated from common.soy.
// Please don't edit this file by hand.

if (typeof common == 'undefined') { var common = {}; }
if (typeof common.templates == 'undefined') { common.templates = {}; }


common.templates.titleboard = function(opt_data, opt_ignored) {
  return '<div class="titleboard"><div class="titleboard-text">' + soy.$$filterNoAutoescape(opt_data.contents) + '</div></div>';
};
