var source = $('#course-result').html();
var template = Handlebars.compile(source);

var context = [{
    course: {
      name: 'FDENG 301',
      OU: '104763',
      link: 'https://www.google.com',
      file: {
        name: 'Lonely Mountain.html',
        link: 'https://www.google.com'
      }
    }
  },
  {
    course: {
      name: 'CS 126',
      OU: '123456',
      link: 'https://www.google.com',
      file: {
        name: 'Lonely Bantha.html',
        link: 'https://www.google.com'
      }
    }
  }
];

//var html = template(context);
//$('#results-container').append(html);
console.log(context.length);
context.forEach((courseObject) => {
  $('#results-container').append(template(courseObject));
});
