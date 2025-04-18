#include <ESP8266WiFi.h>     // Ermöglicht die WLAN-Funktionalität
#include <PubSubClient.h>    // MQTT-Client-Bibliothek
#include <MFRC522.h>         // RFID-Reader MFRC522 Bibliothek
#include <SPI.h>             // Serielle Peripherie-Schnittstelle für RFID

// RFID-Konfiguration
#define SS_PIN 15            // RFID Slave Select (z. B. D8 am NodeMCU)
#define RST_PIN 0            // Reset-Pin des RFID-Moduls (z. B. D3)
#define LED_PIN 2            // Interne LED des ESP8266 (z. B. D4)
MFRC522 rfid(SS_PIN, RST_PIN);           // RFID-Objekt mit Pins initialisieren
MFRC522::MIFARE_Key key;                // Schlüsselobjekt für MIFARE-Karten

// WLAN-Zugangsdaten (SSID + Passwort deines Netzwerks)
const char* ssid = "WI-HA-LAB";
const char* password = "Smart99!?";

// MQTT-Serverkonfiguration
const char* mqttServer = "82.165.252.242";  // IP-Adresse des MQTT-Brokers
const int mqttPort = 1811;                  // Port für MQTT
const char* mqttClientID = "Esp_Grp_01";    // Eindeutiger Name für das Gerät
const char* mqttuser = "mqtt";              // Benutzername für MQTT
const char* mqttpw = "mqtt11";              // Passwort für MQTT

// Erstellen der benötigten Client-Objekte für WLAN und MQTT
WiFiClient espClient;
PubSubClient client(espClient);

// Funktion zur Verbindung mit dem WLAN
void connectToWiFi() {
  WiFi.begin(ssid, password);  // Verbindung starten
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);                // Kurze Wartezeit
    Serial.println("Verbindung zu WLAN..."); // Status ausgeben
  }
  Serial.println("WLAN verbunden.");
}

// Funktion zur Verbindung mit dem MQTT-Server
void connectToMQTT() {
  while (!client.connected()) {
    Serial.println("Verbindung zu MQTT wird aufgebaut...");
    // Verbindung mit Benutzerdaten herstellen
    if (client.connect(mqttClientID, mqttuser, mqttpw)) {
      Serial.println("MQTT verbunden!");
    } else {
      Serial.print("Fehlgeschlagen, rc=");   // Fehlercode anzeigen
      Serial.println(client.state());
      delay(2000);  // Warten und nochmal versuchen
    }
  }
}

void setup() {
  Serial.begin(9600);     // Serielle Kommunikation mit 9600 Baud starten
  SPI.begin();            // SPI-Verbindung für RFID starten
  rfid.PCD_Init();        // RFID-Leser initialisieren
  pinMode(LED_PIN, OUTPUT); // LED als Ausgang setzen

  connectToWiFi();          // WLAN-Verbindung aufbauen
  client.setServer(mqttServer, mqttPort);  // MQTT-Server konfigurieren
  connectToMQTT();          // MQTT-Verbindung aufbauen

  Serial.println("RFID-Abholsystem bereit.");
}

void loop() {
  client.loop();   // MQTT-Verbindung aktiv halten
  handleRFID();    // Neue RFID-Tags verarbeiten
}

// Funktion zum Verarbeiten von RFID-Karten
void handleRFID() {
  // Nur fortfahren, wenn eine neue Karte erkannt wird
  if (!rfid.PICC_IsNewCardPresent() || !rfid.PICC_ReadCardSerial()) return;

  // UID der RFID-Karte in einen lesbaren Hex-String umwandeln
  String rfidID = printHex(rfid.uid.uidByte, rfid.uid.size);
  Serial.print("Mülleimer-ID gelesen: ");
  Serial.println(rfidID);

  // Kurzes Aufblinken der LED als visuelles Feedback
  digitalWrite(LED_PIN, HIGH);
  delay(300);
  digitalWrite(LED_PIN, LOW);

  // Erstellen der MQTT-Nachricht im JSON-Format
  char payload[100];
  snprintf(payload, sizeof(payload), "{\"muelleimer_id\":\"%s\"}", rfidID.c_str());
  client.publish("Muelleimer.Leerung", payload); // Nachricht senden

  // RFID-Karte „freigeben“ (Verbindung zum Tag beenden)
  rfid.PICC_HaltA();
  rfid.PCD_StopCrypto1();
}

// Hilfsfunktion: Wandelt das Byte-Array der UID in einen Hex-String um
String printHex(byte *buffer, byte bufferSize) {
  String id = "";
  for (byte i = 0; i < bufferSize; i++) {
    id += buffer[i] < 0x10 ? "0" : "";     // Führende 0 für einstellige Hexzahlen
    id += String(buffer[i], HEX);          // In Hex umwandeln und anhängen
  }
  return id;
}
