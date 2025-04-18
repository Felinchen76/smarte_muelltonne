
# Smarte Mülltonnen – IoT-System zur intelligenten Abfallentsorgung

## Projektbeschreibung

Dieses Projekt realisiert ein System für smarte Mülltonnen, die eigenständig ihren Füllstand überwachen, Umkippen erkennen und bei Abholung per RFID identifiziert werden. Ziel ist eine automatisierte Erfassung und Abrechnung von Entleerungen sowie eine Benachrichtigung bei Problemen (z. B. Umkippen).

---

## 🔧 Komponenten

| Komponente       | Funktion                                   |
|------------------|--------------------------------------------|
| ESP8266          | Mikrocontroller mit WLAN                   |
| HC-SR04          | Ultraschallsensor zur Füllstandsmessung    |
| MPU6050          | Beschleunigungssensor zur Kipp-Erkennung   |
| MFRC522          | RFID-Reader zur Abholkontrolle             |
| MQTT-Server      | Nachrichtenübertragung & Backend-Anbindung |

---

## 📡 Kommunikation

Alle Geräte kommunizieren über **MQTT** mit einem zentralen Server. Topics:

- `Muelleimer.Distanz`: Füllstand in cm
- `Muelleimer.Neigung`: Status „steht“ oder „umgekippt“
- `Muelleimer.Abholung`: RFID-Daten bei Abholung

---

## 📁 Skripte

### 1. Füllstandsmessung mit HC-SR04

**Zweck**: Erkennt, wann ein Mülleimer voll ist und sendet den Messwert per MQTT.

```cpp
// Distance measurement using HC-SR04
const int trigPin = 12;
const int echoPin = 14;
// WiFi + MQTT setup omitted for brevity

void loop() {
  // Führe 5 Messungen durch, berechne Mittelwert
  for (int i = 0; i < 5; i++) {
    digitalWrite(trigPin, LOW); delayMicroseconds(2);
    digitalWrite(trigPin, HIGH); delayMicroseconds(10);
    digitalWrite(trigPin, LOW);
    long duration = pulseIn(echoPin, HIGH, 30000);
    // Berechne Entfernung in cm
  }
  // Sende Messwert an MQTT-Topic "Muelleimer.Distanz"
}
```

---

### 2. Kipp-Erkennung mit MPU6050

**Zweck**: Sendet eine MQTT-Meldung, wenn der Mülleimer umfällt.

```cpp
// Neigungserkennung mit MPU6050
mpu.setAccelerometerRange(MPU6050_RANGE_8_G);

void loop() {
  mpu.getEvent(&a, &g, &temp);
  float z = a.acceleration.z;
  bool umgekippt = abs(z) > 7.0;

  if (umgekippt != vorherUmgekippt) {
    // Sende "umgekippt" oder "steht" an "Muelleimer.Neigung"
    vorherUmgekippt = umgekippt;
  }
}
```

---

### 3. RFID-Kontrolle bei Abholung

**Zweck**: Liest die RFID-Karte beim Abholen der Tonne und sendet die ID zur Abrechnung.

```cpp
// RFID auslesen und MQTT senden
if (rfid.PICC_IsNewCardPresent() && rfid.PICC_ReadCardSerial()) {
  String id = printHex(rfid.uid.uidByte, rfid.uid.size);
  snprintf(payload, sizeof(payload), "{"muelleimer_id":"%s", "zeit":%lu}", id.c_str(), millis());
  client.publish("Muelleimer.Abholung", payload);
}
```

---

## Beispielhafte MQTT-Nachrichten

```json
// Füllstand
Topic: Muelleimer.Fuellstand
Payload: {"muelleimer_id": "d383ab1b", "status": "voll"}

// Kippstatus
Topic: Muelleimer.Neigung
Payload: {"muelleimer_id":"d383ab1b", "status": "umgekippt", "accZ": 8.77}

// Leerung
Topic: Muelleimer.Leerung
Payload: {"muelleimer_id":"a1b2c3d4"}
```

---

## E-Mail-Benachrichtigung bei Umkippen

Ein Javascript innerhalb des ioBrokers überwacht das Topic `Muelleimer.Neigung`. Bei Status „umgekippt“ wird automatisch eine E-Mail an den Kunden versendet.

---

## Automatisierte Abrechnung

- Bei jeder Abholung (RFID-Lesung) wird die Tonne registriert.
- Abholungen werden monatlich aggregiert.
- Auf dieser Basis erfolgt die Rechnungsstellung an den Kunden.

---

## Automatisierte Abholung

- Ein Javascript innerhalb des ioBrokers überwacht das Topic `Muelleimer.Fuellstand`. Bei Status "voll" wird automatisch die Adresse der Mülltonne nach Abgleich der RFID-Id der Mülltonne und das Meldedatum in eine JSON Datei geschrieben
- Die Liste mit gemeldeten Mülltonnen werden dann im Jarvis Dashboard zur Verfügung gestellt.

---

## Erweiterungsmöglichkeiten

- GPS-Modul zur genauen Standortübertragung
- App zur Statusanzeige für Kunden
- Integration mit Abholfahrzeugen zur automatisierten Tourenplanung

---

## Autor / Entwicklung

Ein Projekt im Bereich **Smart City** und **IoT** zur nachhaltigen, datengetriebenen Abfallwirtschaft.


Berkant Koç, Felicitas Lock, Lisa Rauh und Yen Vu

---
