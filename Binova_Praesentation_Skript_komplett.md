# Skript Pitch

## Lisa:

Wir leben in einer Welt, in der Städte intelligenter werden, Fahrzeuge selbstständig fahren und Prozesse datenbasiert optimiert sind.  
Die Welt verändert sich – aber ausgerechnet bei der Mülltonne bleibt alles beim Alten.

Während allen den Neuerungen sind herkömmliche Mülltonnen heute noch so analog wie vor 50 Jahren.  
Dies sorgt dafür, dass die Abfallentsorgung oft ineffizient – teuer und nicht dem heutigen Nachhaltigkeitsideal entspricht.

Entsorgungsunternehmen fahren nach starren Intervallen – egal ob Tonnen leer oder längst überfüllt sind.  
Das kostet Zeit, Geld und produziert unnötige Emissionen.

Auch auf Nutzerseite gibt es Probleme: Kein Überblick über den Füllstand, überfüllte Tonnen, verpasste Abholungen, Zusatzgebühren – all das führt zu Stress und Mehraufwand.

Dazu kommen alltägliche Herausforderungen, die oft übersehen werden:

- Fehleranfällige Identifikationsmethoden verhindern eine präzise, nutzungsbasierte Abrechnung.
- Umgestürzte oder beschädigte Tonnen bleiben unbemerkt – mit Beschwerden, Mehraufwand und zusätzlichen Fahrten als Folge.
- Und ohne aktuelle Daten zu Standort, Zustand und Füllstand ist eine effiziente Steuerung kaum möglich.

Diese Ineffizienzen kosten nicht nur bares Geld – sie bremsen Entsorger auch bei öffentlichen Ausschreibungen.  
Denn heute zählen Effizienz, Nachhaltigkeit und Digitalisierung.

**Wir bei Binovia haben dafür eine klare Antwort.**

Unsere smarten Mülltonnen sind mit IoT-Sensoren ausgestattet.  
Sie erfassen Füllstand, Bewegung und Zustand in Echtzeit, vernetzen sich automatisch mit Entsorgungsunternehmen, melden Schäden sofort – und ermöglichen eine exakte, faire Abrechnung.

**Wir glauben:** Es ist Zeit, auch die Abfallwirtschaft smart zu machen.  
Mit Binovia vernetzen wir, was bisher vergessen wurde – und schaffen eine sauberere, nachhaltigere Zukunft.

Mein Name ist Lisa und ich freue mich, gemeinsam mit meinem Team Binova vorzustellen.  
Wir sind ein junges Startup bestehend aus Felicitas als CFO, Berkant als CMO und Yen als CTO.

Wir haben uns das Ziel gesetzt, die Abfallwirtschaft durch vernetzte Intelligenz grundlegend zu verbessern.  
Unsere Tonnen sind mit Sensoren für Füllstand, Gewicht, Temperatur und GPS ausgestattet – und erfassen Zustand, Nutzung und Standort in Echtzeit.  
So entsteht eine präzise Datengrundlage, die Entsorgern und Städten eine bislang unerreichte Transparenz bietet.

> *Alle Sensoren oder nur das von der Folie?*

Auf dieser Basis eröffnen sich völlig neue Möglichkeiten:  
Durch die gezielte Analyse der Daten lassen sich Entleerungen bedarfsgerecht planen, Routen effizient gestalten – und smarte Services entwickeln, die neue Erlösmodelle ermöglichen.

Gleichzeitig denken wir Nachhaltigkeit weiter:  
Bonusprogramme, Hinweise zur Mülltrennung und CO₂-Tracking schaffen Anreize für bewussteres Verhalten – und fördern echte Beteiligung sowie aktiven Umweltschutz im Alltag.

---

## Yen:

### Leistungs-Folie

Nachdem wir die Herausforderungen in der heutigen Abfallwirtschaft aufgezeigt haben, möchten wir Ihnen nun zeigen, wie Binova diese Probleme konkret löst – und welche Technologie dahinter steckt.

Unsere Lösung ist eine smarte, datengetriebene Abfallentsorgung mit vernetzten Mülltonnen.  
Jede Tonne ist mit mindestens drei zentralen IoT-Komponenten ausgestattet:

- **Ein Ultraschallsensor**, der den Füllstand in Echtzeit misst. So wissen Entsorger und Nutzer jederzeit, ob die Tonne leer, halbvoll oder überfüllt ist.
- **Ein Bewegungssensor**, der erkennt, ob eine Tonne steht oder umgekippt ist. Bei einem Sturz wird automatisch eine Alarmmeldung ausgelöst.
- **Ein RFID-Modul**, das jede Leerung automatisch registriert. Damit ermöglichen wir eine faire, nutzungsbasierte Abrechnung – nicht mehr pauschal, sondern nach tatsächlicher Entleerung.

All diese Daten werden per **MQTT-Protokoll** an unseren zentralen Server – den sogenannten **ioBroker** – übertragen.  
Dort geschieht die eigentliche Intelligenz:

- Über **Regeln und Automatisierungen** erkennt das System z. B. vollgemeldete Tonnen, speichert den Zustand und generiert automatisch eine digitale Abholungsliste, die im Dashboard visualisiert wird.
- Bei einem „Umkippen“-Event sendet das System eine **E-Mail-Benachrichtigung** an den zuständigen Nutzer oder das Unternehmen – automatisch und in Echtzeit.

---

### Architektur-Folie

Unsere Architektur gliedert sich dabei in drei Ebenen:

1. **Edge**: Hier laufen die Sensoren in den Mülltonnen – die Datenerfassung geschieht lokal.  
2. **Fog**: Die Daten werden über WLAN an den ioBroker übertragen, wo Regeln, Zustände und Schnittstellen zur Weiterverarbeitung laufen.  
3. **Cloud**: Über Webserver, REST-APIs und E-Mail-Dienste werden Daten weitergegeben, visualisiert oder in andere Systeme integriert.

Damit bieten wir nicht nur Effizienz, sondern auch Sicherheit, Transparenz und neue Möglichkeiten der Automatisierung – für Kommunen, Entsorgungsunternehmen und private Haushalte.

**Binova macht sichtbar, was vorher unsichtbar war** – und schafft damit die Grundlage für eine smartere, nachhaltigere Stadt.

---

## Berkant:

*(Textabschnitt noch leer)*

---

## Felicitas:

### FOLIE KOSTEN

Unser System ist sowohl technisch als auch wirtschaftlich sinnvoll.  
Die Hardwarekosten pro Tonne liegen bei unter 50 Euro und beinhalten neben der grundlegenden Sensorik und Lorawan-Integration auch ein Solarpanel, das Binova energieautark macht.

Wir setzen auf kostengünstige, aber robuste Komponenten, um ein zuverlässiges und erschwingliches System zu bieten.

Für die Softwareentwicklung rechnen wir mit rund **140.000 Euro**:

- **120.000 Euro** für die Entwicklung des Dashboards, der App und die Lorawan-Integration  
- **10.000 Euro** für Tests und UI-Entwicklung  

Unser Vorteil: Software ist skalierbar.  
Je mehr Mülltonnen wir verkaufen oder vermieten, desto günstiger wird die Kostenaufteilung pro Tonne.

Gleichzeitig wird die Effizienz der Müllentsorgung erhöht, indem Leerungen gezielter geplant und unnötige Fahrten vermieden werden.  
Das spart **CO₂ und Geld** in der Abfallwirtschaft.

---

### FOLIE GEWINN / UMSATZ

Unser Geschäftsmodell basiert auf zwei Hauptsäulen zur Einnahmegenerierung, die langfristig stabilen Gewinn bringen:

1. **Hardwareverkauf oder Leasing**:  
   Der Verkauf bringt einmalige Gewinne, das Leasing konstante Einnahmen über einen Zeitraum hinweg.

2. **Digitale Services und Daten**:  
   Monatliche Abogebühren für Endnutzer und Entsorger,  
   Einnahmen aus der Verwertung von Abfalldaten,  
   Partnerschaften mit Kommunen,  
   Werbung in der App und Premium-Services wie Mülltonnenreinigung oder erweiterte Dashboards.

**Diese Kombination schafft eine stabile, skalierbare Einkommensbasis** und stellt ein langfristiges Wachstum sicher.
