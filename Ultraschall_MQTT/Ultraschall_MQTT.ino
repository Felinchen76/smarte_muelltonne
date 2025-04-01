#include <ESP8266WiFi.h>
#include <PubSubClient.h>

const int trigPin = 12;
const int echoPin = 14;

#define SOUND_VELOCITY 0.034
#define TRIGGER_TIME 10
#define TIMEOUT 30000
#define NUM_READINGS 5

const char* ssid = "WI-HA-LAB";
const char* password = "Smart99!?";
const char* mqttServer = "82.165.252.242";
const int mqttPort = 1811;
const char* mqttClientID = "Esp_Grp_01";
const char* mqttuser = "mqtt";
const char* mqttpw = "mqtt11";

WiFiClient espClient;
PubSubClient client(espClient);

long duration;
float distanceCm;

void setup() {
  Serial.begin(9600);
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.println("Connecting to WiFi..");
  }
  Serial.println("Connected to the WiFi network");

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
  client.disconnect();
}

void loop() {
  char attributes[100];
  float totalDuration = 0;
  
  for (int i = 0; i < NUM_READINGS; i++) {
    digitalWrite(trigPin, LOW);
    delayMicroseconds(2);
    digitalWrite(trigPin, HIGH);
    delayMicroseconds(TRIGGER_TIME);
    digitalWrite(trigPin, LOW);
    
    long reading = pulseIn(echoPin, HIGH, TIMEOUT);
    
    if (reading > 0) {
      totalDuration += reading;
    }
    delay(50);
  }
  
  duration = totalDuration / NUM_READINGS;
  
  if (duration == 0) {
    Serial.println("Out of range");
    strcpy(attributes, "Out of range");
  } else {
    distanceCm = (duration * SOUND_VELOCITY) / 2;
    
    Serial.print("Distance (cm): ");
    Serial.println(distanceCm);
    sprintf(attributes, "%.2f", distanceCm);
  }
  
  if (client.connect("ESP8266Client_GG", mqttuser, mqttpw)) {
    client.publish("Gartenhaus.Distanz", attributes);
    client.disconnect();
  } else {
    Serial.println("Konnte keine MQTT-Verbindung herstellen!");
  }
  
  delay(1000);
  client.loop();
}

