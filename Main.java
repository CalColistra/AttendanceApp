package org.example;

public class Main {
    public static void main(String[] args){

        //Setting up database for access (ONLY EDIT VARIABLE CONTENTS)
        databaseEditor dbEditor = new databaseEditor();
        //Replace apiKeyLocation with YOUR individual API Key since file path will be different
        String apiKeyLocation = "C:\\Users\\micha\\IdeaProjects\\AttendanceAppDatabase\\adminsdk_firebase.json";
        //Replace databaseURL with the url of YOUR database
        String databaseURL = "https://attendanceapp-se-default-rtdb.firebaseio.com";

        try {
            dbEditor.updateInitialize(apiKeyLocation, databaseURL);
        }
        catch(Exception e) {
            System.out.println("Exception " + e + " occurred" );
        }
        //End of database setup (Edit Away Below)

        //Write a fake test class to the database
        try {
            dbEditor.databaseWriteTest();
        }
        catch(Exception e) {
            System.out.println("Exception " + e + " occurred" );
        }

        //attempt to update the test class
        try {
            dbEditor.databaseUpdateTest();
        }
        catch(Exception e) {
            System.out.println("Exception " + e + " occurred" );
        }

        //clear room number from the test class
        try {
            dbEditor.clearDocumentData("Classes","TestClass","Room");
        }
        catch(Exception e) {
            System.out.println("Exception " + e + " occurred" );
        }
    }
}