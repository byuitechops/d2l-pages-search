var d2lScrape = require('d2lScrape.js');

function main() {
    // Get the ou numbers
    var ouNumbers = getOuNumbers();

    // Download the ouNumbers
    var downloadedCourses = downloadCourses(ouNumbers);

    // Get the searchSettings from the user
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

function getOuNumbers() {
    var ouNumbers = process.argv[2];

    return ouNumbers;
}

function downloadCourses(ouNumbers) {
    d2lScrape.getCourseHtmlPages(ouNumbers, function (error, data) {
        return data;
    });
}

function searchCourses(downloadedCourses, searchSettings) {

}

function displayResults(results) {

}

function downloadCSV(results) {

}
