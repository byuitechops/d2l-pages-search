(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['cssMatchWithAce'] = template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    return "<div class=\"result\">\r\n    <div id=\"editor\">"
    + container.escapeExpression(container.lambda(depth0, depth0))
    + "</div>\r\n</div>";
},"useData":true});
})();