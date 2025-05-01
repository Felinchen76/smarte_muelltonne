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

Unsere Vision ist klar: Eine smartere, effizientere und nachhaltigere Abfallwirtschaft – mit digitalen Lösungen, die für alle Beteiligten echten Mehrwert schaffen.  
Wie genau das funktioniert, welche Sensorik wir einsetzen und welche Architektur hinter Binova steckt, das zeige ich euch jetzt.

Unsere smarte Mülltonne basiert auf minedstens drei zentralen IoT-Komponenten:

- **Ein Ultraschallsensor** misst kontinuierlich den Füllstand – in Echtzeit.  
  So wissen Nutzer und Entsorger immer, wann eine Leerung wirklich nötig ist.

- **Ein Neigungssensor** erkennt, ob eine Tonne steht oder umgekippt ist.  
  Bei einem Sturz wird automatisch eine Alarmmeldung ausgelöst.

- **Ein RFID-Modul**, wodurch jede Leerung eindeutig und zuverlässig registriert wird.   
  Dadurch schaffen wir die Grundlage für eine faire, nutzungsbasierte Abrechnung – statt pauschaler Gebühren.

**Alle Daten** werden per **MQTT-Protokoll** an unseren zentralen Server – den **ioBroker** – gesendet. Dort findet die eigentliche Intelligenz statt:

- Über **Regeln und Automatisierungen** erkennt das System z. B. vollgemeldete Tonnen,
- generiert eine **digitale Abholungsliste**, die im Dashboard visualisiert wird,
- und verschickt bei Bedarf automatisch **Benachrichtigungen per E-Mail** – etwa wenn eine Tonne umgekippt ist.

---

**Technisch betrachtet** arbeiten wir mit einer modernen Drei-Schichten-Architektur:

1. **Edge** – direkt an der Mülltonne:  
   Hier laufen die Sensoren und erfassen Daten lokal.

2. **Fog** – auf unserem Server (ioBroker):  
   Hier werden die Daten verarbeitet, Zustände erkannt und Regeln ausgelöst.

3. **Cloud** – für Visualisierung und externe Dienste:  
   Über REST-APIs und Webserver werden Daten in Dashboards, mobilen Apps oder E-Mail-Systeme integriert.

---

**Das Ergebnis:** Ein vollständig automatisiertes, skalierbares und transparentes System – für Städte, Entsorger und Haushalte.

**Binova bringt Intelligenz dorthin, wo sie bisher gefehlt hat – in die Mülltonne.**  
Und genau das ist der Schlüssel für die smarte Stadt von morgen.

---

## Berkant:

*Lassen Sie mich Ihnen eins sagen:
Müll ist nicht das Problem.
Das Problem ist, wie wir damit umgehen.

Denn während Mülltonnen weiter analog rumstehen,
haben sich unsere Städte, unsere Haushalte und unsere Daten längst weitergedreht.

Wer braucht BINOVA?

Entsorger, die wissen wollen, wann sich eine Fahrt lohnt – nicht nach Plan, sondern nach Bedarf.
Haushalte, die mehr Komfort wollen – durch Automatisierung, Transparenz und Einsparung.
Wohnbaugesellschaften, die Kontrolle und Effizienz brauchen – für tausende Standorte.
Und ganz vorne mit dabei: Städte und Kommunen,
die nicht mehr nur Abfall managen wollen – sondern eine smarte, digitale Infrastruktur aufbauen.

Und jetzt? Jetzt schauen wir auf die Trends.

Smart Cities? Nicht mehr Zukunft – Realität.
Nachhaltigkeit? Kein Luxus – Standard.
Digitalisierung? Nicht optional – Pflicht.

Wir liefern die Lösung, auf die dieser Markt wartet:
BINOVA ist nicht nur ein Produkt.
Es ist die Verbindung von Technologie, Umwelt und klarem Nutzen.

Und wir bringen sie genau da hin, wo sie hingehört:
Mitten in die Städte. Mitten in die Gesellschaft.
Und mitten ins 21. Jahrhundert*

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
