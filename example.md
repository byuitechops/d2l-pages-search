#d2l-pages-search

##Problem Description

At BYU-Idaho, teachers and employees need to find parts of courses that are either broken or need to be fixed in some way.  This program will allow the user to locate the problem the user is looking for and then simply provide a way to fix the problem.

##Design Overview

The program will search all of the courses in I-Learn using a library that Joshua McKinney wrote within the last month.  The program will be run from inside I-Learn, via an HTML page.  This will allow easy access for Joshua McKinney's library to quickly search the contents of any course.  The program will display the results to the user in a way that they understand and can easily navigate to and then fix the problem.  The user will be able to search by the actual text that the user can see on each course page, or by the CSS Selector, which would return all the occurrances of that selector in the course.

##Interface Design

The program will consist of a graphical user interface embedded in an HTML page in an I-Learn Course.  The interface will consist of two mechanisms for the user to input information, and three output mechanisms.