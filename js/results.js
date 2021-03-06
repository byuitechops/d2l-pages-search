(function () {
  var template = Handlebars.template,
    templates = Handlebars.templates = Handlebars.templates || {};
  templates['results'] = template({
    "1": function (container, depth0, helpers, partials, data) {
      var stack1, helper, alias1 = depth0 != null ? depth0 : (container.nullContext || {}),
        alias2 = helpers.helperMissing,
        alias3 = "function",
        alias4 = container.escapeExpression;

      return "<div class=\"collapsible-wrap no-pad " +
        ((stack1 = helpers["if"].call(alias1, ((stack1 = (depth0 != null ? depth0.pages : depth0)) != null ? stack1.length : stack1), {
          "name": "if",
          "hash": {},
          "fn": container.program(2, data, 0),
          "inverse": container.program(4, data, 0),
          "data": data
        })) != null ? stack1 : "") +
        "\">\r\n  <input type=\"checkbox\" id=\"collapsible-" +
        alias4(((helper = (helper = helpers.ouNumber || (depth0 != null ? depth0.ouNumber : depth0)) != null ? helper : alias2), (typeof helper === alias3 ? helper.call(alias1, {
          "name": "ouNumber",
          "hash": {},
          "data": data
        }) : helper))) +
        "\" checked>\r\n  <label for=\"collapsible-" +
        alias4(((helper = (helper = helpers.ouNumber || (depth0 != null ? depth0.ouNumber : depth0)) != null ? helper : alias2), (typeof helper === alias3 ? helper.call(alias1, {
          "name": "ouNumber",
          "hash": {},
          "data": data
        }) : helper))) +
        "\" class=\"check-collapse\">\r\n    <a href=\"/d2l/home/" +
        alias4(((helper = (helper = helpers.ouNumber || (depth0 != null ? depth0.ouNumber : depth0)) != null ? helper : alias2), (typeof helper === alias3 ? helper.call(alias1, {
          "name": "ouNumber",
          "hash": {},
          "data": data
        }) : helper))) +
        "\" class=\"results-course-title\" target=\"_blank\">" +
        alias4(((helper = (helper = helpers.courseName || (depth0 != null ? depth0.courseName : depth0)) != null ? helper : alias2), (typeof helper === alias3 ? helper.call(alias1, {
          "name": "courseName",
          "hash": {},
          "data": data
        }) : helper))) +
        " (Pages: " +
        alias4(container.lambda(((stack1 = (depth0 != null ? depth0.pages : depth0)) != null ? stack1.length : stack1), depth0)) +
        "/" +
        alias4(((helper = (helper = helpers.totalPages || (depth0 != null ? depth0.totalPages : depth0)) != null ? helper : alias2), (typeof helper === alias3 ? helper.call(alias1, {
          "name": "totalPages",
          "hash": {},
          "data": data
        }) : helper))) +
        ")</a>\r\n  </label>\r\n  <div class=\"collapsible-area\">\r\n    <!-- Results for the course go here -->\r\n" +
        ((stack1 = helpers.each.call(alias1, (depth0 != null ? depth0.pages : depth0), {
          "name": "each",
          "hash": {},
          "fn": container.program(6, data, 0),
          "inverse": container.program(9, data, 0),
          "data": data
        })) != null ? stack1 : "") +
        "  </div>\r\n</div>\r\n";
    },
    "2": function (container, depth0, helpers, partials, data) {
      return "";
    },
    "4": function (container, depth0, helpers, partials, data) {
      return "hidden";
    },
    "6": function (container, depth0, helpers, partials, data) {
      var stack1, helper, alias1 = depth0 != null ? depth0 : (container.nullContext || {}),
        alias2 = helpers.helperMissing,
        alias3 = "function",
        alias4 = container.escapeExpression;

      return "    <div class=\"card result-card\">\r\n      <!-- File Information added here -->\r\n      <div class=\"flex display-header\">\r\n        <span class=\"results-file-name\" title=\"" +
        alias4(((helper = (helper = helpers.pageUrl || (depth0 != null ? depth0.pageUrl : depth0)) != null ? helper : alias2), (typeof helper === alias3 ? helper.call(alias1, {
          "name": "pageUrl",
          "hash": {},
          "data": data
        }) : helper))) +
        "\">" +
        alias4(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias2), (typeof helper === alias3 ? helper.call(alias1, {
          "name": "name",
          "hash": {},
          "data": data
        }) : helper))) +
        " (results: " +
        alias4(container.lambda(((stack1 = (depth0 != null ? depth0.matches : depth0)) != null ? stack1.length : stack1), depth0)) +
        ")</span>\r\n        <a href=\"" +
        alias4(((helper = (helper = helpers.pageUrl || (depth0 != null ? depth0.pageUrl : depth0)) != null ? helper : alias2), (typeof helper === alias3 ? helper.call(alias1, {
          "name": "pageUrl",
          "hash": {},
          "data": data
        }) : helper))) +
        "\" target=\"_blank\">View File</a>\r\n      </div>\r\n      <!-- Matches within the file go here -->\r\n" +
        ((stack1 = helpers.each.call(alias1, (depth0 != null ? depth0.matches : depth0), {
          "name": "each",
          "hash": {},
          "fn": container.program(7, data, 0),
          "inverse": container.noop,
          "data": data
        })) != null ? stack1 : "") +
        "    </div>\r\n";
    },
    "7": function (container, depth0, helpers, partials, data) {
      var stack1, helper;

      return "      <div class=\"tile result\">\r\n        <span>" +
        ((stack1 = ((helper = (helper = helpers.display || (depth0 != null ? depth0.display : depth0)) != null ? helper : helpers.helperMissing), (typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}), {
          "name": "display",
          "hash": {},
          "data": data
        }) : helper))) != null ? stack1 : "") +
        "</span>\r\n      </div>\r\n";
    },
    "9": function (container, depth0, helpers, partials, data) {
      return "    <div class=\"no-results-container color--blue\">\r\n      There are no results for this course\r\n    </div>\r\n";
    },
    "compiler": [7, ">= 4.0.0"],
    "main": function (container, depth0, helpers, partials, data) {
      var stack1;

      return ((stack1 = helpers.each.call(depth0 != null ? depth0 : (container.nullContext || {}), depth0, {
        "name": "each",
        "hash": {},
        "fn": container.program(1, data, 0),
        "inverse": container.noop,
        "data": data
      })) != null ? stack1 : "");
    },
    "useData": true
  });
})();
