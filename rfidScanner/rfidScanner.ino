/*
 * This ESP32 code is created by esp32io.com
 *
 * This ESP32 code is released in the public domain
 *
 * For more detail (instruction and wiring diagram), visit https://esp32io.com/tutorials/esp32-rfid-nfc
 */

#include <SPI.h>
#include <MFRC522.h>

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

  
  
  Serial.println("Tap an RFID/NFC tag on the RFID-RC522 reader");
}

void loop() {
  if (rfid.PICC_IsNewCardPresent()) { // new tag is available
    if (rfid.PICC_ReadCardSerial()) { // NUID has been readed
      MFRC522::PICC_Type piccType = rfid.PICC_GetType(rfid.uid.sak);
      Serial.print("RFID/NFC Tag Type: ");
      Serial.println(rfid.PICC_GetTypeName(piccType));

      // print UID in Serial Monitor in the hex format
      Serial.print("UID:");
      for (int i = 0; i < rfid.uid.size; i++) {
        Serial.print(rfid.uid.uidByte[i] < 0x10 ? " 0" : " ");
        Serial.print(rfid.uid.uidByte[i], HEX);
      }
      Serial.println();

      rfid.PICC_HaltA(); // halt PICC
      rfid.PCD_StopCrypto1(); // stop encryption on PCD
    }
  }
  ledcWrite(rCh, 150);
  ledcWrite(gCh, 255);
  ledcWrite(bCh, 0);
}
