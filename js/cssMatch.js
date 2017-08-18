(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['cssMatch'] = template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper;

  return "<div class=\"result\">\r\n    <div id=\"editor\">\r\n<!--        <span>-->\r\n    "
    + container.escapeExpression(((helper = (helper = helpers.fullHtml || (depth0 != null ? depth0.fullHtml : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"fullHtml","hash":{},"data":data}) : helper)))
    + "\r\n    <!-- A span with 50 chars left and right of match goes here -->\r\n    <!-- User class \"highlight\" on matched text -->\r\n<!--  </span>-->\r\n    </div>\r\n    <script>\r\n        var editor = ace.edit(\"editor\");\r\n        editor.setTheme(\"ace/theme/twilight\");\r\n        editor.getSession().setMode(\"ace/mode/javascript\");\r\n\r\n    </script>\r\n</div>\r\n";
},"useData":true});
})();