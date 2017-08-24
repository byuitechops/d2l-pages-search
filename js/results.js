(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['results'] = template({"1":function(container,depth0,helpers,partials,data) {
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
    + "-area\">\r\n        <!-- Results for the course go here -->\r\n"
    + ((stack1 = helpers.each.call(alias1,(depth0 != null ? depth0.pages : depth0),{"name":"each","hash":{},"fn":container.program(2, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "    </div>\r\n</div>\r\n";
},"2":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "        <div class=\"card result-card\">\r\n            <!-- File Information added here -->\r\n            <div class=\"flex file-header\">\r\n                <span class=\"results-file-name\" title=\""
    + alias4(((helper = (helper = helpers.pageUrl || (depth0 != null ? depth0.pageUrl : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"pageUrl","hash":{},"data":data}) : helper)))
    + "\">"
    + alias4(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"name","hash":{},"data":data}) : helper)))
    + "</span>\r\n                <span class=\"spacer\"></span>\r\n                <a href=\""
    + alias4(((helper = (helper = helpers.pageUrl || (depth0 != null ? depth0.pageUrl : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"pageUrl","hash":{},"data":data}) : helper)))
    + "\" target=\"_blank\">View File</a>\r\n            </div>\r\n            <div id=\""
    + alias4(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"id","hash":{},"data":data}) : helper)))
    + "\">\r\n                <!-- Matches within the file go here -->\r\n                "
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.isSelector : depth0),{"name":"if","hash":{},"fn":container.program(3, data, 0),"inverse":container.program(3, data, 0),"data":data})) != null ? stack1 : "")
    + "\r\n            </div>\r\n        </div>\r\n";
},"3":function(container,depth0,helpers,partials,data) {
    var stack1;

  return " "
    + ((stack1 = helpers.each.call(depth0 != null ? depth0 : (container.nullContext || {}),(depth0 != null ? depth0.displayMatches : depth0),{"name":"each","hash":{},"fn":container.program(4, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + " ";
},"4":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "\r\n                <div class=\"result\">\r\n                    <span>\r\n                        "
    + ((stack1 = container.lambda(depth0, depth0)) != null ? stack1 : "")
    + "\r\n                    </span>\r\n                </div>\r\n                ";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers.each.call(depth0 != null ? depth0 : (container.nullContext || {}),depth0,{"name":"each","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "");
},"useData":true});
})();