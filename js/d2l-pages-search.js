// Declare Handlebars templates
/*var course = $('#course-template').html();
var courseTemplate = Handlebars.compile(course);
var file = $('#file-template').html();
var fileTemplate = Handlebars.compile(file);
var match = $('#match-template').html();
var matchTemplate = Handlebars.compile(match);
var status = $('#course-status-template').html();
var statusTemplate = Handlebars.compile(status);*/

/**
 * Main will handle all user input from the DOM.
 */
function main() {
    var courses = [];
    var searchSettings;

    // jQuery elements
    var loadCoursesButton = $('#load-button'),
        searchCoursesButton = $('#search-button'),
        searchInputElement = $('.search-input'),
        searchSettingText = $('#searchSettingText'),
        searchSettingHTML = $('#searchSettingHTML'),
        searchSettingCSS = $('#searchSettingCSS'),
        searchSettingRegex = $('#searchSettingRegex'),
        downloadButton = $('#download-button')

    // Main event listeners
    loadCoursesButton.on('click', function () {
        // Get the ouNumbers
        var tempOuNumbers = getOuNumbers();

        // For each of the ouNumbers, see if they're on the list of downloaded courses already.
        tempOuNumbers.forEach(function (ouNumber) {
            var isCourseOnList = courses.some(function (course) {
                return ouNumber === course.ou;
            });

            // If not on the list, make a new object with which to put our downloaded course.
            if (!isCourseOnList) {
                courses.push({
                    courseName: String(ouNumber),
                    ouNumber: ouNumber,
                    isDownloaded: false
                });
            }
        });

        // Download the ouNumbers
        downloadCourses(courses, function (error) {
            if (error) {
                console.error('There was an error in downloading the courses: ' + error);
            }
        });
    });

    searchCoursesButton.on('click', function () {
        // Get the searchSettings from the user
        searchSettings = {
            query: searchInputElement.val(),
            searchInnerText: searchSettingText.is(':checked'),
            searchHTML: searchSettingHTML.is(':checked'),
            isSelector: searchSettingCSS.is(':checked'),
            isRegex: searchSettingRegex.is(':checked')
        }

        console.log('searchSettings: ' + JSON.stringify(searchSettings));
        // Search the courses
        var results = searchCourses(courses, searchSettings);

        // Display the results
        console.log(results);
        displayResults(results, searchSettings);
    });

    // End program
    return;
}

function getOuNumbers() {
    return $('#textarea').val().split(', ');
}

/**
 * This function downloads all the courses the user specifies.  It keeps track of the status of the
 * download of each course
 *
 * @param {Array}    ouNumbers The ouNumbers to be downloaded
 * @param {function} callback  A function to send the downloaded courses back to the caller
 */
function downloadCourses(courses, callback) {
    /**
     * Downloads a single course and updates its model status.
     *
     * @param {number}   course A course to download
     * @param {function} callback The callback that compiles the data into the result async array
     */
    function downloadCourse(course, downloadCourseCallback) {
        // Update the view
        renderStatus(courses);

        if (!course.isDownloaded) {
            // Download a single course
            d2lScrape.getCourseHtmlPages(course.ouNumber, function (error, data) {
                if (error) {
                    course.status = 'ERROR';
                    downloadCourseCallback();
                    return;
                }

                // Update the model data to reflect the course has downloaded
                course.isDownloaded = true;
                course.status = 'COMPLETE'
                course.courseName = data.courseInfo.Name;
                course.courseUrl = data.courseInfo.Path;
                course.pages = data.successfulPages;
            });
        }

        // Go on to the next course
        downloadCourseCallback();
        return;
    }

    // Download all the course html pages for each of the courses
    async.eachSeries(courses, downloadCourse, function (error) {
        // We will never call this error statement, because we'll handle it another way
        if (error) {
            callback(error);
            return;
        }

        // Render the status that we've downloaded all the courses
        renderStatus(courses);

        // Tell the program to keep on going
        callback();
        return;
    });

}

/**
 * This function changes the view according to the model data it is given.
 * Specifically, this function reports the change in status of downloading courses.
 *
 * @param {object}  courses An object with the data to be displayed
 */
function renderStatus(courses) {
    $('#course-status-container').html(Handlebars.templates.status(courses));
}

/*****************************************/
/**
 * This function will search through all of the downloaded courses and return the results of
 * the search.
 *
 * @param {Array}  courses Courses to search
 * @param {object} searchSettings    Settings with which to conduct the search
 */
function searchCourses(courses, searchSettings) {
    // This variable holds the function that we will use to search
    var makeMatches;
    $('.course-results').remove();

    function searchText(searchString, regEx) {
        // Taken from MDN: `https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/exec#Finding_successive_matches`
        var myArray;
        var matchedWord;
        var endOfWordIndex;
        var outputArray = [];

        function getFirstFifty(string) {
            return string.substring(string.substring(0, myArray.index - 50).lastIndexOf(' ') + 1, myArray.index);
        }

        function getLastFifty(string) {
            return string.substring(string.substring(myArray.length, endOfWordIndex + 50).lastIndexOf(' ') + 1, endOfWordIndex + 50);
        }

        // Because this loop is an infinite loop if it is given no global flag, we differentiate which code will run
        if (regEx.global) {
            while ((myArray = regEx.exec(searchString)) !== null) {
                matchedWord = myArray[0];
                endOfWordIndex = myArray.index + myArray[0].length;

                // Construct the 50 left and right string
                match = {
                    firstFifty: (myArray.index - 50 > 0 ? '...' : '') + getFirstFifty(myArray.input),
                    queryMatch: matchedWord,
                    //secondFifty: myArray.input.substring(endOfWordIndex, endOfWordIndex + 50).replace(/\n+/g, '') + (myArray.index + 50 < myArray.input.length - 1 ? '...' : '')
                    secondFifty: getLastFifty(myArray.input) + (myArray.index + 50 < myArray.input.length - 1 ? '...' : '')
                }

                outputArray.push(match);
            }
        } else {
            myArray = regEx.exec(searchString);
            if (myArray) {
                matchedWord = myArray[0];
                endOfWordIndex = myArray.index + myArray[0].length;

                // Construct the 50 left and right string
                match = {
                    firstFifty: (myArray.index - 50 > 0 ? '...' : '') + getFirstFifty(myArray.input),
                    queryMatch: matchedWord,
                    secondFifty: myArray.input.substring(endOfWordIndex, endOfWordIndex + 50).replace(/\n+/g, '') + (myArray.index + 50 < myArray.input.length - 1 ? '...' : '')
                }

                outputArray.push(match);
            }
        }

        return outputArray;
    }

    function makeMatchesSelector(page, searchSettings) {
        // Put the open/close tags in
        return Array.from(page.document.querySelectorAll(searchSettings.query)).map(function (foundElement) {
            return {
                fullHtml: foundElement.outerHTML,
                innerText: foundElement.innerText,
                openCloseTags: foundElement.outerHTML.replace(foundElement.innerHTML, '')
            }
        });
    }

    function makeMatchesText(page, searchSettings) {
        return searchText(page.document.body.innerText, searchSettings.query);
    }

    function makeMatchesHtml(page, searchSettings) {
        return searchText(page.html, searchSettings.query);
    }

    function makeRegexFromQuery(searchSettings) {
        if (searchSettings.isRegex) {
            // Taken from `course-search` gitHub repo
            // Check to make sure searchString is in regular expression form
            var pattern;
            var flags;

            if (/^\/.+(\/[gimy]*)$/.test(searchSettings.query)) {
                pattern = searchSettings.query.slice(1, searchSettings.query.lastIndexOf('/'));
                flags = searchSettings.query.slice(searchSettings.query.lastIndexOf('/') + 1);
            } else {
                window.alert("Regular expression pattern must be wrapped with '/' and must only be followed by valid flags.");
                return;
            }
            try {
                // Create Regular Expression Object
                searchSettings.query = new RegExp(pattern, flags);
            } catch (ex) {
                window.alert(ex.message);
                return;
            }
        } else {
            searchSettings.query = new RegExp(searchSettings.query, 'g');
        }
    }

    // Decide what our make function will be
    if (searchSettings.isSelector) {
        makeMatches = makeMatchesSelector;
    } else if (searchSettings.searchInnerText) {
        makeMatches = makeMatchesText;
    } else {
        makeMatches = makeMatchesHtml;
    }

    // We need to change it to regEx no matter what
    if (!searchSettings.isSelector) {
        makeRegexFromQuery(searchSettings);
    }

    return courses.map(function (course) {
        return {
            courseName: course.courseInfo.Name,
            courseUrl: course.courseInfo.Path,
            ouNumber: course.courseInfo.Identifier,
            pages: course.successfulPages.map(function (page) {
                    return {
                        pageUrl: page.url,
                        matches: makeMatches(page, searchSettings)
                    }
                })
                // We're only going to keep the pages that have returned data
                .filter(function (page) {
                    return page.matches.length > 0;
                })
        }
    })
}


/**
 * Display results will display the results through the DOM.
 * @param {Array}  results         An array of the results from the search
 * @param {object} 
 */

function displayResults(results, searchSettings) {

    function renderResults(courseObject) {
        console.log('RESULT', courseObject);
        if (courseObject.pages.length > 0) {
            $('#results-container').append(Handlebars.templates.course(courseObject));
            courseObject.pages.forEach((file, index) => {
                file.name = decodeURI(file.pageUrl.split('/')[file.pageUrl.split('/').length - 1]);
                file.id = 'file-' + courseObject.ouNumber + '-' + index;
                $('#course-results-' + courseObject.ouNumber).append(Handlebars.templates.file(file));
                file.matches.forEach((match) => {
                    if (!searchSettings.isSelector) {
                        $('#' + file.id).append(Handlebars.templates.textMatch(match));
                    } else {
                        $('#' + file.id).append(Handlebars.templates.cssMatch(match));
                    }
                });
            });
        }
    }

    results.forEach(function (result) {
        renderResults(result);
        /*result.matches.forEach(function(match) {
          var matchedIndex = match.indexOf(searchSettings.query);
          var chalkedWord = chalk.blue(match.substr(matchedIndex, searchSettings.query.length));
          console.log(match.substring(0, matchedIndex) + chalkedWord + match.substring(matchedIndex + searchSettings.query.length));
        })*/
    })
}

/**
 * Download a CSV of the results in the format specified by the user.
 * @param {Array} results An array of results from the search, in a format that the user wants
 */
function downloadCSV(results) {

}

main();
