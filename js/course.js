(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['course'] = template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "<div class=\"collapsible-wrap course-results no-pad\">\r\n    <input type=\"checkbox\" id=\"collapsible-"
    + alias4(((helper = (helper = helpers.ouNumber || (depth0 != null ? depth0.ouNumber : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"ouNumber","hash":{},"data":data}) : helper)))
    + "\" checked>\r\n    <label for=\"collapsible-"
    + alias4(((helper = (helper = helpers.ouNumber || (depth0 != null ? depth0.ouNumber : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"ouNumber","hash":{},"data":data}) : helper)))
    + "\" class=\"check-collapse\">\r\n        <a href=\"/d2l/home/"
    + alias4(((helper = (helper = helpers.ouNumber || (depth0 != null ? depth0.ouNumber : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"ouNumber","hash":{},"data":data}) : helper)))
    + "\" class=\"results-course-title\" target=\"_blank\">\r\n            "
    + alias4(((helper = (helper = helpers.courseName || (depth0 != null ? depth0.courseName : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"courseName","hash":{},"data":data}) : helper)))
    + "\r\n        </a>\r\n        <span class=\"OU\">"
    + alias4(container.lambda(((stack1 = (depth0 != null ? depth0.pages : depth0)) != null ? stack1.length : stack1), depth0))
    + "</span>\r\n        <span class=\"count\">"
    + alias4(((helper = (helper = helpers.ouNumber || (depth0 != null ? depth0.ouNumber : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"ouNumber","hash":{},"data":data}) : helper)))
    + "</span>\r\n    </label>\r\n    <div id=\"course-results-"
    + alias4(((helper = (helper = helpers.ouNumber || (depth0 != null ? depth0.ouNumber : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"ouNumber","hash":{},"data":data}) : helper)))
    + "\" class=\"collapsible-"
    + alias4(((helper = (helper = helpers.ouNumber || (depth0 != null ? depth0.ouNumber : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"ouNumber","hash":{},"data":data}) : helper)))
    + "-area\">\r\n        <!-- Results for the course go here -->\r\n    </div>\r\n</div>\r\n";
},"useData":true});
})();