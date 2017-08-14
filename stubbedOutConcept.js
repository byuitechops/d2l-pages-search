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
    var ouNumbers;
    var downloadedCourses;
    var searchSettings;

    // jQuery elements
    var loadCoursesButton = $('#load-button'),
        searchCoursesButton = $('#search-button'),
        searchInputElement = $('#searchInput'),
        searchSettingText = $('#searchSettingText'),
        searchSettingHTML = $('#searchSettingHTML'),
        searchSettingCSS = $('#searchSettingCSS'),
        searchSettingRegex = $('#searchSettingRegex'),
        downloadButton = $('#download-button')

    loadCoursesButton.on('click', function () {
        // Get the ouNumbers
        ouNumbers = getOuNumbers();

        // Download the ouNumbers
        downloadCourses(ouNumbers, function (error, data) {
            if (error) {
                console.error('There was an error in downloading the courses: ' + error);
            }

            downloadedCourses = data;

            console.log(downloadedCourses);

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
                var results = searchCourses(downloadedCourses, searchSettings);

                // Display the results
                console.log(results);
                //displayResults(results, searchSettings);
            });
        });
    });



    /* Add all the eventListeners we need */
    /*loadCoursesButton.addEventListener('click', function () {
        //get the ou numbers
        ouNumbers = getOuNumbers();

        //Download the ouNumbers
        downloadedCourses = downloadCourses(ouNumbers);
    });*/

    return;
}

function getOuNumbers() {
    return $('#textarea').val().split(', ');
}

/**
 * Download courses will use Joshua McKinney's library to download all the course HTML files.
 * @param   {Array} ouNumbers The list of ouNumbers to download
 * @returns {Array} Array of the downloaded course data objects
 */
function downloadCourses(ouNumbers, callback) {
    // Generate the courseStatus Objects
    var courseStatuses = [];
    ouNumbers.forEach((ouNumber) => {
        courseStatuses[ouNumber + '-OU'] = {
            name: ouNumber,
            ou: ouNumber,
            status: 'LOADING'
        };
    });
    console.log(courseStatuses);

    function downloadCourse(ouNumber, callback) {
        renderStatus(courseStatuses[ouNumber + '-OU'], true);
        // Download a single course
        d2lScrape.getCourseHtmlPages(ouNumber, function (error, data) {
            if (error) {
                renderStatus(data.courseInfo.Identifier, data.courseInfo.Name, 'ERROR');
                callback(error);
                return;
            }

            // Render the status that we've downloaded
            courseStatuses[ouNumber + '-OU'] = {
                name: data.courseInfo.Name,
                ou: ouNumber,
                status: 'COMPLETE'
            }
            renderStatus(courseStatuses[ouNumber + '-OU'], false);

            // Compile the data with async
            callback(null, data);
        })
    }

    // Render all the status objects that we're about to load
    courseStatuses.forEach(function (statusObject) {
        renderStatus(statusObject, true);
    });

    // Download all the course html pages for each of the ouNumbers
    async.map(ouNumbers, downloadCourse, function (error, results) {
        if (error) {
            callback(error);
        }

        callback(null, results);
    });

}

function renderStatus(statusObject, addCourses) {


    if (addCourses) {
        $('#course-status-container').append(Handlebars.templates.status(statusObject));
    } else {
        $('#' + statusObject.ou + '-OU').remove();
        $('#course-status-container').append(Handlebars.templates.status(statusObject));
    }
}

/**
 * Search courses will search through all of the downloaded courses, according to the search settings and return the results.
 * @param {Array}  downloadedCourses The Array of the downloaded course data objects, ready to search
 * @param {object} searchSettings    The object that has the settings with which to search a course
 */
function searchCourses(downloadedCourses, searchSettings) {
    var results = [];

    console.log(downloadedCourses);

    // Search according to the settings
    downloadedCourses.forEach(function (course) {
        // Every course searched will have a result.  Some will have no matches.
        var newResult = {
            courseName: course.courseInfo.Name,
            ouNumber: course.courseInfo.Identifier,
            matches: []
        }

        console.log(newResult);

        var resultMatch;

        course.successfulPages.forEach(function (page) {
            if (searchSettings.isSelector) {
                // Place selector searching logic here
                if (page.document.querySelector(searchSettings.query)) {
                    // Put the whole HTML in only once
                    resultMatch = {
                        fullHtml: page.html,
                        innerText: page.document.body.innerText
                    }

                    page.document.querySelectorAll(searchSettings.query).forEach(function (foundElement) {
                        resultMatch.openCloseTags = '<p></p>' // example for right now
                    });

                    // Push all the matches with their proper results into the matches array
                    newResult.matches.push(resultMatch);
                }
            } else {
                // We want to search using innerText or html
                if (searchSettings.searchInnerText) {
                    // Place innerText searching logic here
                    if (page.document.body.innerText.includes(searchSettings.query)) {
                        var matchedRegex = new RegExp(searchSettings.query, 'g');

                        // Only get 50 chars before the match
                        var beginningIndex = page.document.body.innerText.indexOf(searchSettings.query);
                        resultMatch = page.document.body.innerText.substring(beginningIndex - 50, beginningIndex);
                        var matchWord = page.document.body.innerText.match(matchedRegex);

                        // Append the matchedWord onto the whole result
                        resultMatch += matchWord[0];

                        // Only get 50 chars after the end of the matchedWord
                        var endIndex = beginningIndex + matchWord[0].length;
                        resultMatch += page.document.body.innerText.substring(endIndex, endIndex + 50);

                        // Now push the match
                        newResult.matches.push(resultMatch);
                    }
                } else if (searchSettings.searchHtml) {
                    // Check to see if the query is regex
                    if (searchSettings.isRegex) {
                        if (page.html.match(searchSettings.query)) {
                            // Only get 50 chars before the match
                            var beginningIndex = page.html.search(searchSettings.query);
                            resultMatch = page.html.substring(beginningIndex - 50, beginningIndex);
                            var matchWord = page.html.match(searchSettings.query);

                            // Append the matchedWord onto the whole result
                            resultMatch += matchWord[0];

                            // Only get 50 chars after the end of the matchedWord
                            var endIndex = beginningIndex + matchWord[0].length;
                            resultMatch += page.html.substring(endIndex, endIndex + 50);

                            // Now push the match
                            newResult.matches.push(resultMatch);
                        }
                    } else {
                        if (page.html.includes(searchSettings.query)) {
                            // We found a match!
                            // Extract the match
                            var matchedRegex = new RegExp(searchSettings.query, 'g');

                            // Only get 50 chars before the match
                            var beginningIndex = page.html.indexOf(searchSettings.query);
                            resultMatch = page.html.substring(beginningIndex - 50, beginningIndex);
                            var matchWord = page.html.match(matchedRegex);

                            // Append the matchedWord onto the whole result
                            resultMatch += matchWord[0];

                            // Only get 50 chars after the end of the matchedWord
                            var endIndex = beginningIndex + matchWord[0].length;
                            resultMatch += page.html.substring(endIndex, endIndex + 50);

                            // Now push the match
                            newResult.matches.push(resultMatch);
                        }
                    }
                }
            }
        });

        results.push(newResult);
    });

    return results;
}

/**
 * Display results will display the results through the DOM.
 * @param {Array}  results         An array of the results from the search
 * @param {object} [[Description]]
 */
function displayResults(results, searchSettings) {
    results.forEach(function (result) {
        result.matches.forEach(function (match) {
            var matchedIndex = match.indexOf(searchSettings.query);
            var chalkedWord = chalk.blue(match.substr(matchedIndex, searchSettings.query.length));
            console.log(match.substring(0, matchedIndex) + chalkedWord + match.substring(matchedIndex + searchSettings.query.length));
        })
    })
}

/**
 * Download a CSV of the results in the format specified by the user.
 * @param {Array} results An array of results from the search, in a format that the user wants
 */
function downloadCSV(results) {

}

main();
