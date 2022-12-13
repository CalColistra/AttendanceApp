package org.example;

import java.util.ArrayList;

public class student {

   private String name = "";
   private String studentRFID = "";
   private ArrayList<String> classList = new ArrayList<String>();
   private ArrayList<Integer> classSection = new ArrayList<Integer>();
   private ArrayList<Integer> classAbs = new ArrayList<Integer>();


    // Firebase no arg
    public student(){

    }

    // Full constructor
    public student(String name, String studentRFID, ArrayList<String> classList, ArrayList<Integer> classSection, ArrayList<Integer> classAbs){

        this.name = name;
        this.studentRFID = studentRFID;
        this.classList = classList;
        this.classSection = classSection;
        this.classAbs = classAbs;
    }

    // Constructor for a student with only a name
    public student(String name, String studentRFID){

        this.name = name;
        this.studentRFID = studentRFID;
    }

    public void setName(String name){
        this.name = name;
    }

    public void setStudentRFID(String studentRFID){
        this.studentRFID = studentRFID;
    }

    // Adds a new class and updates all related fields
    public void addClass(String className, int classSection){

        classList.add(className);
        this.classSection.add(classSection);
        classAbs.add(0);
    }

    // Adds one abs to the specified class name
    public void addAbs(String className){

        // Get the index of the related fields
        int index = classList.indexOf(className);

        //Add 1 to the abs count in the related field
        classAbs.set(index,classAbs.get(index) + 1);
    }

    // Get the total abs for one class
    public int getAbs(String className){

        // Get the index of the related fields and returns the value
         return classAbs.get(classList.indexOf(className));
    }

    //Get the name of a class
    public String getAClass(int index){
        return classList.get(index);
    }

    // Get the section number for a class
    public int getSection(String className){

        // Get the index of the related fields and returns the value
        return classSection.get(classList.indexOf(className));
    }

    // Returns the array for classList
    public ArrayList<String> getClassList(){
        return this.classList;
    }

    // Returns the array for classSection
    public ArrayList<Integer> getClassSection(){
        return this.classSection;
    }

    // Returns the array for classAbs
    public ArrayList<Integer> getClassAbs() {
        return this.classAbs;
    }

    // Returns the student name
    public String getName(){
        return this.name;
    }

    //Returns the student RFID String
    public String getStudentRFID() {
        return studentRFID;
    }
}
