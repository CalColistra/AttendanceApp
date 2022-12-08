import { initializeApp} from 'firebase/app'
import { 
         getFirestore, collection, onSnapshot, doc,
         query, where, getDocs, Timestamp, getDoc, setDoc,
         updateDoc, arrayUnion
       } from 'firebase/firestore'


// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyCwhPomXza0WCgnI16ZRsm8xtBPn8wMH9E",
    authDomain: "attendanceapp-se.firebaseapp.com",
    databaseURL: "https://attendanceapp-se-default-rtdb.firebaseio.com",
    projectId: "attendanceapp-se",
    storageBucket: "attendanceapp-se.appspot.com",
    messagingSenderId: "714469744918",
    appId: "1:714469744918:web:9f771a7a3b43bcc2f13037",
    measurementId: "G-YL4JNFK07K"
  };

//------------------------------------------------------------------

//  init firebase app:
initializeApp(firebaseConfig);
//init services:
const db = getFirestore();
//  init currentPage variable
let currentPage = document.getElementById("currentPage").textContent;
console.log(currentPage);  // log it
// init reference to element with id showTable
let showTable = document.getElementById("showTable");
// init reference to element with id showClasses
let showClasses = document.getElementById("showClasses");
//  init reference to element with id currnetClass
let currentClass = document.getElementById("currentClass").textContent;
// array of users:
const allUsers = ['20fbc924', '2183fc1d'];
//  variable for how early one can swipe into a class:
let earlySwipe = 35;  // 35 minutes
earlySwipe = earlySwipe * 60000 +1000;  // convert to milliseconds
//  variable for how late one can swipe into class and still be marked on time:
let lateSwipe = 5;  //  5 minutes
lateSwipe = lateSwipe *60000 +1000;
let test = true;
//------------------------------------------------------------------
//  function that executes every .3 of a second:
setInterval(function() { // run every half second
  //  check if show table content from index.html is true:
  let showTableBool = showTable.textContent;
  if (showTableBool == 'true') {
    //  grab the currentClass content from index.html:
    let currentClass = document.getElementById("currentClass").textContent; 
    //  grab thecurrentUser content from index.html:
    let currentUser = document.getElementById("currentUser").textContent;
    populateTable(currentUser, currentClass);  //  call populateTable
    showTable.innerText = 'false';  //  set showTable to false
  }
  //  check if showClasses content from index.html is true
  let showClassesBool = showClasses.textContent;
  if (showClassesBool == "true") {
    showClasses.innerText = "false";  // set it to false
    populateHomePage();  //  call populateHomePage
  }
  //  check if the admin is trying to initialize a new class:
  if ((document.getElementById("initNewClass").textContent) == "true") {
    //  retrieve all the data entered by the admin:
    //  get the name of class:
    let className = document.getElementById("newClassName").textContent;
    //  get days of the week that the class will meet:
    let classDays = document.getElementById("newClassDays").textContent;
    //  get the time of when the class begins:
    let timeSlotStart = document.getElementById("newClassTimeSlotStart").textContent;
    //  get the time of when the class ends:
    let timeSlotEnd = document.getElementById("newClassTimeSlotEnd").textContent;
    //  get the first day of the class:
    let firstDay = document.getElementById("newClassStartDay").textContent;
    //  get the last day of the class:
    let lastDay = document.getElementById("newClassEndDay").textContent;
    //  get the room number:
    let roomNumber = document.getElementById("roomNumber").textContent;
    //  call initializeClass and pass it all of the new data:
    initializeClass(className, classDays, timeSlotStart, timeSlotEnd, firstDay, lastDay, roomNumber);
    //console.log("called initClass");  //  console log for testing
    document.getElementById("initNewClass").innerText = "false";  //set initNewClass value to false
  }
  //  check if the admin is trying to add student to a class:
  if ((document.getElementById("addStudentBool").textContent) == "true") {
    //  get the name of the class that they are trying to add to:
    let className = document.getElementById("addingToClass").textContent;
    //  get the student ID of the student they are trying to add:
    let studentID = document.getElementById("studentIdVal").textContent;
    //console.log("calling addStudent");  //log to console for testing
    //  call addStudent and pass it the className and Student ID:
    addStudent(className, studentID);
    //  set addStudentBool to false:
    document.getElementById("addStudentBool").innerText = "false";
  }
  //updateScans();
  if (test) {
    updateClasses();
    test = false;
  }
}, 300);   //time interval for every half second (300ms = .3 seconds)
//------------------------------------------------------------------
//  function that updates the RFID_scans array for students subcollections
//  that exist in specific class documents
async function updateClasses() {
  for (let i = 0; i < allUsers.length; i++) {  //  iterate through users
    let user = allUsers[i];  //  get current user
    const userRef = doc(db, "Users", user);  //  make a reference to Users collection
    const userSnap = await getDoc(userRef);  //snapshot data
    let userData = [];  //  array to be given user's data
    if (userSnap.exists()) {  //  check if snapshot exists
      //  push user's data from db to array:
      userData.push(userSnap.data());
      //console.log("Document data:", userData);
    } else {
      // doc.data() will be undefined in this case
      console.log("No such document!");
    }
    let userClasses = [];  //  array to be given the current user's classes
    userClasses.push(userData[0].Classes);  //  push classes to userClasses[]
    let allScans = [];  //  array to be given current user's scans
    allScans.push(userData[0].allScans);  //  push scans to allScans[]
    //  iterate through current user's classes:
    for (let i = 0; i < userClasses[0].length; i++) {
      let currentClass = userClasses[0][i];  //  get current class to work with
      //console.log("NEW CLASS: "+currentClass );  //  logging for debugging
      //  make a reference to the user's subcollection in the current class
      const classRef = doc(db, "Classes", currentClass, "Students", user);
      const classSnap = await getDoc(classRef);  //snapshot data
      let meetings = [];  //  array to be given user's meetings
      if (classSnap.exists()) {  //  check if snapshot exists
        meetings.push(classSnap.data());  //  push data to meetings[]
        //console.log("Document data:", meetings);
      } else {
        // doc.data() will be undefined in this case
        console.log("No such document!");
      }
      //  make a reference to classes collection:
      const timeRef = doc(db, "Classes", currentClass);
      const timeSnap = await getDoc(timeRef);  //snapshot data
      let times = [];  //  array to be given class's data
      if (classSnap.exists()) {  //  check if snapshot exists
        times.push(timeSnap.data());  //  push data to time[]
        //console.log("start&end times:", times);
      } else {
        // doc.data() will be undefined in this case
        console.log("No such document!");
      }
      let startTime = times[0].startTime;  //  get class's starting time
      let endTime = times[0].endTime;  //  get class's starting time
      let startDay = times[0].startDate;  //  get class's starting date
      let endDay = times[0].endDate;  //  get class's ending date
      //console.log(startTime, endTime, startDay,endDay);
      //  convert from firebase timestamp to Date object:
      let startDate = new Date(startDay);
      //  convert from firebase timestamp to Date object:
      let endDate = new Date(endDay);
      startDate.setHours(0);  //  set hours to 0
      endDate.setHours(0);  //  set hours to 0
      //console.log(allScans);

      let userSwipes = [];  //  array to be given user's swipes
      //  iterate through allScans[]:
      for (let i=0; i < allScans[0].length; i++) {
        let fbTS = allScans[0][i];  //  get firebase timestamp
        let aDate = new Date(fbTS.toDate());  //  convert to date object
        userSwipes.push(aDate);  //  push date to userSwipes
      }
      let userMeetings = [];  //  array to be given user meetings
      //  iterate through RFID_scans array from db:
      for (let i=0; i < meetings[0].RFID_scans.length; i++) {
        //  get the firebase timestamp:
        let fbTS = meetings[0].RFID_scans[i];
        let aDate = new Date(fbTS.toDate());  // convert to date object
        userMeetings.push(aDate);  //  push to userMeetings[]
      }
      //  logs for debugging data:
      /*
      console.log("userMeetings[]: " + userMeetings);
      console.log("userSwipes[]: " + userSwipes);
      console.log("startDate: " + startDate);
      console.log("endDate: " + endDate);
      console.log("startTime: " + startTime);
      console.log("endTime: " + endTime);
      */
     //  array to hold userMeetings converter to strings:
     let stringUserMeetings = [];
     for (let i=0; i < userMeetings.length; i++) {  //  iterate through userMeetings
      // convert userMeetings[i] to string & push to new array:
      stringUserMeetings.push(String(userMeetings[i]));
     }
     //console.log(stringUserMeetings);
      for (let i=0; i < userSwipes.length; i++) {  //  iterate through userSwipes[]
        //  new variable to hold current date:
        let checkSwipe = new Date(userSwipes[i]);
        checkSwipe.setHours(0);  //  set hours to 0
        checkSwipe.setMinutes(0);  //  set min to 0
        checkSwipe.setSeconds(0);  //  set sec to 0
        //console.log(checkSwipe+" vs "+userMeetings);  //  log for debugging
        //  check if user has swiped on the same day as a class meeting:
        if (stringUserMeetings.includes(String(checkSwipe))) {   
          let swipeTime = userSwipes[i];  //  get the users swipe time
          //  get the index of the meeting that the user has potentially swiped into:
          let ind = stringUserMeetings.indexOf(String(checkSwipe));
          //  init a date object for the start of this class meeting:
          let starting = new Date(userMeetings[ind]);
          //console.log(ind);
          //  set the hours and minutes of starting to the start time of the class
          starting.setHours(startTime.substring(0,2));
          starting.setMinutes(startTime.substring(3,5));
          //  init a date object for the end of this class meeting:
          let ending = new Date(userMeetings[ind]);
          //  set the hours and minutes of ending to the end time of the class
          ending.setHours(endTime.substring(0,2));
          ending.setMinutes(endTime.substring(3,5));
          //  check if time of userSwipes[i] is valid for given class meeting,
          //  check if it is early, or before the end of class:
          if ( ((swipeTime.getTime()) >= (starting.getTime() - earlySwipe)) && 
            (swipeTime <= ending) ) {
              //console.log("if was true");  //  log for debugging
              //  update string array
              stringUserMeetings[ind] = String(userSwipes[i]);
              //  update userMeetings[] with the valid swipe:
              userMeetings[ind] = userSwipes[i];
          }
        }
  
      }
      // update document in collection 'Classes' with the stamps array:
      await updateDoc(doc(db, "Classes", currentClass, "Students", user), {
        RFID_scans: userMeetings
      });
    }
  }
  
}
//------------------------------------------------------------------
//  function that looks for new any scans and updates a log of previous scans:
async function updateScans() {
  //  iterate through users array:
  for (let i = 0; i < allUsers.length; i++) {
    let user = allUsers[i];  //  get current user
    //  grab the users doc from'RFID_scans' collection from database:
    const docRef = doc(db, "RFID_scans", user);
    const docSnap = await getDoc(docRef);  //snapshot data
    let data = [];  //array to be given doc data
    if (docSnap.exists()) {  //  check if snapshot exists
      data.push(docSnap.data().time_stamp);  //  push time_stamp array to data
      //console.log("Document data:", data);  // log for debugging
    } else {
      // doc.data() will be undefined in this case
      console.log("No such document!");
    }
    let sec = data[0].seconds;  //  get the seconds
    let nanoSec = data[0].nanoseconds;  //  get the nanoseconds
    let newStamp = new Timestamp(sec,nanoSec);  //  create a firebase timestamp

    let data2 = [];  //  init data2[] to be given user data
    const docRef2 = doc(db, "Users", user);  //  make a reference to User's collection
    const docSnap2 = await getDoc(docRef2);  //snapshot data
    if (docSnap2.exists()) {  //  check if snapshot exists
      //  push most recent scan names from db to data2[]:
      data2.push(docSnap2.data().most_recent_scan);
      //  console.log("Document data2:", data2);  //  log for debugging
    } else {
      // doc.data() will be undefined in this case
      console.log("No such document!");
    }
    //  init oldStamp var to hold the previous scan
    let oldStamp = new Timestamp(data2[0].seconds, data2[0].nanoseconds);
    //  check if oldStamp is not the same as the newStamp:
    if (newStamp != oldStamp) {
      //  if so, add it to the allScans[] array in the db:
      setDoc(docRef2, { allScans: arrayUnion(newStamp) }, { merge: true });
      await updateDoc(docRef2, {  //  update most_recent_scan in db
        most_recent_scan: newStamp
      });
      await updateDoc(docRef, {  //  update time_stamp in db:
        time_stamp: newStamp
      });
    }
  }
}
//------------------------------------------------------------------
// function that populates the home page with course names from the database:
async function populateHomePage() {
  //  grab thecurrentUser content from index.html:
  let currentUser = document.getElementById("currentUser").textContent;
  //  grab the user doc from'Users' collection from database:
  const docRef = doc(db, "Users", currentUser);
  const docSnap = await getDoc(docRef);  //snapshot data
  let classNames = [];  //array to be used in homePage
  if (docSnap.exists()) {
    //  push class names from db to array
    classNames.push(docSnap.data().Classes);
    //console.log("Document data:", classNames[0]);
  } else {
    // doc.data() will be undefined in this case
    console.log("No such document!\ncurrentUser= " + currentUser);
  }
  //  write the inner html to show users classes:
  let elementRef = document.getElementById("homePage");
  elementRef.style.display = "flex";
  //  iterate through names[] array:
  for (let i = 0; i < classNames[0].length; i++) {
    //  write the class name in the html cards:
    document.getElementById("class"+(i+1)).innerText = classNames[0][i];
    //  init a string for getting the html card element by its id
    let s = "showClass" + (i+1);
    let show = document.getElementById(s);  //  grab the card element by ID
    show.style.display = "flex";  //display the html card element to the user
  }
}
//------------------------------------------------------------------
//  function that populates a table of time stamps of 
//  the current user's RFID scans:
async function populateTable(user, currentClass) {
  //  array to later be initialized with the user's time stamps:
  let stamps = [];
  //  grab the student from the 'Students' subcollection inside the current class's document:
  const docRef = doc(db, "Classes", currentClass, "Students",  user);
  const docSnap = await getDoc(docRef);  //  get a reference to the document
  if (docSnap.exists()) {  //  check if the reference exists
    //  get the RFID_scans array for the current student:
    stamps.push(docSnap.data().RFID_scans);
    //console.log("Document data:", stamps);  //  log to console for testing
  } else {  //  in this case, the reference did not exist
    // doc.data() will be undefined in this case
    console.log("No such document!");  //  log it to the console
  }

  //  initialize a string for writing the table to index.html:
  let table = "";
  //  get today's date:
  let date = new Date();  //  init date object
  let day = date.getDate();
  let month = date.getMonth() + 1;
  let year = date.getFullYear();
  //  date to be printed:
  let printDate = month+"-"+day+"-"+year;
  //  arrange the date:
  let currentDate = day+"-"+month+"-"+year;
  //  show the current date on the html page:
  table = "<div class='dataTable'>"+"Todays's Date: <strong>"+printDate+"</strong></div>";
  let stringDates = [];  //  array to be given dates in string form
  for (let i = 0; i < stamps[0].length; i++) {  //  iterate through the time stamps
    //  convert firebase time to normal time:
    let fireBaseTime = new Date(stamps[0][i].seconds * 1000 + stamps[0][i].nanoseconds / 1000000,);
    stringDates.push(fireBaseTime.toDateString());  //  push string date to stringDates
  }
  let fixedDates = [];  //  array to be given months and days converted to numbers
  for (let i = 0; i < stringDates.length; i++) {  //  iterate through stringDates[]
    //  check if the stringDates[i] = a month, then change the month to its number value
    //  also add the day to the end of the string and set fixedDates[i] == to the string:
    if (stringDates[i].substring(4,7) == "Jan") fixedDates[i] = "01" + stringDates[i].substring(8,10);
    else if (stringDates[i].substring(4,7) == "Feb") fixedDates[i] = "02"+ stringDates[i].substring(8,10);
    else if (stringDates[i].substring(4,7) == "Mar") fixedDates[i] = "03"+ stringDates[i].substring(8,10);
    else if (stringDates[i].substring(4,7) == "Apr") fixedDates[i] = "04"+ stringDates[i].substring(8,10);
    else if (stringDates[i].substring(4,7) == "May") fixedDates[i] = "05"+ stringDates[i].substring(8,10);
    else if (stringDates[i].substring(4,7) == "Jun") fixedDates[i] = "06"+ stringDates[i].substring(8,10);
    else if (stringDates[i].substring(4,7) == "Jul") fixedDates[i] = "07"+ stringDates[i].substring(8,10);
    else if (stringDates[i].substring(4,7) == "Aug") fixedDates[i] = "08"+ stringDates[i].substring(8,10);
    else if (stringDates[i].substring(4,7) == "Sep") fixedDates[i] = "09"+ stringDates[i].substring(8,10);
    else if (stringDates[i].substring(4,7) == "Oct") fixedDates[i] = "10"+ stringDates[i].substring(8,10);
    else if (stringDates[i].substring(4,7) == "Nov") fixedDates[i] = "11"+ stringDates[i].substring(8,10);
    else if (stringDates[i].substring(4,7) == "Dec") fixedDates[i] = "12"+ stringDates[i].substring(8,10);
  }
  let nextClass = "";  //  variable to be given the next class
  let thisMonth = Math.floor(month);  //  convert string to number
  let thisDay = Math.floor(day);  //  convert string to number
  let thisYear = Math.floor(year);  //  convert string to number
  for (let i = 0; i < fixedDates.length; i++) {  //  iterate throuhg fixed days
    let checkDay = Math.floor(fixedDates[i].substring(2,4));  //  convert string to number
    let checkMonth = Math.floor(fixedDates[i].substring(0,2));  //  convert string to number
    //  check if fixedDates[i] is the next class according to todays date
    if ( (thisMonth == checkMonth) && (thisDay <= checkDay)) {
      nextClass = stringDates[i];  //  set nextClass to the next class
      break;  //  break out of for loop
    }
    else if (thisMonth == (checkMonth-1)) {
      nextClass = stringDates[i];  //  set nextClass to the next class
      break;  //  break out of for loop
    }
  }

  //  show the user their next class
  table = table + "<div class='dataTable'>"+"You're next class is: <strong>"+nextClass+"</strong></div>" + "</br>";
  table = table + "<table class='dataTable'>";  //  add table header
  //  add table headers to the string:
  table = table + "<tr> <th>Class Date</th> <th>Time of Swipe</th> <th>Attendance Mark</th> </tr>";

  let dateStamps;  //  variable to hold dates time stamps
  let timeStamps;  //  variable to hold time from the time stamps
  //  variable to indicate whether the time stamp is considered present, late, or absent:
  let marks = "unknown";
  for (let i = 0; i < stamps[0].length; i++) {  //  iterate through the time stamps
    //  convert firebase time to normal time:
    let fireBaseTime = new Date(stamps[0][i].seconds * 1000 + stamps[0][i].nanoseconds / 1000000,);
    dateStamps = fireBaseTime.toDateString();  //  grab the date from the current time stamp
    timeStamps = fireBaseTime.toLocaleTimeString();  //  grab the time from the current time stamp

    let checkDay = Math.floor(fixedDates[i].substring(2,4));  //  convert string to number
    let checkMonth = Math.floor(fixedDates[i].substring(0,2));  //  convert string to number
    let checkYear = Math.floor(stringDates[i].substring(11,15));  //  convert string to number

    //  if the time is midnight that means the user has not swiped for this class:
    if (timeStamps == "12:00:00 AM") {  //  check if time is midnight
      //  check if the class meeting is in the past in the same month
      if ( (thisMonth >= checkMonth) && (thisDay > checkDay)) {
        timeStamps = "No Swipe";  //  set their timestamp to no swipe
        marks = "Absent";  //  set their mark to absent
      }
      //  check if the class meeting is in the last month:
      else if (thisMonth > checkMonth) {
        timeStamps = "No Swipe";  //  set their timestamp to no swipe
        marks = "Absent";  //  set their mark to absent
      }
      else {
        timeStamps = "TBD";  //  set their time stamp to TBD
        marks = "TBD";  //  set their mark to TBD
      }
      if (thisYear < checkYear) {  //  check if the class is next year
        timeStamps = "TBD";  //  set their time stamp to TBD
        marks = "TBD";  //  set their mark to TBD
      }
    }
    else if (timeStamps != "12:00:00 AM") {  //  check if user has swiped
      let timeRef = doc(db, "Classes", currentClass);
      let timeSnap = await getDoc(timeRef);  //snapshot data
      let times = [];
      marks = "Absent";
      if (timeSnap.exists()) {
        times.push(timeSnap.data());
        //console.log("start&end times:", times);
      } else {
        // doc.data() will be undefined in this case
        console.log("No such document!");
      }
      let startTime = times[0].startTime;
      let endTime = times[0].endTime;
      let starting = new Date(fireBaseTime);
      starting.setHours(startTime.substring(0,2));
      starting.setMinutes(startTime.substring(3,5));
      let ending = new Date(fireBaseTime);
      ending.setHours(endTime.substring(0,2));
      ending.setMinutes(endTime.substring(3,5));
      if ( ((fireBaseTime.getTime()) >= (starting.getTime() - earlySwipe)) && 
            (fireBaseTime < starting) ) {
              marks = "Early";
          }
      else if ( ((fireBaseTime.getTime()) >= starting.getTime()) && 
            (fireBaseTime.getTime() <= starting.getTime() + lateSwipe) ) {
              marks = "Present";
      }
      else if ( ((fireBaseTime.getTime()) >= starting.getTime() + lateSwipe) && 
            (fireBaseTime.getTime() <= ending.getTime()) ) {
              marks = "Late";
      }
    }
    //  add a table row with the time stamp data to the table string
    table = table + "<tr> <td>"+ dateStamps +"</th> <th>"+timeStamps+"</th> <th>"+marks+"</th> </tr>";
  }
  table = table + "</table>";  //  end the table element
  let div = document.getElementById("table");  //  grab the table element from index.html
  div.innerHTML = table;  //  write the table string to the table element
}
//------------------------------------------------------------------
//  a function that adds or updates a class in the database
async function initializeClass(className, classDays, timeSlotStart, timeSlotEnd, firstDay, lastDay, roomNumber) {
  let days = [];  //  array to be given day values
  days = classDays.split(/[, ]+/);  //  split the string of days and put them into days[] array
  // Add a new document in collection "Classes" with data from the admin
  await setDoc(doc(db, "Classes", className), {
    Name: className,
    roomNumber: roomNumber,
    startDate: firstDay,
    endDate: lastDay,
    startTime: timeSlotStart,
    endTime: timeSlotEnd,
    classDays: days,
  });
  
  let info = [];  //  array to be given data about the class from the db
  //  grab class info 'Classes' collection from database:
  const docRef = doc(db, "Classes", className);
  const docSnap = await getDoc(docRef);  //  make a reference to the new class
  if (docSnap.exists()) {  // check if the reference exists
    info.push(docSnap.data());  //  push data into info array
    //console.log("Document data:", info);  //  log to console for testing
  }  else {  //  in this case the reference was invalid
    // doc.data() will be undefined in this case
    console.log("No such document!");  //  log error to console
  }
  let startDate = new Date(info[0].startDate);  //  get the start date of the class
  let endDate = new Date(info[0].endDate);  //  get the end date of the class

  for (let i = 0; i < days.length; i++) {  //  iterate through days[]
    //  swap the days strings with their corrresponding number values:
    if (days[i] == "Monday") days[i] = 1;
    else if (days[i] == "Tuesday") days[i] = 2;
    else if (days[i] == "Wednesday") days[i] = 3;
    else if (days[i] == "Thursday") days[i] = 4;
    else if (days[i] == "Friday") days[i] = 5;
  }  
  let allDates = [];  //  array to be given time stamps of class meetings
  let begin = startDate;  //  variable that is incremented day by day
  //  increment through all days between the starting date and ending date:
  while (begin <= endDate) {
    let theDay = begin.getDay();  //  get the current day
    //  check if the day of the week matches when the class meets:
    if (days.includes(theDay)) {
      //  set time of time stamp to class start time:
      //begin.setTime(timeSlotStart);
      allDates.push(new Date(begin));  // push this day into allDates
    }
    begin.setDate(begin.getDate()+1);  //  increment begin to next day
  }
  let stamps = [];  //  array to be given data from allDates[]
  for (let i = 0; i < allDates.length; i++) {  // increment through allDates[]
    //  convert the date to a firebase Time stamp and push it to stamps[]:
    stamps.push(Timestamp.fromDate(allDates[i]));
  }
  // update document in collection 'Classes' with the stamps array:
  await updateDoc(doc(db, "Classes", className), {
    classMeetings: stamps
  });
}
//------------------------------------------------------------------
//  function that adds a student to a class in the database:
async function addStudent(className, studentID) {
  let info = [];  //  array to be given class data from db
  //  grab class info 'Classes' collection from database:
  const docRef = doc(db, "Classes", className);
  const docSnap = await getDoc(docRef);  //  get a snapshot of the reference
  if (docSnap.exists()) {  //  check if the reference exists
    info.push(docSnap.data());  //  push the data into info[]
    //console.log("Document data:", info);  //  log to console for testing
  }  else {  //  in this case the reference was invalid
    // doc.data() will be undefined in this case
    console.log("No such document!");  //  log the error to console
  }
  //  grab the starting date of the class from info[]:
  let startDate = new Date(info[0].startDate);
  //  grab the ending date of the class from info[]:
  let endDate = new Date(info[0].endDate);
  //  grab the days of the week which the class meets from info[]:
  let days = info[0].classDays;
  for (let i = 0; i < days.length; i++) {   //  increment through days[]
    //  swap the days strings with their corrresponding number values:
    if (days[i] == "Monday") days[i] = 1;
    else if (days[i] == "Tuesday") days[i] = 2;
    else if (days[i] == "Wednesday") days[i] = 3;
    else if (days[i] == "Thursday") days[i] = 4;
    else if (days[i] == "Friday") days[i] = 5;
  }
  let allDates = [];  //  array to be given time stamps of class meetings
  let begin = startDate;  //  variable that is incremented day by day
  //  increment through all days between the starting date and ending date:
  while (begin <= endDate) {
    let theDay = begin.getDay();  //  get the current day
    //  check if the day of the week matches when the class meets:
    if (days.includes(theDay)) {
      begin.setHours(0,0,0);  //  set time to midnight
      allDates.push(new Date(begin));  //  push this day into allDates[]
    }
    begin.setDate(begin.getDate()+1);  //  increment begin to next day
  }
  let stamps = [];  //  array to be given data from allDates[]
  for (let i = 0; i < allDates.length; i++) {  // increment through allDates[]
    //  convert the date to a firebase Time stamp and push it to stamps[]:
    stamps.push(Timestamp.fromDate(allDates[i]));
  }
  //  Add the new array in the student document which is in the 'Students' subcollection
  //  in the class document located in 'Classes' collection:
  await setDoc(doc(db, "Classes", className, "Students", studentID), {
    RFID_scans: stamps
  });
  // update document in collection 'Users' with the class name:
  await updateDoc(doc(db, "Users", studentID), {
    Classes: arrayUnion(className)
  });

}
//------------------------------------------------------------------

//------------------------------------------------------------------
//  below is code that may be needed later:


//  the following is code for how to use firebase Timestamp object:
/*
//print a timestamp:
let time = new Timestamp();
time = Timestamp.now();
time = time.toDate();
console.log(time);
*/


// the following is code for querying:
/*
//grab Classes collection from database:
const colRef = collection(db, 'Classes');
//make a query where name = software engineering
const q = query(colRef, where("Name", "==", "Software Engineering"));
let se = [];  //init an array
let theName;
//whenever there is a change in this data query, add it to array and log to console:

onSnapshot(q, (snapshot) => { 
  snapshot.docs.forEach((doc) => {
    se.push({...doc.data(), id: doc.id });
  })
  console.log(se);
  studentData.push(Object.entries(se[0]));
  document.getElementById("test").innerText = Object.entries(se[0]);
  theName = se[0].Name;
  console.log(theName);
})
console.log(studentData);


// access first entry / get first Student
//const firstStudent = se[0].Students[1];
//console.log("first student:" + firstStudent);

// the last entry always has the latest data
// easily get last entry with .at(-1)
//const sessions = se.at(-1).Sessions;
//console.log(sessions);
*/

 /*  Code for iterating through docs in a collection:
  //  grab 'Classes' collection from database:
  const querySnapshot = await getDocs(collection(db, "Users"));
  //  iterate through each doc in 'Classes':
  querySnapshot.forEach((doc) => {
    //push the Name of each 'Class' doc into names[]:
    names.push(doc.data().Name);
  })
  */