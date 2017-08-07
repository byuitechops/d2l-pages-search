/**
 * Main will handle all user input from the DOM.
 */
function main() {
    // Get the ou numbers
    var ouNumbers = process.argv[2];

    // Download the ouNumbers
    var downloadedCourses = downloadCourses(ouNumbers);

    // Get the searchSettings from the user
    console.log(process.argv[3]);
    var searchSettings = {
        query: process.argv[3],
        isSelector: process.argv[4],
        isRegex: process.argv[5]
    }

    // Search the courses
    var results = searchCourses(downloadedCourses, searchSettings);

    // Display the results
    displayResults(results);

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
            html: "DOCTYPE! html <html><head></head><body><h1>I love people, courses and roller coasters!</h1></body></html>",
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
        course.successfulPages.forEach(function (page) {
            if (page.html.includes(searchSettings.query)) {
                // We found a match!
                var matchedRegex = new RegExp(searchSettings.query, 'g');
                var beginningIndex = page.html.indexOf(searchSettings.query);
                var resultMatch = page.html.substring(beginningIndex - 50, beginningIndex - 1);
                var matchW = page.html.match(matchedRegex);
                console.log('matchW: ' + matchW);
                resultMatch += matchW;
                var endIndex = beginningIndex + matchW.length - 1;
                resultMatch += page.html.substring(endIndex + 1, endIndex + 50);

                console.log(resultMatch)

                // Now make the result object
                /*results.push({
                    courseName: course.courseInfo.name,
                    ouNumber: course.courseInfo.ouNumber,
                    matches: []
                })*/
            }
        })
    })
}

/**
 * Display results will display the results through the DOM.
 * @param {Array} results An array of the results from the search
 */
function displayResults(results) {

}

/**
 * Download a CSV of the results in the format specified by the user.
 * @param {Array} results An array of results from the search, in a format that the user wants
 */
function downloadCSV(results) {

}

main();
