
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

- `Muelleimer.Fuellstand`: Distanz in cm zum Sensor und Status: voll, halbvoll, leer oder nicht messbar
- `Muelleimer.Neigung`: Status „steht“ oder „umgekippt“
- `Muelleimer.Leerung`: RFID-Daten bei Leerung

---

## 📁 Skripte

### 1. Füllstandsmessung mit HC-SR04

**Zweck**: Erkennt, wann ein Mülleimer voll ist und sendet den Messwert und den Status per MQTT.

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
  // Sende Messwert an MQTT-Topic "Muelleimer.Fuellstand"
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

### 3. RFID-Kontrolle bei Leerung

**Zweck**: Liest die RFID-Karte bei Leerung der Tonne und sendet die ID zur Abrechnung.

```cpp
// RFID auslesen und MQTT senden
if (rfid.PICC_IsNewCardPresent() && rfid.PICC_ReadCardSerial()) {
  String id = printHex(rfid.uid.uidByte, rfid.uid.size);
  snprintf(payload, sizeof(payload), "{\"muelleimer_id\":\"%s\"}", rfidID.c_str());
  client.publish("Muelleimer.Leerung", payload);
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

## Rollen und Aufgaben im Team

| Rolle | Name | Aufgabenbereiche |
|------|------|-------------------|
| CEO (Chief Executive Officer) – Der Visionär | Lisa Rauh | Gesamtstrategie, Vision, Unternehmensführung. Visualisierung der Daten im Jarvis Dashboard zur Überwachung von Füllstand, Abholungen und Alarmmeldungen. Präsentation der gesammelten Projektdaten und Ergebnisse. |
| CTO (Chief Technology Officer) – Der Technik-Experte | Yen Vu | Entwicklung der IoT-Architektur, Programmierung der Arduino-Skripte (ESP8266, Sensorik), Einrichtung der MQTT-Kommunikation sowie Entwicklung der serverseitigen JavaScript-Automatisierungen. |
| CMO (Chief Marketing Officer) – Der Wachstumstreiber | Felicitas Lock | Erstellung und Durchführung von Präsentationen, Pitch-Deck und Abschlusspräsentation. Verantwortung für die Außenkommunikation, Marketingstrategie und Aufbereitung der Projektergebnisse für potenzielle Kunden und Partner. |
| CFO (Chief Financial Officer) – Der Finanzverantwortliche | Berkant Koç | Ermittlung der Kostenstruktur (Komponenten, Infrastruktur), Analyse von Zielmärkten und Technologietrends, Erstellung von Finanzplänen und Geschäftsmodellen zur nachhaltigen Monetarisierung der Lösung. |

---
# Projekt-Checkliste – Smarte Mülltonnen (Kanban-Übersicht)

## 🆕 Initialized

### CEO – Lisa Rauh (Chief Executive Officer)
- [ ] Entwicklung der Gesamtstrategie und Vision  
- [ ] Unternehmensführung koordinieren   

---

### CTO – Yen Vu (Chief Technology Officer)
- [ ] Zusammenbau eines Hardware-Prototyps  
- [ ] Erste Testläufe des Prototyps durchführen  

---

### CMO – Felicitas Lock (Chief Marketing Officer) 
- [ ] Entwicklung der Marketingstrategie  
- [ ] Aufbereitung der Projektergebnisse für Kunden und Partner    

---

### CFO – Berkant Koç (Chief Financial Officer)
- [ ] Ermittlung der Kostenstruktur (Hardware, Infrastruktur etc.)  
- [ ] Analyse von Zielmärkten und Technologietrends  
- [ ] Erstellung von Finanzplänen  
- [ ] Entwicklung von Geschäftsmodellen zur Monetarisierung  

---

### Alle
- [ ] Durchführung von Pitch
- [ ] Durchführung von Abschlusspräsentation

---

## 🔄 In Progress

### CEO – Lisa Rauh (Chief Executive Officer)
- [x] Entwicklung der Gesamtstrategie und Vision  
- [x] Unternehmensführung koordinieren  
- [x] Visualisierung der Daten im Jarvis Dashboard  
- [x] Überwachung von Füllstand, Abholungen und Alarmmeldungen  
- [x] Präsentation der gesammelten Projektdaten und Ergebnisse vorbereiten  

---

### CTO – Yen Vu (Chief Technology Officer) 
- [x] Programmierung der Arduino-Skripte (ESP8266, Sensorik)  
- [x] Einrichtung der MQTT-Kommunikation  
- [x] Entwicklung der serverseitigen JavaScript-Automatisierungen (Warten auf Rückmeldung: Datenstruktur für Dashboard)

---

### CMO – Felicitas Lock (Chief Marketing Officer)
- [x] Erstellung von Präsentationen und Pitch-Deck
- [x] Präsentation der gesammelten Projektdaten und Ergebnisse vorbereiten    
- [x] Automatisierung der Berechnung der Kostenstruktur und Umsatzplanung  

---

### CFO – Berkant Koç (Chief Financial Officer)
- [x] Ermittlung der Kostenstruktur (Hardware, Infrastruktur etc.)  
- [x] Analyse von Zielmärkten und Technologietrends  
- [x] Entwicklung von Geschäftsmodellen zur Monetarisierung  

---

## ✅ Finished
### CEO – Lisa Rauh (Chief Executive Officer) 

---

### CTO – Yen Vu (Chief Technology Officer)
- [x] Entwicklung der IoT-Architektur    
- [x] Einrichtung der MQTT-Kommunikation  
- [x] Beschaffung Hardware für Prototyp

---

### CMO – Felicitas Lock (Chief Marketing Officer) 

---

### CFO – Berkant Koç (Chief Financial Officer)

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
