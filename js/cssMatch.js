(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['cssMatch'] = template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    return "<div class=\"result\">\r\n    <span>\r\n        "
    + container.escapeExpression(container.lambda(depth0, depth0))
    + "\r\n    </span>\r\n</div>\r\n";
},"useData":true});
})();