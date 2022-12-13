package org.example;

import java.util.ArrayList;

public class classSection {

    private String name;
    private String teacher;
    private int section;
    private int maxAbs;
    // Time in minutes since midnight (1am = 60)
    private int classTimeStart;
    private int classTimeEnd;

    // Stores the student id off all students in the class
    private ArrayList<String> students = new ArrayList<String>();


    //No arg needed for firebase
    public classSection(){

    }

    public classSection(String name, String teacher, int section, int maxAbs, int classTimeStart, int classTimeEnd, ArrayList students){
        this.name = name;
        this.teacher = teacher;
        this.section = section;
        this.maxAbs = maxAbs;
        this.classTimeStart = classTimeStart;
        this.classTimeEnd = classTimeEnd;
        this.students = students;

    }

    public void addStudent(String studentID){
        this.students.add(studentID);
    }

    public void addStudent(ArrayList<String> students){
        this.students = students;
    }
    public void setName(String name){
        this.name = name;
    }

    public void setTeacher(String teacher){
        this.teacher = teacher;
    }

    public void setSection(int section){
        this.section = section;
    }

    public void setMaxAbs(int maxAbs){
        this.maxAbs = maxAbs;
    }

    public void setClassTimeStart(int classTimeStart){
        this.classTimeStart = classTimeStart;
    }

    public void setClassTimeEnd(int classTimeEnd){
        this.classTimeEnd = classTimeEnd;
    }

    public String getName(){
        return this.name;
    }

    public String getTeacher(){
        return this.teacher;
    }

    public int getSection(){
        return this.section;
    }

    public int getMaxAbs(){
        return this.maxAbs;
    }

    public int getClassTimeStart(){
        return this.classTimeStart;
    }

    public int getClassTimeEnd(){
        return this.classTimeEnd;
    }

    public ArrayList getStudents(){
        return this.students;
    }
}
