# Structured Chart Explanation
***Primary Question: What will each of these functions do?***

## main()
Main will handle all user input from the DOM.

#### Variables
##### Explanation
`ouNumbers` - An array of ouNumbers from which to gather course data.
`downloadedCourses` - An array of course data that includes all the HTML pages from each course.
`results` - An array of the results found from searching all the courses.

-----

##### Formats

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

##### Functionality
- Gather the ouNumbers
- Send the ouNumbers to downloadCourses
- Gather the search settings from the user
- Send the results to displayResults

-----


## downloadCourses()
