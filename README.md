
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

## Arduino Skripte

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

  // Beschleunigungswerte entlang Z- und Y-Achse
  float z = a.acceleration.z;
  float y = a.acceleration.y;

  // Logik: Umgekippt, wenn Z oder Y deutlich vom Normalwert abweicht
  bool umgekippt = (abs(z) > 7.0 || abs(y) > 7.0);

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

# Javascript Hauptskript innerhalb des ioBrokers: Automatisierte Mülltonnenverarbeitung (IoBroker / MQTT)

## Übersicht

Dieses Skript verarbeitet automatisch Füllstandsmeldungen und RFID-Scans von smarten Mülltonnen. Ziel ist die vollständige Protokollierung und Anzeige über Jarvis (ioBroker Visualisierung).

---

## Dateien

- `Kundendaten.json`  
  → Enthält alle registrierten Tonnen mit RFID, Adresse und Kundendaten

- `AbholListe.json`  
  → Liste aller Tonnen, die sich als **"voll"** gemeldet haben

- `Leerungen.json`  
  → Liste aller erfolgreich **geleerten** Tonnen

---

## MQTT Topics

- `mqtt.0.Muelleimer.Fuellstand`  
  → Wird vom Ultraschallsensor gemeldet (`status`: leer, halbvoll, voll)

- `mqtt.0.Muelleimer.Leerung`  
  → Wird beim Scannen eines RFID-Tags an der Müllabfuhr gesendet

---

## Datenpunkte für Jarvis

- `javascript.0.anmeldung.abholListeText`  
  → Formatierte Textanzeige der aktuellen Abholliste

- `javascript.0.anmeldung.abholListeJson`  
  → JSON-Liste der Abholmeldungen (für weitere Logik oder Darstellung)

- `javascript.0.leerung.leerungslisteText`  
  → Formatierte Textanzeige der durchgeführten Leerungen

- `javascript.0.leerung.leerungslisteJson`  
  → JSON-Liste der Leerungen

- `javascript.0.kunden.info`  
  → Letzter erkannter Kunde beim RFID-Scan (inkl. leerungsdatum)

---

## Ablauf

### 1. **Füllstandsmeldung (automatisch)**

- Topic: `mqtt.0.Muelleimer.Fuellstand`
- Inhalt: `{ "muelleimer_id": "<rfid>", "status": "voll" }`
- Nur bei Status `voll` wird überprüft:
  - Ob dieser RFID bereits **innerhalb der letzten 30 Tage** gemeldet wurde
  - Falls nicht → wird in die `AbholListe.json` eingetragen
  - Felder: `rfid`, `vorname`, `nachname`, `adresse`, `gemeldet_am`, `timestamp`

---

### 2. **Leerung per RFID-Scan**

- Topic: `mqtt.0.Muelleimer.Leerung`
- Inhalt: `{ "muelleimer_id": "<rfid>" }`
- Bei erfolgreicher RFID-Zuordnung:
  - Nur verarbeitet, wenn `fuellstand == "voll"` bekannt ist
  - Neue Zeile in `Leerungen.json`
  - Letzter Kunde wird in `kunden.info` gespeichert
  - Der entsprechende Eintrag wird **aus `AbholListe.json` entfernt**

---

### 3. **Anzeigeaktualisierung (alle 30 Sekunden)**

- Inhalte aus `AbholListe.json` und `Leerungen.json` werden:
  - nach Datum sortiert (neueste oben)
  - als Text (`Text`) und JSON (`Json`) im Datenpunkt gespeichert

---

## Besonderheiten

- **Zeitvergleich** erfolgt über einen `timestamp` (Millisekunden), nicht über Text → vermeidet Duplikate
- **Abholliste wird bereinigt**, wenn eine Tonne geleert wurde
- **Verbindung zu Jarvis** über ioBroker-States

---

## Erweiterbar für:

- E-Mail-Benachrichtigung bei Leerung
- Gebührenberechnung nach Leerungen
- Visualisierung über Zeit (Charts)
- REST-API zur externen Abfrage


## Rollen und Aufgaben im Team

| Rolle | Name | Aufgabenbereiche |
|------|------|-------------------|
| CEO (Chief Executive Officer) – Der Visionär | Lisa Rauh | Gesamtstrategie, Vision, Unternehmensführung. Visualisierung der Daten im Jarvis Dashboard zur Überwachung von Füllstand, Abholungen und Alarmmeldungen. Präsentation der gesammelten Projektdaten und Ergebnisse. |
| CTO (Chief Technology Officer) – Der Technik-Experte | Yen Vu | Entwicklung der IoT-Architektur, Programmierung der Arduino-Skripte (ESP8266, Sensorik), Einrichtung der MQTT-Kommunikation sowie Entwicklung der serverseitigen JavaScript-Automatisierungen. |
| CFO (Chief Financial Officer) – Der Finanzverantwortliche| Felicitas Lock | Ermittlung der Kostenstruktur (Komponenten, Infrastruktur), Analyse von Zielmärkten und Technologietrends, Erstellung von Finanzplänen und Geschäftsmodellen zur nachhaltigen Monetarisierung der Lösung. |
| CFO (Chief Marketng Officer) – Der Wachstumstreiber | Berkant Koç | Verantwortung für die Außenkommunikation, Marketingstrategie und Aufbereitung der Projektergebnisse für potenzielle Kunden und Partner. |

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
