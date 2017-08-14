var course = $('#course-template').html();
var courseTemplate = Handlebars.compile(course);
var file = $('#file-template').html();
var fileTemplate = Handlebars.compile(file);
var match = $('#match-template').html();
var matchTemplate = Handlebars.compile(match);
var status = $('#course-status-template').html();
var statusTemplate = Handlebars.compile(status);

var courseStatuses = [];

ouNumbers.forEach((ouNumber) => {
  courseStatuses[ouNumber + '-OU'] = {
    name: ouNumber,
    ou: ouNumber,
    status: 'LOADING'
  };
});

function addStatuses(loadingCourses) {
  loadingCourses.forEach((courseStatusObject) => {
    $('#course-status-container').append(statusTemplate(courseStatusObject));
  });
}

function resetStatus(course) {
  $('#' + course.ou + '-OU').remove();
  $('#course-status-container').append(statusTemplate(course));
}

var context = [
    {
      courseInfo: {
        Name: 'FDENG 301',
        Code: '102934'
      },
      successfulPages: [
        {
            document: 'FileName',
            url: 'www.filelocation.com',
            html: 'striiiingHTML', //(when request is successful)
            matches: [
              {name: 'Match1'},
              {name: 'Match2'},
              {name: 'Match3'}
            ]
            /*error: null //when request is successful
            error : { //when request has an error
                status: request.status,
                statusText: request.statusText,
                responseText: request.responseText,
                responseURL: request.responseURL
            }*/
          }
      ],
      errorPages: []
    },
    {
      courseInfo: {
        Name: 'FDWLD 101',
        Code: '102454'
      },
      successfulPages: [
        {
            document: 'FileName2',
            url: 'www.filelocation.com',
            html: 'striiiingHTML', //(when request is successful)
            matches: [
              {name: 'Match1'},
              {name: 'Match2'},
              {name: 'Match3'}
            ]
            /*error: null //when request is successful
            error : { //when request has an error
                status: request.status,
                statusText: request.statusText,
                responseText: request.responseText,
                responseURL: request.responseURL
            }*/
          }
      ],
      errorPages: []
    }
];

// Grabs all the course objects from Context and loops through them all to display them all
context.forEach((courseObject) => {
  $('#results-container').append(courseTemplate(courseObject));
  courseObject.successfulPages.forEach((file) => {
    $('#course-results-' + courseObject.courseInfo.Code)
    .append(fileTemplate(file));
    file.matches.forEach((match) => {
      $('#file-matches-' + file.document).append(matchTemplate(match));
    });
  });
});
