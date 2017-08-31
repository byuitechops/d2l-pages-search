/**************************************************************************************************
 * d2l-pages-search.js
 * This program searches all of d2l for what a user is looking for.  After searching, this program
 * displays the search results in different ways that help the user analyze what was returned.
 * 
 * This program drives the d2l-pages-search.html web page.
 * 
 * Authors: Scott Nicholes and Zachary Williams
 * License: MIT
 **************************************************************************************************/

/*eslint-env es6, browser*/
/*global $, d2lScrape, async, Handlebars, ace, d3, download, html_beautify, require*/
/*eslint no-console:0*/

// jQuery elements
var loadCoursesButton = $('#load-button'),
    searchCoursesButton = $('#search-button'),
    searchInputElement = $('#search-input'),
    searchSettingText = $('#searchSettingText'),
    searchSettingHTML = $('#searchSettingHTML'),
    searchSettingCSS = $('#searchSettingCSS'),
    searchSettingRegex = $('#searchSettingRegex'),
    cssResultsButtons = $('#cssSelectorOptions > input'),
    downloadButton = $('#download-button');

/**
 * Main will handle all user input from the DOM.
 */
function main() {
    var courses = [];
    var searchSettings;
    var results;

    /**
     * This function manages the event handlers for each of the course's deletion functions.
     */
    function addDeleteCourseEvents() {
        courses.forEach(function (course, index) {
            // Set an event listener for each of the delete buttons
            $(`#delete${course.ouNumber}`).on('click', {
                value: index
            }, function (event) {
                // Delete the model data
                courses.splice(event.data.value, 1);

                // Remove the event handler
                $(`#delete${course.ouNumber}`).off();

                // Update the view
                renderStatus(courses);

                // Reset the event handlers
                addDeleteCourseEvents();
            });
        });
    }

    function handleRadioButtons() {
        // IF the search was done with a selector
        if (searchSettings.isSelector) {
            // When each of of the results radio buttons are clicked, re-display the results
            //  in the proper format.
            $('#cssSelectorOptions').css({
                display: 'flex'
            })
        } else {
            // Remove the event listeners from the results radio buttons
            $('#cssSelectorOptions').css({
                display: 'none'
            });
        }
    }

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
                    statusName: String(ouNumber),
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
        searchSettings.radioButtonId = $('#cssSelectorOptions input:checked').attr('id');

        displayResults(results, searchSettings);

        // Either hide or show the radio buttons
        handleRadioButtons();

        // Enable the download CSV button
        if (downloadButton.prop('disabled')) {
            downloadButton.removeAttr('disabled');
        }

        return;
    });

    cssResultsButtons.on('click', function () {
        $('.course-results').remove();

        searchSettings.radioButtonId = this.id;

        displayResults(results, searchSettings);
    });


    downloadButton.on('click', function () {
        downloadCSV(results, searchSettings);
        return;
    });

    // End program
    return;
}

/**
 * This function simply gets the ou numbers from the DOM.
 * 
 * @returns {Array} An array of ou numbers
 */
function getOuNumbers() {
    // Return the ou numbers, splitting out the commas or spaces
    return $('#textarea')
        .val()
        .replace(/\s+/g, ',')
        .split(',')
        .filter(function (ouNumber) {
            return ouNumber.length > 0;
        });
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

                // Trim the course name down to 25
                var statusName;
                if (data.courseInfo.Name.length > 25) {
                    statusName = data.courseInfo.Name.substring(0, 25) + '...';
                } else {
                    statusName = data.courseInfo.Name;
                }

                // Update the model data to reflect the course has downloaded
                course.isDownloaded = true;
                course.status = 'COMPLETE'
                course.courseName = data.courseInfo.Name;
                course.statusName = statusName;
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
 * This function gets and formats the search settings from the DOM.
 * 
 * @throws {Error} A string that tells the user what format the regular Expression should be in
 * @returns {[[Type]]} [[Description]]
 */
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
            } catch (regexException) {
                throw new Error("There was an Error in making the RegEx Object");
            }
        } else {
            searchSettings.query = new RegExp(searchSettings.query, 'gi');
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
        // Error test to see if the query selector is valid
        try {
            document.querySelector(searchSettings.query)
        } catch (selectorException) {
            throw new Error('Invalid Selector:  Please enter a vaild selector.  More info on query selectors here: https://developer.mozilla.org/en-US/docs/Learn/CSS/Introduction_to_CSS/Selectors');
        }
    }

    return searchSettings;
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
    var results = [];

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
        var outputArray = [];

        /**
         * This function returns the 50 characters before a found word match, including
         * the whole word before those 50 characters, if there is any.
         * 
         * @param   {string} string The string from which to parse
         * @returns {string} The fully formed first 50 or more characters after the match
         */
        function getFirstFifty(string) {
            return string.substring(string.substring(0, myArray.index - 50).lastIndexOf(' ') + 1, myArray.index).replace(/\n+/g, '');
        }

        /**
         * This function returns the 50 characters after a found word match, including
         * the whole word after those 50 characters, if there is any.
         * 
         * @param   {string} string The string from which to parse
         * @returns {string} The fully formed last 50 or more characters after the match
         */
        function getLastFifty(string, endOfWordIndex) {
            var lastFiftyRegex = /[\s\S]{50}/;
            // Step 1: Get 50 chars to the right of the word
            var allAfterWord = string.substring(endOfWordIndex);

            // Step 2: Return the result
            if (allAfterWord.length > 50) {
                return allAfterWord.match(lastFiftyRegex)[0];
            } else {
                return allAfterWord;
            }
        }

        function compileMatch(myArray) {
            // Construct the 50 left and right string
            var firstFifty = (myArray.index - 50 > 0 ? '...' : '') + getFirstFifty(myArray.input);
            var queryMatch = myArray[0];
            var secondFifty = getLastFifty(myArray.input, myArray.index + myArray[0].length) + (myArray.index + 50 < myArray.input.length - 1 ? '...' : '');

            return {
                display: Handlebars.Utils.escapeExpression(firstFifty) + '<span class="highlight">' + Handlebars.Utils.escapeExpression(queryMatch) + '</span>' + Handlebars.Utils.escapeExpression(secondFifty),
                noEscapeDisplay: firstFifty + queryMatch + secondFifty
            }
        }

        // Because this loop is an infinite loop if it is given no global flag, we differentiate which code will run
        if (regEx.global) {
            while ((myArray = regEx.exec(searchString)) !== null) {
                outputArray.push(compileMatch(myArray));
            }
        } else {
            myArray = regEx.exec(searchString);
            if (myArray) {
                outputArray.push(compileMatch(myArray));
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
        function makePretty(html) {
            return html_beautify(html, {
                "wrap_line_length": 50,
                unformatted: ['a', 'abbr', 'area', 'audio', 'b', 'bdi', 'bdo', 'cite', 'data', 'datalist', 'del', 'dfn', 'em', 'i', 'input', 'ins', 'kbd', 'keygen', 'map', 'mark', 'math', 'meter', 'noscript', 'output', 'progress', 'q', 'ruby', 's', 'samp', 'select', 'small', 'span', 'strong', 'sub', 'sup', 'template', 'time', 'u', 'var', 'wbr', 'text', 'acronym', 'address', 'big', 'dt', 'ins', 'small', 'strike', 'tt', 'pre'],
                extra_liners: []
            });
        }

        function addAceEditor(stringIn) {
            return '<div class="editor"><textarea>' + Handlebars.Utils.escapeExpression(makePretty(stringIn)) + '</textarea></div>';
        }
        // Put the open/close tags in
        return Array.from(page.document.querySelectorAll(searchSettings.query)).map(function (foundElement) {
            return {
                display: '',
                fullHtml: addAceEditor(foundElement.outerHTML).trim(),
                innerText: foundElement.innerText.trim(),
                openCloseTags: addAceEditor(foundElement.outerHTML.replace(foundElement.innerHTML, '')).trim(),
                noEscapeHtml: foundElement.outerHTML.trim,
                noEscapeTags: foundElement.outerHTML.replace(foundElement.innerHTML).trim()
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
    courses.forEach(function (course) {
        // Only map the courses that have the complete status
        if (course.status === 'COMPLETE') {
            results.push({
                courseName: course.courseName,
                courseUrl: course.courseUrl,
                ouNumber: course.ouNumber,
                pages: course.pages.map(function (page) {
                        return {
                            pageUrl: page.url,
                            url: page.url,
                            name: decodeURI(page.url.split('/')[page.url.split('/').length - 1]),
                            matches: makeMatches(page, searchSettings)
                        }
                    })
                    // We're only going to keep the pages that have returned data
                    .filter(function (page) {
                        return page.matches.length > 0;
                    })
            });
        }
    });

    return results;
}

/**
 * This function will display the results that were found through the DOM.
 * 
 * @param {Array}  courses        The transformed course objects with the results from the search
 * @param {object} searchSettings The settings that were used to search for the query
 */
function displayResults(courses, searchSettings) {
    function reformatDisplay(courses, selectionId) {
        var idToPropMap = {
                resultSettingText: "innerText",
                resultSettingHTML: "fullHtml",
                resultSettingTags: "openCloseTags"
            },
            propToGet = idToPropMap[selectionId];

        // Change all the matches to just display the match that was selected
        courses.forEach(function (course) {
            course.pages.forEach(function (page) {
                page.matches.forEach(function (match) {
                    match.display = match[propToGet];
                })
            })
        });
    }

    console.log('RESULTS:', courses);

    // Check to see if there is anything to display
    courses.forEach(function (course) {
        if (course.pages.length > 0) {
            course.displayResults = true;
        } else {
            course.displayResults = false;
        }
    });

    // If we need to, reformat the courses
    if (searchSettings.isSelector) {
        reformatDisplay(courses, searchSettings.radioButtonId);
    }

    $('#results').html(Handlebars.templates.results(courses));

    // IF display was of Selectors, convert all text areas to ace
    if (searchSettings.isSelector) {
        $('.editor').each(function (index, element) {
            // Make the document object to count the lines
            var Document = require('ace/document').Document;
            var doc = new Document(element.outerHTML);

            var editor = ace.edit(element);
            editor.setTheme("ace/theme/chrome");
            editor.setReadOnly(true);
            editor.setAutoScrollEditorIntoView(true);
            editor.setOptions({
                fontFamily: "monospace",
                fontSize: "16px",
                maxLines: doc.getLength() > 30 ? "30" : doc.getLength()
            })
            editor.getSession().setMode("ace/mode/html");
        });
    }
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
                        // As we push, decode the previously encoded HTML
                        courseName: result.courseName,
                        ouNumber: result.ouNumber,
                        pageUrl: page.pageUrl,
                        fullHtml: match.noEscapeHtml,
                        innerText: match.innerText,
                        openCloseTags: match.noEscapeTags
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
                        match: match.noEscapeDisplay
                    });
                });
            });
        });
    }

    toDownload = d3.csvFormat(toDownload);
    download(toDownload, 'results.csv', 'text/csv');
    return;
}

window.onload = main;

/*Handlebars.Utils.toString(
Handlebars.Utils.toString(
Handlebars.Utils.toString(
Handlebars.Utils.toString(*/
