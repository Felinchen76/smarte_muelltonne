#include <ESP8266WiFi.h>         // Für WLAN-Funktionalität
#include <PubSubClient.h>        // Für MQTT-Kommunikation
#include <Wire.h>                // Für I2C-Verbindung zum MPU6050
#include <Adafruit_MPU6050.h>    // Adafruit-Bibliothek für den MPU6050
#include <Adafruit_Sensor.h>     // Einheitliche Sensor-API von Adafruit

// MPU6050-Objekt erstellen
Adafruit_MPU6050 mpu;

// WLAN-Zugangsdaten
const char* ssid = "WI-HA-LAB";
const char* password = "Smart99!?";

// MQTT-Server-Konfiguration
const char* mqttServer = "82.165.252.242";
const int mqttPort = 1811;
const char* mqttClientID = "Esp_Grp_01";
const char* mqttuser = "mqtt";
const char* mqttpw = "mqtt11";

// MQTT-Client-Instanz
WiFiClient espClient;
PubSubClient client(espClient);

// Feste RFID-ID (kann später dynamisch ersetzt werden)
const char* rfidID = "d383ab1b";

// Status-Tracking: wurde der Zustand "umgekippt" schon erkannt?
bool vorherUmgekippt = false;

// Funktion zur Verbindung mit dem WLAN
void connectToWiFi() {
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.println("Verbindung zum WLAN wird aufgebaut...");
  }
  Serial.println("WLAN verbunden!");
}

// Funktion zur Verbindung mit dem MQTT-Broker
void connectToMQTT() {
  while (!client.connected()) {
    Serial.println("Verbindung zu MQTT wird aufgebaut...");
    if (client.connect(mqttClientID, mqttuser, mqttpw)) {
      Serial.println("MQTT verbunden!");
    } else {
      Serial.print("Fehlgeschlagen, rc=");
      Serial.println(client.state());
      delay(2000);
    }
  }
}

void setup() {
  Serial.begin(9600);
  delay(100); // kleiner Startpuffer

  // WLAN & MQTT-Verbindung herstellen
  connectToWiFi();
  client.setServer(mqttServer, mqttPort);
  connectToMQTT();

  // MPU6050 initialisieren
  if (!mpu.begin()) {
    Serial.println("MPU6050 nicht gefunden!");
    while (1) delay(10); // Dauerschleife bei Fehler
  }
  Serial.println("MPU6050 erkannt!");

  // Sensor-Einstellungen setzen
  mpu.setAccelerometerRange(MPU6050_RANGE_8_G);     // Beschleunigungsbereich
  mpu.setGyroRange(MPU6050_RANGE_500_DEG);          // Gyroskopbereich
  mpu.setFilterBandwidth(MPU6050_BAND_5_HZ);        // Glättung des Signals
  delay(100); // Sensor-Pufferzeit
}

void loop() {
  // Prüfen, ob MQTT-Verbindung aktiv ist
  if (!client.connected()) {
    connectToMQTT();
  }

  // Sensorwerte abrufen
  sensors_event_t a, g, temp;
  mpu.getEvent(&a, &g, &temp);

  // Beschleunigung entlang der Z-Achse lesen
  float z = a.acceleration.z;

  // Logik: Wenn Sensor an der Seitenwand ist,
  // dann ist der Z-Wert hoch, wenn der Eimer umgekippt ist
  bool umgekippt = abs(z) > 7.0;

  char payload[250]; // MQTT-Nachricht (JSON)

  // Nur senden, wenn sich der Status ändert (flatterfrei)
  if (umgekippt != vorherUmgekippt) {
    if (umgekippt) {
      Serial.println("Mülleimer ist umgekippt!");
      snprintf(payload, sizeof(payload),
               "{\"muelleimer_id\":\"%s\", \"status\": \"umgekippt\", \"accZ\": %.2f}",
               rfidID, z);
    } else {
      Serial.println("Mülleimer steht.");
      snprintf(payload, sizeof(payload),
               "{\"muelleimer_id\":\"%s\", \"status\": \"steht\", \"accZ\": %.2f}",
               rfidID, z);
    }

    // MQTT-Nachricht veröffentlichen
    client.publish("Muelleimer.Neigung", payload);
    vorherUmgekippt = umgekippt; // Status merken
  }

  client.loop(); // MQTT-Verarbeitung
  delay(1000);   // Wartezeit bis zur nächsten Auswertung
}
