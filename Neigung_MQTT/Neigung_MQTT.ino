#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include <Wire.h>
#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>

// MPU6050
Adafruit_MPU6050 mpu;

// WLAN-Zugangsdaten
const char* ssid = "WI-HA-LAB";
const char* password = "Smart99!?";

// MQTT-Broker-Daten
const char* mqttServer = "82.165.252.242";
const int mqttPort = 1811;
const char* mqttClientID = "Esp_Grp_01";
const char* mqttuser = "mqtt";
const char* mqttpw = "mqtt11";

// MQTT & WiFi Objekte
WiFiClient espClient;
PubSubClient client(espClient);

// Statusverfolgung
bool vorherUmgekippt = false;

void connectToWiFi() {
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.println("Verbindung zum WLAN wird aufgebaut...");
  }
  Serial.println("WLAN verbunden!");
}

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
  delay(100);

  connectToWiFi();
  client.setServer(mqttServer, mqttPort);
  connectToMQTT();

  // MPU6050 initialisieren
  if (!mpu.begin()) {
    Serial.println("MPU6050 nicht gefunden!");
    while (1) delay(10);
  }
  Serial.println("MPU6050 erkannt!");

  // Einstellungen
  mpu.setAccelerometerRange(MPU6050_RANGE_8_G);
  mpu.setGyroRange(MPU6050_RANGE_500_DEG);
  mpu.setFilterBandwidth(MPU6050_BAND_5_HZ);
  delay(100);
}

void loop() {
  if (!client.connected()) {
    connectToMQTT();
  }

  // Sensorwerte lesen
  sensors_event_t a, g, temp;
  mpu.getEvent(&a, &g, &temp);

  // Mülleimer steht, wenn Z nahe 0 ist (weil Sensor an Seitenwand)
  // Umgekippt, wenn Z Richtung Erde zeigt -> hohe Z-Beschleunigung
  float z = a.acceleration.z;
  bool umgekippt = abs(z) > 7.0;

  char payload[200];
  if (umgekippt != vorherUmgekippt) {
    if (umgekippt) {
      Serial.println("⚠️ Mülleimer ist umgekippt!");
      snprintf(payload, sizeof(payload),
               "{\"status\": \"umgekippt\", \"accZ\": %.2f}", z);
    } else {
      Serial.println("✅ Mülleimer steht.");
      snprintf(payload, sizeof(payload),
               "{\"status\": \"steht\", \"accZ\": %.2f}", z);
    }

    client.publish("Muelleimer.Neigung", payload);
    vorherUmgekippt = umgekippt;
  }

  client.loop();
  delay(1000);
}
