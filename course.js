(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['course'] = template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=container.lambda, alias2=container.escapeExpression;

  return "<div class=\"collapsible-wrap course-results no-pad\">\r\n    <input type=\"checkbox\" id=\"collapsible-"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.courseInfo : depth0)) != null ? stack1.Code : stack1), depth0))
    + "\" checked>\r\n    <label for=\"collapsible-"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.courseInfo : depth0)) != null ? stack1.Code : stack1), depth0))
    + "\" class=\"check-collapse\">\r\n        <a href=\""
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.courseInfo : depth0)) != null ? stack1.link : stack1), depth0))
    + "\" class=\"results-course-title\" target=\"_blank\">\r\n            "
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.courseInfo : depth0)) != null ? stack1.Name : stack1), depth0))
    + "\r\n        </a>\r\n        <span class=\"OU\">"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.courseInfo : depth0)) != null ? stack1.Code : stack1), depth0))
    + "</span>\r\n    </label>\r\n    <div id=\"course-results-"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.courseInfo : depth0)) != null ? stack1.Code : stack1), depth0))
    + "\" class=\"collapsible-"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.courseInfo : depth0)) != null ? stack1.Code : stack1), depth0))
    + "-area\">\r\n      <!-- Results for the course go here -->\r\n    </div>\r\n</div>\r\n";
},"useData":true});
})();