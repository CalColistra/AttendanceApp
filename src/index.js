import { initializeApp} from 'firebase/app'
import { 
         getFirestore, collection, onSnapshot, doc,
         query, where, getDocs, Timestamp, getDoc
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
//  init currentUser variable:
let currentUser = document.getElementById("currentUser").textContent;
console.log(currentUser);  //  log it
// init reference to element with id showTable
let showTable = document.getElementById("showTable");
//  init reference to element with id currnetClass
let currentClass = document.getElementById("currentClass").textContent;

//------------------------------------------------------------------

//  function that executes every half second:
setInterval(function() { // every half second check currentClass
  //  grab the currentClass content from index.html:
  currentClass = document.getElementById("currentClass").textContent; 
  //console.log(currentClass);
  //  grab thecurrentUser content from index.html:
  currentUser = document.getElementById("currentUser").textContent;
  //console.log(currentUser);
  //  check if show table content from index.html is true:
  let showTableBool = showTable.textContent;
  if (showTableBool == 'true') {  //  if showTableBool == true
    populateTable(currentUser, currentClass);  //  call populateTable
    showTable.innerText = 'false';  //  set showTable content to false
  }
}, 500);   //time interval for every half second

//------------------------------------------------------------------

let names = [];  //array to be used in homePage
// function that populates the home page with course names from the database:
async function populateHomePage() {
  //  grab 'Classes' collection from database:
  const querySnapshot = await getDocs(collection(db, "Classes"));
  //  iterate through each doc in 'Classes':
  querySnapshot.forEach((doc) => {
    //push the Name of each 'Class' doc into names[]:
    names.push(doc.data().Name);
  })
  //  iterate through names[] array:
  for (let i = 1; i < (names.length) + 1; i++) {
    //  create strings for each html element id's:
    let currentID = "class" + i;
    //  grab a reference to new html elements:
    let elementRef = document.getElementById(currentID);
    //  write the name of each class in html element:
    elementRef.innerText = names[i-1];
  }
}
populateHomePage();

//------------------------------------------------------------------

async function populateTable(user, currentClass) {
  let stamps = [];
  let table = "<table class='dataTable'>";
  table = table + "<tr> <th>Class Date</th> <th>Time of Swipe</th> <th>Attendance Mark</th> </tr>";
  //  grab 'RFID_scans' collection from database:
  const docRef = doc(db, "RFID_scans", user);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    stamps.push(docSnap.data().SoftwareEngineering);
    //console.log("Document data:", stamps);
  } else {
    // doc.data() will be undefined in this case
    console.log("No such document!");
  }
  let dateStamps;
  let timeStamps;
  let marks = "unknown";
  for (let i = 0; i < stamps[0].length; i++) {
    //  convert firebase time to normal:
    let fireBaseTime = new Date(stamps[0][i].seconds * 1000 + stamps[0][i].nanoseconds / 1000000,);
    dateStamps = fireBaseTime.toDateString();
    timeStamps = fireBaseTime.toLocaleTimeString();
    table = table + "<tr> <td>"+ dateStamps +"</th> <th>"+timeStamps+"</th> <th>"+marks+"</th> </tr>";
  }
  table = table + "</table>";
  let div = document.getElementById("table");
  div.innerHTML = table;
}

//------------------------------------------------------------------

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