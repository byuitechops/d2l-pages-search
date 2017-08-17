// jQuery elements
var loadCoursesButton = $('#load-button'),
    searchCoursesButton = $('#search-button'),
    searchInputElement = $('.search-input'),
    searchSettingText = $('#searchSettingText'),
    searchSettingHTML = $('#searchSettingHTML'),
    searchSettingCSS = $('#searchSettingCSS'),
    searchSettingRegex = $('#searchSettingRegex'),
    downloadButton = $('#download-button');

/**
 * Main will handle all user input from the DOM.
 */
function main() {
    var courses = [];
    var searchSettings;
    var results;

    // Main event listeners
    loadCoursesButton.on('click', function () {
        // Get the ouNumbers
        var ouNumbers = getOuNumbers();

        // For each of the ouNumbers, see if they're on the list of downloaded courses already.
        ouNumbers.forEach(function (ouNumber) {
            var isCourseOnList = courses.some(function (course) {
                return ouNumber === course.ouNumber;
            });

            // If not on the list, make a new object with which to put our downloaded course.
            if (!isCourseOnList) {
                courses.push({
                    courseName: String(ouNumber),
                    ouNumber: ouNumber,
                    isDownloaded: false,
                    status: 'WAITING'
                });
            }
        });

        // Download the ouNumbers
        downloadCourses(courses, function (error) {
            if (error) {
                console.error('There was an error in downloading the courses: ' + error);
            }

            addDeleteCourseEvents();
        });

        return;
    });

    function addDeleteCourseEvents() {
        courses.forEach(function (course, index) {
            console.log($(`#delete${course.ouNumber}`));
            // Set an event listener for each of the delete buttons
            $(`#delete${course.ouNumber}`).on('click', {
                value: index
            }, function (event) {
                console.log('button clicked for index:', event.data.value);
                // Delete the model data
                courses.splice(event.data.value, 1);

                // Remove the event handler
                $(`#delete${course.ouNumber}`).off();

                // Update the view
                renderStatus(courses);

                // Reset the event handlers
                addDeleteCourseEvents();
            });

            console.log('Event handlers set for course:', course);
        });
    }


    searchCoursesButton.on('click', function () {
        // Get the searchSettings from the user
        try {
            searchSettings = getSearchSettings();
        } catch (e) {
            // We have an error.  Report it and end the function.
            console.log(e);
            window.alert(e.message);
            return;
        }

        // Search the courses
        results = searchCourses(courses, searchSettings);

        // Display the results
        displayResults(results, searchSettings);

        // Enable the download CSV button
        downloadButton.removeAttr('disabled');
        return;
    });

    downloadButton.on('click', function () {
        downloadCSV(results, searchSettings);
        return;
    });

    // End program
    return;
}

function getOuNumbers() {
    return $('#textarea').val().split(', ');
}

function getSearchSettings() {
    function makeRegexFromQuery() {
        if (searchSettings.isRegex) {
            // Taken from `course-search` gitHub repo
            // Check to make sure searchString is in regular expression form
            var pattern;
            var flags;

            if (/^\/.+(\/[gimy]*)$/.test(searchSettings.query)) {
                pattern = searchSettings.query.slice(1, searchSettings.query.lastIndexOf('/'));
                flags = searchSettings.query.slice(searchSettings.query.lastIndexOf('/') + 1);
            } else {
                throw new Error("Regular expression pattern must be wrapped with '/' and must only be followed by valid flags.");
            }
            try {
                // Create Regular Expression Object
                searchSettings.query = new RegExp(pattern, flags);
            } catch (ex) {
                throw new Error("There was an Error in making the RegEx Object");
            }
        } else {
            searchSettings.query = new RegExp(searchSettings.query, 'g');
        }
    }

    // Get the search settings from the input box
    var searchSettings = {
        query: searchInputElement.val(),
        searchInnerText: searchSettingText.is(':checked'),
        searchHTML: searchSettingHTML.is(':checked'),
        isSelector: searchSettingCSS.is(':checked'),
        isRegex: searchSettingRegex.is(':checked')
    }

    // If query is not a selector...
    if (!searchSettings.isSelector) {
        // We need to change it to regEx no matter what
        makeRegexFromQuery();
    } else {
        // Anything that goes in the box can be CSS searched without errors
        searchSettings.isValidQuery = true;
    }

    return searchSettings;
}

/**
 * This function downloads all the courses that have not been downloaded yet.
 * 
 * @param {Array}    courses  An array of course objects to attempt to download
 * @param {function} callback A function to call once all the work of this function is done
 */
function downloadCourses(courses, callback) {
    /**
     * Downloads a single course and updates its model status.
     * 
     * @param {object}   course                 A course to attempt to download
     * @param {function} downloadCourseCallback A function that advances the async operation
     */
    function downloadCourse(course, downloadCourseCallback) {
        if (!course.isDownloaded) {
            // Update the view
            course.status = 'LOADING'
            renderStatus(courses);

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

                downloadCourseCallback();
            });
        } else {
            // Go on to the next course
            downloadCourseCallback();
        }
    }

    // To begin, render the current statuses
    renderStatus(courses);

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
 *
 * @param {object}  courses The course data to be displayed
 */
function renderStatus(courses) {
    $('#course-status-container').html(Handlebars.templates.status(courses));
}

/**
 * This function will search through all of the downloaded courses and return the results of
 * the search.
 * 
 * @param   {Array}  courses        The courses to be searched
 * @param   {object} searchSettings The settings to search with
 * @returns {Array}  An array of the transformed courses with the results
 */
function searchCourses(courses, searchSettings) {
    // This variable holds the function that we will use to search
    var makeMatches;

    /**
     * This function searches a string using a regular expression.
     * 
     * @param   {string} searchString The string we want to search
     * @param   {RegExp} regEx        The regular expression we want to search with
     * @returns {Array}  The array of results that were found
     */
    function searchText(searchString, regEx) {
        // Taken from MDN: `https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/exec#Finding_successive_matches`
        var myArray;
        var matchedWord;
        var endOfWordIndex;
        var outputArray = [];

        function getFirstFifty(string) {
            return string.substring(string.substring(0, myArray.index - 50).lastIndexOf(' ') + 1, myArray.index).replace(/\n+/g, '');
        }

        function getLastFifty(string) {
            return string.substring(string.substring(endOfWordIndex, endOfWordIndex + 50).lastIndexOf(' ') + 1, endOfWordIndex + 50);
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
                    secondFifty: myArray.input.substring(endOfWordIndex, endOfWordIndex + 50).replace(/\n+/g, '') + (myArray.index + 50 < myArray.input.length - 1 ? '...' : '')
                    //secondFifty: getLastFifty(myArray.input) + (myArray.index + 50 < myArray.input.length - 1 ? '...' : '')
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

    /**
     * This function will return a new match for every querySelector that was found on a page.
     * 
     * @param   {object} page           A page of a course we want searching
     * @param   {object} searchSettings Settings that we want to search with
     * @returns {object} A match that was found for this page
     */
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

    /**
     * This function returns the searchText function, sending it the innerText of the page to be
     * searched. 
     * 
     * @param   {object}   page           A page of a course we want to search
     * @param   {object}   searchSettings Settings that we want to search with
     * @returns {function} The searchText function
     */
    function makeMatchesText(page, searchSettings) {
        return searchText(page.document.body.innerText, searchSettings.query);
    }

    /**
     * This function returns the searchText function, sending it the html of the page to be
     * searched.
     * 
     * @param   {object}   page           A page of a course we want to search
     * @param   {object}   searchSettings Settings that we want to search with
     * @returns {function} The searchText function
     */
    function makeMatchesHtml(page, searchSettings) {
        return searchText(page.html, searchSettings.query);
    }

    // Remove the current results, if any
    $('.course-results').remove();

    // Decide what our make function will be
    if (searchSettings.isSelector) {
        makeMatches = makeMatchesSelector;
    } else if (searchSettings.searchInnerText) {
        makeMatches = makeMatchesText;
    } else {
        makeMatches = makeMatchesHtml;
    }

    // Map the courses with the found matches in each of the courses' pages
    return courses.map(function (course) {
        // Only map the courses that have the complete status
        if (course.status === 'COMPLETE') {
            return {
                courseName: course.courseName,
                courseUrl: course.courseUrl,
                ouNumber: course.ouNumber,
                pages: course.pages.map(function (page) {
                        return {
                            pageUrl: page.url,
                            url: page.url,
                            matches: makeMatches(page, searchSettings)
                        }
                    })
                    // We're only going to keep the pages that have returned data
                    .filter(function (page) {
                        return page.matches.length > 0;
                    })
            }
        }
    })
}

/**
 * This function will display the results that were found through the DOM.
 * 
 * @param {Array}  courses        The transformed course objects with the results from the search
 * @param {object} searchSettings The settings that were used to search for the query
 */
function displayResults(courses, searchSettings) {
    /**
     * Render the results of the search using the DOM.
     * 
     * @param {object} courseObject An object that contains the course data to display
     */
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

    // Render the results for each of the courses
    courses.forEach(function (course) {
        renderResults(course);
    });
}

/**
 * Download a CSV of the results in the format specified by the user.
 * 
 * @param {Array}  results        The results to download
 * @param {object} searchSettings Settings to determine in what format to download the results
 */
function downloadCSV(results, searchSettings) {
    // Array of the data to download
    var toDownload = [];

    if (searchSettings.isSelector) {
        results.forEach(function (result) {
            result.pages.forEach(function (page) {
                page.matches.forEach(function (match) {
                    toDownload.push({
                        courseName: result.courseName,
                        ouNumber: result.ouNumber,
                        pageUrl: page.pageUrl,
                        fullHtml: match.fullHtml,
                        innerText: match.innerText,
                        openCloseTags: match.openCloseTags
                    });
                });
            });
        });
    } else {
        results.forEach(function (result) {
            result.pages.forEach(function (page) {
                page.matches.forEach(function (match) {
                    toDownload.push({
                        courseName: result.courseName,
                        ouNumber: result.ouNumber,
                        pageUrl: page.pageUrl,
                        match: match.firstFifty + match.queryMatch + match.secondFifty
                    });
                });
            });
        });
    }

    toDownload = d3.csvFormat(toDownload);
    download(toDownload, 'results.csv', 'text/csv');
    return;
}

main();
