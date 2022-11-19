package org.example;

import com.google.api.core.ApiFuture;
import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.firestore.*;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.cloud.FirestoreClient;

import java.io.FileInputStream;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ExecutionException;

public class databaseEditor {
    //The database object
    private Firestore db;

    //The database options object
    private FirebaseOptions options;

    //No argument constructor (Must use updateInitialize in order to create functioning access)
    public databaseEditor(){

        //Only needed to create an empty databaseEditor object
        //Sets values to a default null
        db = null;
        options = null;
    }

    public void updateInitialize(String apiKey, String databaseURL) throws IOException {

        //Store apikey
        FileInputStream serviceAccount = new FileInputStream(apiKey);

        //Ask google's api for access to our database
        options = FirebaseOptions.builder()
                .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                .setDatabaseUrl(databaseURL)
                .build();

        //Create the link between our program and the firebase
        FirebaseApp.initializeApp(options);
        db = FirestoreClient.getFirestore();
    }

    //This method clears a data field in a specified document (Does not delete the field)
    public void clearDocumentData(String collection, String document, String field) throws ExecutionException, InterruptedException{

        //get a reference to the document we want to change
        DocumentReference docRef = db.collection(collection).document(document);

        //Select the data field we want to delete
        Map<String, Object> updates = new HashMap<>();
        updates.put(field, FieldValue.delete());

        // Update and delete the data field in the document
        ApiFuture<WriteResult> writeResult = docRef.update(updates);
        System.out.println("Update time : " + writeResult.get());
        System.out.println("Cleared data from: " + collection + "/" + document + "/" + field);
    }

    //This method totally deletes a document from the database
    public void totalDeleteDocument(String collection, String document) throws ExecutionException, InterruptedException{

        //Delete document at location collection/document
        ApiFuture<WriteResult> writeResult = db.collection(collection).document(document).delete();
        System.out.println("Update time : " + writeResult.get().getUpdateTime());
        System.out.println("Deleted document at location: " + collection + "/" + document);
    }

    public void databaseUpdateTest() throws ExecutionException, InterruptedException {

        //Select what we want to edit
        DocumentReference docRef = db.collection("Classes").document("TestClass");

        // (async) Update one field
        docRef.update("Room",69);

        //Get what we want to print
        docRef = db.collection("Classes").document("TestClass");

        // asynchronously retrieve the document
        ApiFuture<DocumentSnapshot> snapshot = docRef.get();

        //Prepare document to be read
        DocumentSnapshot document = snapshot.get();
        if (document.exists()) {
            System.out.println("Updated document data: " + document.getData());
        } else {
            System.out.println("No such document!");
        }
    }
    public void databaseWriteTest() throws ExecutionException, InterruptedException {

        // Create a Map to store the data we want to set
        Map<String, Object> docData = new HashMap<>();
        docData.put("Name", "Intro to Firebase");
        docData.put("Room", 420);
        docData.put("Building", "The Thunder Dome");

        // Add a new document (asynchronously) in collection "Classes" with id "TestClass"
        ApiFuture<WriteResult> future = db.collection("Classes").document("TestClass").set(docData);
        System.out.println("Data added at update time : " + future.get().getUpdateTime());

        //Select what we want to see
        DocumentReference docRef = db.collection("Classes").document("TestClass");

        // asynchronously retrieve the document
        ApiFuture<DocumentSnapshot> snapshot = docRef.get();

        //Prepare the document to be read
        DocumentSnapshot document = snapshot.get();
        if (document.exists()) {
            System.out.println("Document data: " + document.getData());
        } else {
            System.out.println("No such document!");
        }
    }
}
