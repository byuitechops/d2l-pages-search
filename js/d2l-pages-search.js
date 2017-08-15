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
        searchInputElement = $('.search-input'),
        searchSettingText = $('#searchSettingText'),
        searchSettingHTML = $('#searchSettingHTML'),
        searchSettingCSS = $('#searchSettingCSS'),
        searchSettingRegex = $('#searchSettingRegex'),
        downloadButton = $('#download-button')

    // Main event listeners
    loadCoursesButton.on('click', function () {
        // Get the ouNumbers
        ouNumbers = getOuNumbers();

        // Download the ouNumbers
        downloadCourses(ouNumbers, function (error, data) {
            if (error) {
                console.error('There was an error in downloading the courses: ' + error);
            }

            downloadedCourses = data;

            console.log('Downloaded course data: ', downloadedCourses);

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
        var results = searchCourses(downloadedCourses, searchSettings);

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

    /**
     * Downloads a single course and updates its model status.
     *
     * @param {number}   ouNumber The ouNumber for a course
     * @param {function} callback The callback that compiles the data into the result async array
     */
    function downloadCourse(ouNumber, downloadCourseCallback) {
        renderStatus(courseStatuses[ouNumber + '-OU'], true);
        // Download a single course
        d2lScrape.getCourseHtmlPages(ouNumber, function (error, data) {
            if (error) {
                renderStatus({
                    name: ouNumber,
                    ou: ouNumber,
                    status: 'ERROR'
                }, true);
                downloadCourseCallback(error);
                return;
            }

            // Update the model data to reflect the course has downloaded
            courseStatuses[ouNumber + '-OU'] = {
                name: data.courseInfo.Name,
                ou: ouNumber,
                status: 'COMPLETE'
            }

            // Render the status that we've downloaded the course
            renderStatus(courseStatuses[ouNumber + '-OU'], true);

            // Compile the data with async
            downloadCourseCallback(null, data);
            return;
        })
    }

    // Render all the status objects that we're about to load
    courseStatuses.forEach(function (statusObject) {
        renderStatus(statusObject, false);
    });

    // Download all the course html pages for each of the ouNumbers
    async.map(ouNumbers, downloadCourse, function (error, results) {
        if (error) {
            callback(error);
            return;
        }

        // Send the results back to the caller
        callback(null, results);
        return;
    });

}

/**
 * This function changes the view according to the model data it is given.
 * Specifically, this function reports the change in status of downloading courses.
 *
 * @param {object}  statusObject An object with the data to be displayed
 * @param {boolean} updateCourse   Whether to update a course or not
 */
function renderStatus(statusObject, updateCourse) {
    if (updateCourse) {
        $('#' + statusObject.ou + '-OU').remove();
        $('#course-status-container').append(Handlebars.templates.status(statusObject));
    } else {
        $('#course-status-container').append(Handlebars.templates.status(statusObject));
    }
}

/**
 * This function will search through all of the downloaded courses and return the results of
 * the search.
 *
 * @param {Array}  downloadedCourses Courses to search
 * @param {object} searchSettings    Settings with which to conduct the search
 */
/*function searchCourses(downloadedCourses, searchSettings) {
    var results = [];

    // Search according to the settings
    downloadedCourses.forEach(function (course) {
        // Every course searched will have a result.  Some will have no matches.
        var newResult = {
            courseName: course.courseInfo.Name,
            courseUrl: course.courseInfo.Path,
            ouNumber: course.courseInfo.Identifier,
            matches: course.successfulPages.map(findMatches)
        }
        var resultMatch = {};

        console.log('searchQuery: ' + searchSettings.query)

        // Search each successful page with the settings
        function findMatches(page) {
            var matchesOut;
            if (searchSettings.isSelector) {
                // Place selector searching logic here
                if (page.document.querySelector(searchSettings.query)) {
                    // We have a match!
                    matchesOut = makeMatch(page, 'selector');
                }
            } else {
                // We want to search using innerText or html
                if (searchSettings.searchInnerText) {
                    // Check to see if the query is regex
                    if (searchSettings.isRegex) {
                        // Place innerText searching logic here
                        if (page.document.body.innerText.match(searchSettings.query)) {
                            // We have a match!
                            matchesOut = makeMatch(page, 'regex');
                        }
                    } else {
                        if (page.document.body.innerText.includes(searchSettings.query)) {
                            // We have a match!
                            matchesOut = makeMatch(page, 'text');
                        }
                    }
                } else if (searchSettings.searchHtml) {
                    // Check to see if the query is regex
                    if (searchSettings.isRegex) {
                        if (page.html.match(searchSettings.query)) {
                            // We have a match!
                            matchesOut = makeMatch(page, 'regex');
                        }
                    } else {
                        if (page.html.includes(searchSettings.query)) {
                            // We found a match!
                            matchesOut = makeMatch(page, 'text');
                        }
                    }
                }
            }

            return matchesOut;
        }

        results.push(newResult);
    });

    return results;
}

function makeMatch(page, matchType) {
    // Every match will have a page url
    resultMatch.pageUrl = page.url;

    switch (matchType) {
        case 'regex':
            // Only get 50 chars before the match
            var beginningIndex = page.html.search(searchSettings.query);
            resultMatch.match = page.html.substring(beginningIndex - 50, beginningIndex);
            var matchedWord = page.html.match(searchSettings.query);

            // Append the matched word onto the whole result
            resultMatch.match += matchedWord[0];

            // Only get 50 chars after the end of the matched word
            var endIndex = beginningIndex + matchedWord[0].length;
            resultMatch.match += page.html.substring(endIndex, endIndex + 50);

            // Now push the whole match
            newResult.matches.push(resultMatch);
            break;

        case 'text':
            // Make a regex out of the query so we can get the index
            var matchedRegex = new RegExp(searchSettings.query, 'g');

            // Only get 50 chars before the match
            var beginningIndex = page.document.body.innerText.indexOf(searchSettings.query);
            resultMatch.match = page.document.body.innerText.substring(beginningIndex - 50, beginningIndex);
            var matchedWord = page.document.body.innerText.match(matchedRegex);

            // Append the matched word onto the whole result
            resultMatch.match += matchedWord[0];

            // Only get 50 chars after the end of the matched word
            var endIndex = beginningIndex + matchedWord[0].length;
            resultMatch.match += page.document.body.innerText.substring(endIndex, endIndex + 50);

            // Now push the whole match
            newResult.matches.push(resultMatch);
            break;

        case 'selector':
            resultMatch.pageUrl = page.url;
            resultMatch.fullHtml = page.html;
            resultMatch.innerText = page.document.body.innerText;
            resultMatch.openCloseTags = [];

            // Put the open/close tags in
            page.document.querySelectorAll(searchSettings.query).forEach(function (foundElement) {
                resultMatch.openCloseTags.push(foundElement);
            });

            // Push all the matches with their proper results into the matches array
            newResult.matches.push(resultMatch);
            break;
    }
}*/

/**
 * Display results will display the results through the DOM.
 * @param {Array}  results         An array of the results from the search
 * @param {object} [[Description]]
 */

function displayResults(results, searchSettings) {

    function renderResults(courseObject) {
        console.log('RESULT', courseObject);
        if (courseObject.pages.length > 0) {
            $('#results-container').append(Handlebars.templates.course(courseObject));
            courseObject.pages.forEach((file) => {
                file.name = file.pageUrl
                    .split('/')[file.pageUrl.split('/').length - 1]
                    .split('%20').join('')
                    .split('%27').join('');
                file.id = file.name.split(' ').join('').split('.').join('');
                $('#course-results-' + courseObject.ouNumber).append(Handlebars.templates.file(file));
                file.matches.forEach((match) => {
                    if (!searchSettings.isSelector) {
                        $('#file-matches-' + file.id).append(Handlebars.templates.textMatch(match));
                    } else {
                        $('#file-matches-' + file.id).append(Handlebars.templates.cssMatch(match));
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


/*****************************************/
/**
 * This function will search through all of the downloaded courses and return the results of
 * the search.
 *
 * @param {Array}  downloadedCourses Courses to search
 * @param {object} searchSettings    Settings with which to conduct the search
 */
function searchCourses(downloadedCourses, searchSettings) {
    // This variable holds the function that we will use to search
    var makeMatches;
    $('.course-results').remove();

    function searchText(searchString, regEx) {
        // Taken from MDN: `https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/exec#Finding_successive_matches`
        var myArray;
        var outputArray = [];
        while ((myArray = regEx.exec(searchString)) !== null) {
            var matchedWord = myArray[0];

            // Construct the 50 left and right string
            function getString(string) {
                return string.substring(string.substring(0, myArray.index - 50).lastIndexOf(' ') + 1, myArray.index);
                //return string.substring(string.indexOf('potato') - 53, string.indexOf('potato'));
            }
            var endOfWordIndex = myArray.index + myArray[0].length;
            match = {
                firstFifty: '...' + getString(myArray.input),
                //firstFifty: '...' + myArray.input.substring(myArray.index - 50, myArray.index).replace(/\n+/g, ''),
                queryMatch: matchedWord,
                secondFifty: myArray.input.substring(endOfWordIndex, endOfWordIndex + 50).replace(/\n+/g, '') + '...'
            }

            /*var match = myArray.input.substring(myArray.index - 50, myArray.index);
            match += '<span class="highlight">';
            match += matchedWord;
            match += '</span>'
            match += myArray.input.substring(endOfWordIndex, endOfWordIndex + 50);*/

            // Now get rid of whitespace
            //match = match.replace(/\n+/g, '');

            outputArray.push(match);
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

    /*if (searchSettings.isRegex) {
        // Fix the query to correctly parse the regex
        makeRegexFromQuery(searchSettings);
    }*/

    // We need to change it to regEx no matter what
    if (!searchSettings.isSelector) {
        makeRegexFromQuery(searchSettings);
    }

    return downloadedCourses.map(function (course) {
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
