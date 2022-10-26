import { initializeApp} from 'firebase/app'
import { 
    getFirestore, collection, getDocs
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

  //init firebase app
initializeApp(firebaseConfig)

//init services
const db = getFirestore()

//collection ref:
const userRef = collection(db, 'Users')

//get collection data
getDocs(userRef)
  .then((snapshot) => {
    let users = []
    snapshot.docs.forEach((doc) => {
      users.push({ ...doc.data(), id: doc.id })
    })
    console.log(users)
    document.getElementById("test").innerHTML = users;
  })
  .catch(err => {
    console.log(err.message)
  })
