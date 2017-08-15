(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['file'] = template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "<div class=\"card result-card\">\r\n  <!-- File Information added here -->\r\n  <div class=\"flex file-header\">\r\n    <span class=\"results-file-name\" title=\""
    + alias4(((helper = (helper = helpers.pageUrl || (depth0 != null ? depth0.pageUrl : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"pageUrl","hash":{},"data":data}) : helper)))
    + "\">\r\n      "
    + alias4(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"name","hash":{},"data":data}) : helper)))
    + "\r\n    </span>\r\n    <span class=\"spacer\"></span>\r\n    <a href=\""
    + alias4(((helper = (helper = helpers.pageUrl || (depth0 != null ? depth0.pageUrl : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"pageUrl","hash":{},"data":data}) : helper)))
    + "\" target=\"_blank\">View File</a>\r\n  </div>\r\n  <div id=\"file-matches-"
    + alias4(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"id","hash":{},"data":data}) : helper)))
    + "\">\r\n    <!-- Matches within the file go here -->\r\n  </div>\r\n</div>\r\n";
},"useData":true});
})();