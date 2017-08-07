# Structured Chart Explanation

## Program Variables
#### Explanation
`ouNumbers` - An array of ouNumbers from which to gather course data.<br>
`downloadedCourses` - An array of course data that includes all the HTML pages from each course.<br>
`searchSettings` - An object of settings with which to run the search.<br>
`results` - An array of the results found from searching all the courses.<br>

-----

#### Formats

`downloadedCourses` format:
*downloadedCourses documentation cited from Joshua McKinney's Library get-d2l-course-html-pages*
```javascript
var downloadedCourses = [
{
    courseInfo: {D2l course offering obj},
    successfulPages: [pages array],
    errorPages: [pages array]
}
]
```

`courseInfo` is the object that is returned the D2L valence api call [http://docs.valence.desire2learn.com/res/course.html#get--d2l-api-lp-(version)-courses-(orgUnitId)](http://docs.valence.desire2learn.com/res/course.html#get--d2l-api-lp-(version)-courses-(orgUnitId)) it looks like this [http://docs.valence.desire2learn.com/res/course.html#Course.CourseOffering](http://docs.valence.desire2learn.com/res/course.html#Course.CourseOffering)


Each page in the arrays look like this:

```
    {
        document : an html document created from the html string using DOMParser //(when request is successful),
        url: url String,
        html: htmlString, //(when request is successful)
        error: null //when request is successful
        error : { //when request has an error
            status: request.status,
            statusText: request.statusText,
            responseText: request.responseText,
            responseURL: request.responseURL
        }
    }
```
-----

`searchSettings` format:
```
{
    query: The search query string,
    isSelector: A boolean value indicating whether the query is a CSS Selector or not,
    isRegex: A boolean value indicating whether the query is a regular expression or not
}
```
-----

`Results` format:

```
var results = [
{
    course_name:
    ouNumber:
    matches: [An array of objects in the format requested by the user]
}
]
```

-----
## Functions

***Primary Question: What will each of these functions do?***

## main()
Main will handle all user input from the DOM.

-----
### Functionality
- Gather the ouNumbers
- Send the ouNumbers to downloadCourses
- Gather the search settings from the user
- Send the results to displayResults
-----

## downloadCourses(ouNumbers)
Download courses will use Joshua McKinney's library to download all the course HTML files.

-----
### Functionality
- Download all HTML files for every ouNumber given
- Display the status of the downloading of each course
- Change the ouNumber to the course name once it has been downloaded
- Return all of the downloaded courses
-----

## searchCourses(downloadedCourses, searchSettings)
Search courses will search through all of the downloaded courses, according to the search settings and return the results.

-----
### Functionality
- Read searchSettings
- Search through all of the courses for the query, according to the settings
- Format the results of the search
- Return the results of the search
-----
## displayResults(results)
Display results will display the results through the DOM.

-----
### Functionality
- Read the results
- Output the results to the DOM
- For CSS Selectors, change the output layout according to which radio button is pressed
-----

## downloadCSV(results)
Download a CSV of the results in the format specified by the user.

-----
### Functionality
- Format the results.  For CSS Selectors, format the results according to the radio button option chosen
- Download a CSV of the results