/*
 * This ESP32 code is created by esp32io.com
 *
 * This ESP32 code is released in the public domain
 *
 * For more detail (instruction and wiring diagram), visit https://esp32io.com/tutorials/esp32-rfid-nfc
 */
#include <Firebase_ESP_Client.h>
// Provide the token generation process info.
#include <addons/TokenHelper.h>
/* 4. Define the user Email and password that alreadey registerd or added in your project */
#define USER_EMAIL "cc718684@sju.edu"
#define USER_PASSWORD "calsPassword"
#include <SPI.h>
#include <MFRC522.h>
#include <WiFi.h>  //include needed for wifi connection
#define ssid "magic-kingdom"
#define pwd "Irish383"
static WiFiServer server( 80 );  //using port 80
//WiFiClient client;

/* 2. Define the API Key */
#define API_KEY "AIzaSyCwhPomXza0WCgnI16ZRsm8xtBPn8wMH9E"

/* 3. Define the project ID */
#define FIREBASE_PROJECT_ID "attendanceapp-se"

#define SS_PIN  5  // ESP32 pin GIOP5 
#define RST_PIN 27 // ESP32 pin GIOP27 

//define LED:
#define ledR 13
#define ledG 26
#define ledB 32

#define rCh 0
#define gCh 1
#define bCh 2

int green[] = {0,255,0};  //green values
int red[] = {255,0,0};  //red values
int yellow [] = {255,255,0};  //yellow values

// Define Firebase Data object
FirebaseData fbdo;

FirebaseAuth auth;
FirebaseConfig config;

int test = 0;
int count = 0;
int query = 1;

//for http request:
int    HTTP_PORT   = 80;
String HTTP_METHOD = "GET"; // or "POST"
char   HOST_NAME[] = "https://firestore.googleapis.com/v1/"; // hostname of web server:
String PATH_NAME   = "projects/attendanceapp-se/databases/(default)/documents/SoftwareEngineering/Sessions";

MFRC522 rfid(SS_PIN, RST_PIN);

void setup() {
  Serial.begin(9600);
  SPI.begin(); // init SPI bus
  rfid.PCD_Init(); // init MFRC522

  ledcAttachPin( ledR, rCh );  //assign RGB led pins to channels
  ledcAttachPin( ledG, gCh );
  ledcAttachPin( ledB, bCh );

  ledcSetup(rCh, 1000, 8);  //1kHz PWM, 8-bit
  ledcSetup(gCh, 1000, 8);
  ledcSetup(bCh, 1000, 8);

  connectToWiFi();  //call function to connect to wifi
  Serial.printf("Firebase Client v%s\n\n", FIREBASE_CLIENT_VERSION);
  /* Assign the api key (required) */
  config.api_key = API_KEY;

  /* Assign the user sign in credentials */
  auth.user.email = USER_EMAIL;
  auth.user.password = USER_PASSWORD;
  /* Assign the callback function for the long running token generation task */
  config.token_status_callback = tokenStatusCallback; // see addons/TokenHelper.h

  // Limit the size of response payload to be collected in FirebaseData
  fbdo.setResponseSize(2048);

  Firebase.begin(&config, &auth);

  Firebase.reconnectWiFi(true);
  
  server.begin();  //begin server
  
  Serial.println("Tap an RFID/NFC tag on the RFID-RC522 reader");
}
//----------------------------------------------------------------------
static void connectToWiFi ( void ) {  //function to connect to wifi
  Serial.println( "Connecting to WiFi network: " + String(ssid) );
  WiFi.begin( ssid, pwd );
  while (WiFi.status() != WL_CONNECTED) { //wait until connected
    delay( 1000 );
    Serial.print( "." );
  }
  Serial.println();
  Serial.println( "WiFi connected!" );
  Serial.print( "IP address: " );
  Serial.println( WiFi.localIP() );
}
//----------------------------------------------------------------------
void writeToDB(String userID) {
Serial.print("Commit a document (append array)... ");

        // The dyamic array of write object fb_esp_firestore_document_write_t.
        std::vector<struct fb_esp_firestore_document_write_t> writes;

        // A write object that will be written to the document.
        struct fb_esp_firestore_document_write_t transform_write;

        // Set the write object write operation type.
        // fb_esp_firestore_document_write_type_update,
        // fb_esp_firestore_document_write_type_delete,
        // fb_esp_firestore_document_write_type_transform
        transform_write.type = fb_esp_firestore_document_write_type_transform;

        // Set the document path of document to write (transform)
        transform_write.document_transform.transform_document_path = "RFID_scans/test_scans";

        // Set a transformation of a field of the document.
        struct fb_esp_firestore_document_write_field_transforms_t field_transforms;

        // Set field path to write.
        field_transforms.fieldPath = "scan_data_array";

        // Set the transformation type.
        // fb_esp_firestore_transform_type_set_to_server_value,
        // fb_esp_firestore_transform_type_increment,
        // fb_esp_firestore_transform_type_maaximum,
        // fb_esp_firestore_transform_type_minimum,
        // fb_esp_firestore_transform_type_append_missing_elements,
        // fb_esp_firestore_transform_type_remove_all_from_array
        field_transforms.transform_type = fb_esp_firestore_transform_type_append_missing_elements;

        // For the usage of FirebaseJson, see examples/FirebaseJson/BasicUsage/Create.ino
        FirebaseJson content;

        String txt = userID;
        int count = 0;
        String place = "values/[0]/stringValue";
        content.set(place, txt);
        //content.set("values/[0]/integerValue", String(rand()).c_str());
        //content.set("values/[1]/stringValue", txt);

        // Set the transformation content.
        field_transforms.transform_content = content.raw();

        // Add a field transformation object to a write object.
        transform_write.document_transform.field_transforms.push_back(field_transforms);

        // Add a write object to a write array.
        writes.push_back(transform_write);

        if (Firebase.Firestore.commitDocument(&fbdo, FIREBASE_PROJECT_ID, "" /* databaseId can be (default) or empty */, writes /* dynamic array of fb_esp_firestore_document_write_t */, "" /* transaction */))
            Serial.printf("ok\n%s\n\n", fbdo.payload().c_str());
        else
            Serial.println(fbdo.errorReason());

}
//----------------------------------------------------------------------
void timeStampWriteToDB(String userID) {
    Serial.print("Commit a document (set server value, update document)... ");

    // The dyamic array of write object fb_esp_firestore_document_write_t.
    std::vector<struct fb_esp_firestore_document_write_t> writes;

    // A write object that will be written to the document.
    struct fb_esp_firestore_document_write_t transform_write;

    transform_write.type = fb_esp_firestore_document_write_type_transform;

    // Set the document path of document to write (transform)
    transform_write.document_transform.transform_document_path = "RFID_scans/"+userID;

    // Set a transformation of a field of the document.
    struct fb_esp_firestore_document_write_field_transforms_t field_transforms;

    // Set field path to write.
    field_transforms.fieldPath = "time_stamp";

    field_transforms.transform_type = fb_esp_firestore_transform_type_set_to_server_value;

    field_transforms.transform_content = "REQUEST_TIME"; 

    // Add a field transformation object to a write object.
    transform_write.document_transform.field_transforms.push_back(field_transforms);

    struct fb_esp_firestore_document_write_t update_write;

    update_write.type = fb_esp_firestore_document_write_type_update;

    // For the usage of FirebaseJson, see examples/FirebaseJson/BasicUsage/Create.ino
    FirebaseJson content;
    content.set("fields/userID/stringValue", userID);


    // Set the update document content
    update_write.update_document_content = content.raw();

    // Set the update document path
    update_write.update_document_path = "RFID_scans/"+userID;

      
    // Add a write object to a write array.
    writes.push_back(update_write);  //update first

    // Add a write object to a write array.
    writes.push_back(transform_write); //transform later

    if (Firebase.Firestore.commitDocument(&fbdo, FIREBASE_PROJECT_ID, "" , writes, ""))
        Serial.printf("ok\n%s\n\n", fbdo.payload().c_str());
    else
        Serial.println(fbdo.errorReason());

}
//----------------------------------------------------------------------
void getDoc(String userID) {
    String documentPath = "Classes/Software%20Engineering/Students";
        String mask = userID;

        // If the document path contains space e.g. "a b c/d e f"
        // It should encode the space as %20 then the path will be "a%20b%20c/d%20e%20f"

        Serial.print("Get a document... ");
          
        FirebaseJson json;

        if (Firebase.Firestore.getDocument(&fbdo, FIREBASE_PROJECT_ID, "", documentPath.c_str(), mask.c_str())){
          Serial.printf("ok\n%s\n\n", fbdo.payload().c_str());
          json.setJsonData(fbdo.payload().c_str());
        }
        else Serial.println(fbdo.errorReason());
        //return json;
}
//----------------------------------------------------------------------
//function to read user ID of an RFID scan:
String getID (String userID) {
  MFRC522::PICC_Type piccType = rfid.PICC_GetType(rfid.uid.sak);
  Serial.print("RFID/NFC Tag Type: ");
  Serial.println(rfid.PICC_GetTypeName(piccType));

  
      // print UID in Serial Monitor in the hex format
      Serial.print("UID scanning...");
      for (int i = 0; i < rfid.uid.size; i++) {
        if (i == 0) {
          userID = String(rfid.uid.uidByte[i], HEX);
        }
        else {
          userID += String(rfid.uid.uidByte[i], HEX);
        }
        //Serial.print(rfid.uid.uidByte[i] < 0x10 ? " 0" : " ");
        //Serial.print(rfid.uid.uidByte[i], HEX);
      }
      Serial.println("scanned!");
      rfid.PICC_HaltA(); // halt PICC
      rfid.PCD_StopCrypto1(); // stop encryption on PCD
      return userID;
}
//----------------------------------------------------------------------
void turnOnLED() {
  ledcWrite(rCh, 150);
  ledcWrite(gCh, 255);
  ledcWrite(bCh, 0);
}
//----------------------------------------------------------------------
void updateScan(String userID) {
        Serial.print("Commit a document (set server value, update document)... ");

        // The dyamic array of write object fb_esp_firestore_document_write_t.
        std::vector<struct fb_esp_firestore_document_write_t> writes;

        // A write object that will be written to the document.
        struct fb_esp_firestore_document_write_t transform_write;

        // Set the write object write operation type.
        // fb_esp_firestore_document_write_type_update,
        // fb_esp_firestore_document_write_type_delete,
        // fb_esp_firestore_document_write_type_transform
        
        transform_write.type = fb_esp_firestore_document_write_type_transform;

        // Set the document path of document to write (transform)
        transform_write.document_transform.transform_document_path = "test_collection/test_document";

        // Set a transformation of a field of the document.
        struct fb_esp_firestore_document_write_field_transforms_t field_transforms;

        // Set field path to write.
        field_transforms.fieldPath = "server_time";

        // Set the transformation type.
        //field_transforms.transform_type = fb_esp_firestore_transform_type_set_to_server_value;
        field_transforms.transform_type = fb_esp_firestore_transform_type_append_missing_elements;
        
        // Set the transformation content, server value for this case.
        // See https://firebase.google.com/docs/firestore/reference/rest/v1/Write#servervalue
        field_transforms.transform_content = "REQUEST_TIME"; // set timestamp to "test_collection/test_document/server_time"

        // Add a field transformation object to a write object.
        transform_write.document_transform.field_transforms.push_back(field_transforms);

        // Add a write object to a write array.
        writes.push_back(transform_write);

        if (Firebase.Firestore.commitDocument(&fbdo, FIREBASE_PROJECT_ID, "" /* databaseId can be (default) or empty */, writes /* dynamic array of fb_esp_firestore_document_write_t */, "" /* transaction */))
            Serial.printf("ok\n%s\n\n", fbdo.payload().c_str());
        else
            Serial.println(fbdo.errorReason());
}
//----------------------------------------------------------------------
void loop() {
  String userID = "";
  if (rfid.PICC_IsNewCardPresent()) { // new tag is available
    if (rfid.PICC_ReadCardSerial()) { // NUID has been read
    userID = "";  //reset userID
    userID = getID(userID);  //get new userID
    //writeToDB(userID);  //write the userID of new scan to firebaseDB
    //timeStampWriteToDB(userID);  //write a userId and timeStamp to firebaseDB
    updateScan(userID);
    //Serial.println(userID);
    }
  }
  /*
  if (query == 1) {
    getDoc(userID);
    query = 0;
  }
  */
  turnOnLED();
}
