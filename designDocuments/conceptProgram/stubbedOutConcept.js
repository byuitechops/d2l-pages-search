var chalk = require('chalk');

/**
 * Main will handle all user input from the DOM.
 */
function main() {
    // Get the ou numbers
    var ouNumbers = process.argv[2];

    // Download the ouNumbers
    var downloadedCourses = downloadCourses(ouNumbers);

    // Get the searchSettings from the user
    console.log('Search query: ' + process.argv[3]);
    var searchSettings = {
        query: process.argv[3],
        isSelector: process.argv[4] === 'false' ? false : true,
        isRegex: process.argv[5] === 'false' ? false : true,
        searchInnerText: process.argv[6] === 'false' ? false : true,
        searchHtml: process.argv[7] === 'false' ? false : true
    }

    // Search the courses
    var results = searchCourses(downloadedCourses, searchSettings);

    // Display the results
    displayResults(results, searchSettings);

    return;
}

/**
 * Download courses will use Joshua McKinney's library to download all the course HTML files.
 * @param   {Array} ouNumbers The list of ouNumbers to download
 * @returns {Array} Array of the downloaded course data objects
 */
function downloadCourses(ouNumbers) {
    // CONCEPT download
    var downloadedData = [{
        courseInfo: {
            name: "Scott's Course",
            ouNumber: process.argv[2]
        },
        successfulPages: [{
            document: "Example Document",
            url: "https://google.com/",
            html: "<!DOCTYPE html> <html><head></head><body><h1>I love people, courses and roller coasters!</h1></body></html>",
            error: null
        }],
        errorPages: []
    }];

    // Uncomment for actual library
    /*d2lScrape.getCourseHtmlPages(ouNumbers, function (error, data) {
        return data;
    });*/

    return downloadedData;
}

/**
 * Search courses will search through all of the downloaded courses, according to the search settings and return the results.
 * @param {Array}  downloadedCourses The Array of the downloaded course data objects, ready to search
 * @param {object} searchSettings    The object that has the settings with which to search a course
 */
function searchCourses(downloadedCourses, searchSettings) {
    var results = [];
    // Search according to the settings
    downloadedCourses.forEach(function (course) {
        // Every course searched will have a result.  Some will have no matches.
        var newResult = {
            courseName: course.courseInfo.name,
            ouNumber: course.courseInfo.ouNumber,
            matches: []
        }

        course.successfulPages.forEach(function (page) {
            if (searchSettings.isSelector) {
                // Place selector searching logic here
            } else {
                // We want to search using innerText or html
                if (searchSettings.searchInnerText) {
                    // Place innerText searching logic here
                } else if (searchSettings.searchHtml) {
                    // Check to see if the query is regex
                    if (searchSettings.isRegex) {
                        if (page.html.match(searchSettings.query)) {
                            // Only get 50 chars before the match
                            var beginningIndex = page.html.search(searchSettings.query);
                            var resultMatch = page.html.substring(beginningIndex - 50, beginningIndex);
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
                            var resultMatch = page.html.substring(beginningIndex - 50, beginningIndex);
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
