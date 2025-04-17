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
#define FUELLIMIT_CM 10        // Schwelle für "voll"-Meldung

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

// Feste RFID-ID für die Tonne (später dynamisch möglich)
const char* rfidID = "d383ab1b";

// Status-Variable: wurde "voll"-Status schon gemeldet?
bool alreadyReported = false;

// Setup-Funktion (Initialisierung)
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
  connectToMQTT();
}

// Wiederverwendbare Funktion zur MQTT-Verbindung
void connectToMQTT() {
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
}

// Funktion zur Berechnung der durchschnittlichen Distanz
float getAverageDistance() {
  float totalDuration = 0;
  int validReadings = 0;

  for (int i = 0; i < NUM_READINGS; i++) {
    digitalWrite(trigPin, LOW);
    delayMicroseconds(2);
    digitalWrite(trigPin, HIGH);
    delayMicroseconds(TRIGGER_TIME);
    digitalWrite(trigPin, LOW);

    long reading = pulseIn(echoPin, HIGH, TIMEOUT); // Zeit messen
    if (reading > 0) {
      totalDuration += reading;
      validReadings++;
    }
    delay(50); // kurze Pause zwischen den Messungen
  }

  if (validReadings == 0) return -1; // keine gültige Messung
  float avgDuration = totalDuration / validReadings;
  return (avgDuration * SOUND_VELOCITY) / 2; // Umrechnung in cm
}

// Hauptprogramm (wird ständig wiederholt)
void loop() {
  client.loop(); // MQTT-Verbindung aufrechterhalten

  float distanceCm = getAverageDistance(); // Abstand messen
  Serial.print("Distance (cm): ");
  Serial.println(distanceCm);

  if (distanceCm < 0) {
    Serial.println("Out of range");
    return; // Messung ungültig
  }

  // Wenn Tonne voll und noch nicht gemeldet → Sende-Meldung
  if (distanceCm <= FUELLIMIT_CM && !alreadyReported) {
    char payload[150];
    snprintf(payload, sizeof(payload),
      "{\"rfid_id\":\"%s\", \"status\":\"voll\", \"timestamp\":%lu}",
      rfidID, millis());  // JSON-Nachricht erstellen

    if (!client.connected()) {
      connectToMQTT(); // MQTT-Verbindung wiederherstellen
    }

    client.publish("Muelleimer.Fuellstand", payload); // Nachricht senden
    Serial.println("Nachricht gesendet:");
    Serial.println(payload);
    alreadyReported = true; // Status setzen
  }

  // Wenn Abstand wieder groß genug → Status zurücksetzen
  if (distanceCm > (FUELLIMIT_CM + 5)) {
    alreadyReported = false;
  }

  delay(2000); // Wartezeit bis zur nächsten Messung
}
