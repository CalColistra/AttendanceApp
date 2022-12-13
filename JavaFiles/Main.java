package org.example;

import java.util.ArrayList;
import java.util.HashMap;

public class Main {
    public static void main(String[] args) throws InterruptedException {

        // Setting up database for access (ONLY EDIT VARIABLE CONTENTS)
        databaseEditor dbEditor = new databaseEditor();
        // Replace apiKeyLocation with YOUR individual API Key since file path will be different
        String apiKeyLocation = "C:\\Users\\micha\\IdeaProjects\\AttendanceAppDatabase\\adminsdk_firebase.json";
        // Replace databaseURL with the url of YOUR database
        String databaseURL = "https://attendanceapp-se-default-rtdb.firebaseio.com";

        try {
            dbEditor.updateInitialize(apiKeyLocation, databaseURL);
        }
        catch(Exception e) {
            System.out.println("Exception " + e + " occurred" );
        }
        // End of database setup (Edit Away Below)

        // Create a test student and add related fields
        student testStudent = new student();
        testStudent.setName("The Hawk");
        testStudent.setStudentRFID("1332dgey");
        testStudent.addClass("Intro to Firebase", 23);

        // Add the test student to the database
        dbEditor.addDocumentData("Students", testStudent.getStudentRFID(), testStudent);

        // Read the Student object from the database and get the class section for Intro to Firebase
        System.out.println("Read the Student object from the database and get the class section for their first class");

        try {
            student testData = dbEditor.readDocumentDataStudent("Students",testStudent.getStudentRFID());
            System.out.println("Class: " + testData.getAClass(0) + "\nSection: " + testData.getSection(testData.getAClass(0)));
        }
        catch (Exception e){
            System.out.println("Exception " + e + " occurred");
        }


        // Create a testClass and add it the database
        // Fake Student list
        ArrayList<String> students = new ArrayList<String>();
        students.add("23jdk438");
        students.add("4342js21");
        students.add("fs93dn6s");

        // Create a new classSection
        classSection introToFirebase = new classSection("Intro to Firebase", "Dr. Nolan", 23, 4, 60, 120, students);
        classSection introToJava = new classSection("Intro to Java", "Dr. Nolan", 43, 4, 360, 480, students);

        // Add the classSection object to the database
        dbEditor.addDocumentData("Classes","Intro to Firebase", introToFirebase);
        dbEditor.addDocumentData("Classes","Intro to Java", introToJava);

        // Read the classSection object from the database and read the student list
        System.out.println("\nRead the classSection object from the database and read the student list for Intro to Firebase");

        try {
             classSection data = dbEditor.readDocumentDataClass("Classes","Intro to Firebase");
             System.out.println("Intro to Firebase students: " + data.getStudents());
        }
        catch (Exception e){
            System.out.println("Exception " + e + " occurred");
        }

        // Basic Search Test
        System.out.println("\nSearch Classes and display all classes with teacher Dr. Nolan");

        try {
            dbEditor.basicSearch("Classes", "teacher", "Dr. Nolan");
        }
        catch (Exception e){
            System.out.println("Exception " + e + " occurred");
        }
    }
}