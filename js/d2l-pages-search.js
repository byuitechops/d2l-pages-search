/**************************************************************************************************
 * Program:
 *  D2L Pages Search
 * 
 * Authors:
 *  Scott Nicholes and Zachary Williams
 * 
 * Summary:
 *  This program searches for queries in the content pages of d2l courses.  In addition, this
 *  program also displays and downloads the results of the search.
 **************************************************************************************************/

/*eslint-env es6, browser*/
/*global $, d2lScrape, async, Handlebars, ace, d3, download, html_beautify, tippy, require*/
/*eslint no-console:0*/

// jQuery elements
var loadCoursesButton = $('#load-button'),
    searchAndDisplayButton = $('#search-and-display-button'),
    searchInputElement = $('#search-input'),
    searchSettingText = $('#searchSettingText'),
    searchSettingHTML = $('#searchSettingHTML'),
    searchSettingCSS = $('#searchSettingCSS'),
    searchSettingRegex = $('#searchSettingRegex'),
    cssResultsButtons = $('#cssSelectorOptions > input'),
    searchAndDownloadButton = $('#search-and-download-button'),
    downloadButton = $('#download-button');

/**
 * Gathers the course ouNumbers, downloads them, and then either 
 * searches for and displays or downloads the results.
 */
function main() {
    var courses = [];
    var searchSettings;
    var results;

    /**
     * Adds delete events to each of the course delete buttons.
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

    /**
     * Hides or shows the radio buttons that appear for selector searches
     */
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

    /**
     * Sets up the proper format for the tooltips.
     */
    function handleTooltips() {
        tippy('#regexHelper', {
            arrow: true,
            position: 'right',
            theme: 'light',
            html: '#regexTooltipTemplate',
            interactive: true
        });

        tippy('#cssHelper', {
            arrow: true,
            position: 'right',
            theme: 'light',
            html: '#cssTooltipTemplate',
            interactive: true
        })

        tippy('.help-image', {
            position: 'right',
            arrow: true,
            theme: 'light'
        });

        return;
    }

    // Set the tooltips up
    handleTooltips();

    /**
     * When the 'Load Courses' button is clicked
     */
    loadCoursesButton.on('click', function () {
        // Get the ouNumbers
        var ouNumbers = getOuNumbers();

        // For each of the ouNumbers, see if they're on the list of downloaded courses already.
        ouNumbers.forEach(function (ouNumber) {
            // IF at least one of the ouNumbers is on the list, we know that this number is on the list.
            var isCourseOnList = courses.some(function (course) {
                return ouNumber === course.ouNumber;
            });

            // If the ouNumber is not on the list, make a new object with which to put our downloaded course.
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

            // Add the event listeners for the delete course buttons
            addDeleteCourseEvents();
        });

        return;
    });

    /**
     * When the 'Search Courses' button is clicked
     */
    searchAndDisplayButton.on('click', function () {
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

        // Scroll down to display
        $('html, body').animate({
            scrollTop: $("#searchCourses").offset().top
        }, 1000);

        return;
    });

    /**
     * When any of the radio buttons for selector searches are clicked
     */
    cssResultsButtons.on('click', function () {
        // Clear the results page first
        $('.course-results').remove();

        // Get the id for the radio buttons selected
        searchSettings.radioButtonId = this.id;

        displayResults(results, searchSettings);
    });

    /**
     * When the 'Search And Download CSV' button is clicked
     */
    searchAndDownloadButton.on('click', function () {
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

        // Download the CSV
        downloadCSV(results, searchSettings);
        return;
    });

    /**
     * When the 'Download CSV' button is clicked
     */
    downloadButton.on('click', function () {
        downloadCSV(results, searchSettings);
        return;
    });

    // End program
    return;
}

/**
 * Gets the ou numbers from the textarea.
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
 * Downloads all the courses that have not yet been downloaded.
 * 
 * @param {Array}    courses  An array of course objects to attempt to download
 * @param {function} callback Returns an error, if there was one.  We are not using this
 *                            mechanism, because we handle the error using d2lScrape.
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

    // Download all the html pages for each of the courses
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
 * Changes the Handlebars display according to the model data it is given.
 *
 * @param {object}  courses The course data to be displayed
 */
function renderStatus(courses) {
    $('#course-status-container').html(Handlebars.templates.status(courses));
}

/**
 * Gets and formats the search settings from the 'Search Courses' box.
 * 
 * @throws {Error} An error further directing the user to input a valid query
 * @returns {object} The settings with which to search
 */
function getSearchSettings() {
    /**
     * Makes a regular expression from a query.
     * 
     * @throws {Error} An error describing why a regular expression could not be created.
     */
    function makeRegexFromQuery() {
        // If query is already a regular expression
        if (searchSettings.isRegex) {
            // Check to make sure searchString is in regular expression form
            // Taken from `course-search` gitHub repo: https://github.com/byuitechops/course-search/blob/master/src/courseSearchTools.js
            var pattern;
            var flags;

            // Test to see if the query is in correct regEx format
            if (/^\/.+(\/[gimy]*)$/.test(searchSettings.query)) {
                // Set the regEx pattern and flags
                pattern = searchSettings.query.slice(1, searchSettings.query.lastIndexOf('/'));
                flags = searchSettings.query.slice(searchSettings.query.lastIndexOf('/') + 1);
            } else {
                throw new Error("Regular expression pattern must be wrapped with '/' and must only be followed by the follwing valid flags:\ng, i, m, u, y.\n\nFollow this link for more information about Regular Expressions: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions");
            }

            try {
                // Create Regular Expression Object with the correct pattern and flags
                searchSettings.query = new RegExp(pattern, flags);
            } catch (regexException) {
                throw new Error("There was an Error in making the RegEx Object");
            }
        } else {
            // The user simply put a string of characters in.  Make a regular expression from this.
            searchSettings.query = new RegExp(searchSettings.query, 'gi');
        }
    }

    // Get the search settings from the search courses box
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
 * Searches all the downloaded courses and returns the results.
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
     * Searches a string using a regular expression.
     * 
     * @param   {string} searchString The string we want to search
     * @param   {RegExp} regEx        The regular expression we want to search with
     * @returns {Array}  The array of results that were found
     */
    function searchText(searchString, regEx) {
        // Taken from MDN: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/exec#Finding_successive_matches
        var matchArray;
        var outputArray = [];

        /**
         * Returns the 50 characters before a found word match, including
         * the whole word before those 50 characters, if there is any.
         * 
         * @param   {string} string The string from which to parse
         * @returns {string} The fully formed first 50 or more characters after the match
         */
        function getFirstFifty(string) {
            return string.substring(string.substring(0, matchArray.index - 50).lastIndexOf(' ') + 1, matchArray.index).replace(/\n+/g, '');
        }

        /**
         * Returns the 50 characters after a found word match, including
         * the whole word after those 50 characters, if there is any.
         * 
         * @param   {string} string The string from which to parse
         * @returns {string} The fully formed last 50 or more characters after the match
         */
        function getLastFifty(string, endOfWordIndex) {
            // This is the regEx in order to get 50 characters after the word
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

        /**
         * Constructs a complete match for both CSV and Handlebars output
         * 
         * @param   {object} matchArray The array that has the returned match
         * @returns {object} An object with handlebars and CSV display properties
         */
        function compileMatch(matchArray) {
            // Construct the 50 left and right string
            var firstFifty = (matchArray.index - 50 > 0 ? '...' : '') + getFirstFifty(matchArray.input);
            var queryMatch = matchArray[0];
            var secondFifty = getLastFifty(matchArray.input, matchArray.index + matchArray[0].length) + (matchArray.index + 50 < matchArray.input.length - 1 ? '...' : '');

            return {
                display: Handlebars.Utils.escapeExpression(firstFifty) + '<span class="highlight">' + Handlebars.Utils.escapeExpression(queryMatch) + '</span>' + Handlebars.Utils.escapeExpression(secondFifty),
                noEscapeDisplay: firstFifty + queryMatch + secondFifty
            }
        }

        // Because this loop is an infinite loop if it is given no global flag, we differentiate which code will run
        if (regEx.global) {

            // Continuously update the array, finding all the matches within the search string
            while ((matchArray = regEx.exec(searchString)) !== null) {
                // Push onto our output properly compiled matches
                outputArray.push(compileMatch(matchArray));
            }
        } else {
            matchArray = regEx.exec(searchString);

            // IF anything was found...
            if (matchArray) {
                outputArray.push(compileMatch(matchArray));
            }
        }

        return outputArray;
    }

    /**
     * Returns a new match for every querySelector that was found on a page.
     * 
     * @param   {object} page           A page of a course we want searching
     * @param   {object} searchSettings Settings that we want to search with
     * @returns {object} A match that was found for this page
     */
    function makeMatchesSelector(page, searchSettings) {
        /**
         * Beautifuies a found html match.
         * 
         * @param   {string} html The html to be beautified
         * @returns {string} The beautified html
         */
        function makePretty(html) {
            // Uses external html_beautify library
            return html_beautify(html, {
                "wrap_line_length": 50,
                unformatted: ['a', 'abbr', 'area', 'audio', 'b', 'bdi', 'bdo', 'cite', 'data', 'datalist', 'del', 'dfn', 'em', 'i', 'input', 'ins', 'kbd', 'keygen', 'map', 'mark', 'math', 'meter', 'noscript', 'output', 'progress', 'q', 'ruby', 's', 'samp', 'select', 'small', 'span', 'strong', 'sub', 'sup', 'template', 'time', 'u', 'var', 'wbr', 'text', 'acronym', 'address', 'big', 'dt', 'ins', 'small', 'strike', 'tt', 'pre'],
                extra_liners: []
            });
        }

        /**
         * Adds html to html matches to display with Ace editor.
         * 
         * @param   {string} stringIn The string to add Ace editor code to
         * @returns {string} The converted html string with Ace code
         */
        function addAceEditor(stringIn) {
            return '<div class="editor"><textarea>' + Handlebars.Utils.escapeExpression(makePretty(stringIn)) + '</textarea></div>';
        }

        // Format all the matches before returning
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
     * Returns the searchText function with the text content to search.
     * 
     * @param   {object}   page           A page of a course we want to search
     * @param   {object}   searchSettings Settings that we want to search with
     * @returns {function} The searchText function
     */
    function makeMatchesText(page, searchSettings) {
        return searchText(page.document.body.innerText, searchSettings.query);
    }

    /**
     * Returns the searchText function with the html content to search.
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

    // Decide what our make function will be.  We do this so that while in the forEach
    //   statement below, we simply just pass it a variable that has the correct function
    //   for this search.
    if (searchSettings.isSelector) {
        makeMatches = makeMatchesSelector;
    } else if (searchSettings.searchInnerText) {
        makeMatches = makeMatchesText;
    } else {
        makeMatches = makeMatchesHtml;
    }

    // Loop through each of the courses
    courses.forEach(function (course) {
        // Only save the courses that have the complete status
        if (course.status === 'COMPLETE') {
            results.push({
                courseName: course.courseName,
                courseUrl: course.courseUrl,
                ouNumber: course.ouNumber,
                pages: course.pages.map(function (page) {
                        return {
                            pageUrl: page.url,
                            url: page.url,
                            // We decode the url so that we just get the name
                            name: decodeURI(page.url.split('/')[page.url.split('/').length - 1]),
                            // Use the newly assigned makeMatches function
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
 * Display the results in the 'Results' box.
 * 
 * @param {Array}  courses        The transformed course objects with the results from the search
 * @param {object} searchSettings The settings that were used to search for the query
 */
function displayResults(courses, searchSettings) {
    /**
     * Formats the results according to a display preference.
     * 
     * @param {Array}  courses     The courses to format
     * @param {string} selectionId The string to specify which property to display
     */
    function reformatDisplay(courses, selectionId) {
        var idToPropMap = {
                resultSettingText: "innerText",
                resultSettingHTML: "fullHtml",
                resultSettingTags: "openCloseTags"
            },
            // At the specific selectionId, assign the property to display
            propToDisplay = idToPropMap[selectionId];

        // Change all the matches to just display the match that was selected
        courses.forEach(function (course) {
            course.pages.forEach(function (page) {
                page.matches.forEach(function (match) {
                    match.display = match[propToDisplay];
                })
            })
        });
    }

    /**
     * Changes elements on the html page to show the ace editor.
     */
    function renderAceEditor() {
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
                // Only display 30 lines, if result is longer than 30 lines
                maxLines: doc.getLength() > 30 ? "30" : doc.getLength()
            })
            editor.getSession().setMode("ace/mode/html");
        });
    }

    console.log('RESULTS:', courses);

    // If we need to, reformat the courses
    if (searchSettings.isSelector) {
        // Send in the radio button selection id
        reformatDisplay(courses, searchSettings.radioButtonId);
    }

    // Send the courses to the Handlebars template to be rendered
    $('#results').html(Handlebars.templates.results(courses));

    // IF display was of Selectors, convert all text areas to ace
    if (searchSettings.isSelector) {
        renderAceEditor();
    }
}

/**
 * Downloads a CSV of the results in the format specified by the user.
 * 
 * @param {Array}  results        The results to download
 * @param {object} searchSettings Settings to determine in what format to download the results
 */
function downloadCSV(results, searchSettings) {
    // Array of the data to download
    var toDownload = [];

    // Get the appropriate properties either for a selector or for a text match
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

    // Use external library d3 to format the download array
    toDownload = d3.csvFormat(toDownload);

    // Use external library to download the array
    download(toDownload, 'results.csv', 'text/csv');
    return;
}

window.onload = main;
