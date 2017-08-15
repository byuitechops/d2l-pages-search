(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['textMatch'] = template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "<div class=\"result\">\r\n<span>"
    + alias4(((helper = (helper = helpers.firstFifty || (depth0 != null ? depth0.firstFifty : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"firstFifty","hash":{},"data":data}) : helper)))
    + "<span class=\"highlight\">"
    + ((stack1 = ((helper = (helper = helpers.queryMatch || (depth0 != null ? depth0.queryMatch : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"queryMatch","hash":{},"data":data}) : helper))) != null ? stack1 : "")
    + "</span>"
    + alias4(((helper = (helper = helpers.secondFifty || (depth0 != null ? depth0.secondFifty : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"secondFifty","hash":{},"data":data}) : helper)))
    + "</span>\r\n</div>\r\n";
},"useData":true});
})();