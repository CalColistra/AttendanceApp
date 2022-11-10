import { initializeApp} from 'firebase/app'
import { 
         getFirestore, collection, onSnapshot, doc,
         query, where, getDoc, Timestamp
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

//init firebase app:
initializeApp(firebaseConfig);

//init services:
const db = getFirestore();

//print a timestamp:
let time = new Timestamp();
time = Timestamp.now();
time = time.toDate();
console.log(time);

//grab html test element:
let test = document.getElementById("test");
//grab Classes collection from database:
const colRef = collection(db, 'Classes');
//make a query where name = software engineering
const q = query(colRef, where("Name", "==", "Software Engineering"));
let se = [];  //init ana array
//whenever there is a change in this data query, add it to array and log to console:
onSnapshot(q, (snapshot) => { 
  snapshot.docs.forEach((doc) => {
    se.push({...doc.data(), id: doc.id });
  })
  console.log(se);
  test.innerHTML = se;
})

