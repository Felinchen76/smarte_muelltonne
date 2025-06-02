#include <ESP8266WiFi.h>       // Für WLAN-Funktionalität
#include <PubSubClient.h>      // Für MQTT-Kommunikation

// Pins für Ultraschallsensor (z. B. HC-SR04)
const int trigPin = 12;        // Trigger-Pin zum Auslösen des Signals
const int echoPin = 14;        // Echo-Pin zum Empfang des Signals

// Konstanten für Distanzmessung
#define SOUND_VELOCITY 0.034   // Geschwindigkeit des Schalls in cm/µs
#define TRIGGER_TIME 10        // Triggerdauer in Mikrosekunden
#define TIMEOUT 30000          // Timeout für Messung in Mikrosekunden
#define NUM_READINGS 5         // Anzahl der Messungen für Mittelwert

// Feste RFID-ID für die Mülltonne
const char* rfidId = "d383ab1b";

// WLAN-Zugangsdaten
const char* ssid = "WI-HA-LAB-204";
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

// Globale Variablen für Messung
long duration;         // gemessene Zeitdauer in µs
float distanceCm;      // berechnete Distanz in cm

void setup() {
  Serial.begin(9600);                        // Serielle Verbindung für Debugging
  pinMode(trigPin, OUTPUT);                 // Trigger-Pin als Ausgang
  pinMode(echoPin, INPUT);                  // Echo-Pin als Eingang

  // Verbindung mit WLAN herstellen
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.println("Connecting to WiFi..");
  }
  Serial.println("Connected to the WiFi network");

  // Verbindung mit MQTT-Broker herstellen
  client.setServer(mqttServer, mqttPort);
  while (!client.connected()) {
    Serial.println("Connecting to MQTT...");
    if (client.connect(mqttClientID, mqttuser, mqttpw)) {
      Serial.println("Connected to MQTT");
    } else {
      Serial.print("Failed with state ");
      Serial.println(client.state());
      delay(2000);
    }
  }
  client.disconnect(); // Erstmal wieder trennen
}

void loop() {
  char payload[150];            // String für die MQTT-Nachricht
  float totalDuration = 0;      // Summe für Durchschnittsbildung

  // Mehrfachmessung zur Glättung
  for (int i = 0; i < NUM_READINGS; i++) {
    digitalWrite(trigPin, LOW);
    delayMicroseconds(2);
    digitalWrite(trigPin, HIGH);
    delayMicroseconds(TRIGGER_TIME);
    digitalWrite(trigPin, LOW);

    long reading = pulseIn(echoPin, HIGH, TIMEOUT); // Zeit messen

    if (reading > 0) {
      totalDuration += reading;
    }
    delay(50); // kurze Pause zwischen den Messungen
  }

  // Durchschnitt berechnen
  duration = totalDuration / NUM_READINGS;

  // Ergebnis auswerten
  if (duration == 0) {
    Serial.println("Out of range");
    snprintf(payload, sizeof(payload), "{\"muelleimer_id\": \"%s\", \"status\": \"nicht messbar\"}", rfidId);
  } else {
    // Entfernung berechnen: (Zeit * Schallgeschwindigkeit) / 2 (Hin- und Rückweg)
    distanceCm = (duration * SOUND_VELOCITY) / 2;
    Serial.print("Distance (cm): ");
    Serial.println(distanceCm);

    // Status je nach Entfernung bestimmen
    const char* status = "unbekannt";
    if (distanceCm <= 7.0) {
      status = "voll";
    } else if (distanceCm <= 20.0) {
      status = "halbvoll";
    } else {
      status = "leer";
    }

    // JSON Payload mit Status, Distanz und fester RFID
    snprintf(payload, sizeof(payload),
             "{\"muelleimer_id\": \"%s\",\"status\": \"%s\", \"distanz\": %.2f}", rfidId,
             status, distanceCm);
  }

  // MQTT-Nachricht senden
  if (client.connect("ESP8266Client_GG", mqttuser, mqttpw)) {
    client.publish("Muelleimer.Fuellstand", payload); // Senden an Topic
    client.disconnect();
  } else {
    Serial.println("Konnte keine MQTT-Verbindung herstellen!");
  }

  delay(1000);  // Wartezeit bis zur nächsten Messung
  client.loop(); // MQTT-Verarbeitung
}
