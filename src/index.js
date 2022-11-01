import { initializeApp} from 'firebase/app'
import { 
         getFirestore, collection, onSnapshot, doc,
         query, where, getDoc
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
initializeApp(firebaseConfig)

//init services:
const db = getFirestore()

//init collection ref:
const colRef = collection(db, 'Users')

//queries
const q = query(colRef, where("userName", "==", "user1"))

//get collection data from query above:
let users = []
onSnapshot(q, (snapshot) => {
  snapshot.docs.forEach((doc) => {
    users.push({ ...doc.data(), id: doc.id })
  })
  console.log(users)  //print data in users[] to console
})
//attempt to write data in users[] in html (doesn't work):
document.getElementById("test").innerHTML = "" + users[0];  //undefined

//get a single document:
const docRef = doc(db, 'Users', 'user1')
//print user1's data to the console:
onSnapshot(docRef, (doc) => {
  console.log(doc.data(), doc.id)
})

//get a single document (doesn't work):
const docRef2 = doc(db, 'user1Classes', 'Calculus')
//print user1Classes data to console (Calculus is undefined):
onSnapshot(docRef2, (doc) => {
  console.log(doc.data(), doc.id)
})

//const docRef = doc(db, 'Users')