
# Präsentationsskript: Leistungen & Architektur

## Leistungs-Folie (Yen)

Nachdem wir die Herausforderungen in der heutigen Abfallwirtschaft aufgezeigt haben, möchten wir Ihnen nun zeigen, wie **Binova** diese Probleme konkret löst – und welche Technologie dahinter steckt.

Unsere Lösung ist eine smarte, datengetriebene Abfallentsorgung mit vernetzten Mülltonnen. Jede Tonne ist mit mindestes drei zentralen IoT-Komponenten ausgestattet:

- **Ein Ultraschallsensor**, der den Füllstand in Echtzeit misst. So wissen Entsorger und Nutzer jederzeit, ob die Tonne leer, halbvoll oder überfüllt ist.
- **Ein Bewegungssensor**, der erkennt, ob eine Tonne steht oder umgekippt ist. Bei einem Sturz wird automatisch eine Alarmmeldung ausgelöst.
- **Ein RFID-Modul**, das jede Leerung automatisch registriert. Damit ermöglichen wir eine faire, nutzungsbasierte Abrechnung – nicht mehr pauschal, sondern nach tatsächlicher Entleerung.

All diese Daten werden per **MQTT-Protokoll** an unseren zentralen Server – den sogenannten **ioBroker** – übertragen. Dort geschieht die eigentliche Intelligenz:

- Über Regeln und Automatisierungen erkennt das System z. B. vollgemeldete Tonnen, speichert den Zustand und generiert automatisch eine **digitale Abholungsliste**, die im Dashboard visualisiert wird.
- Bei einem „Umkippen“-Event sendet das System eine **E-Mail-Benachrichtigung** an den zuständigen Nutzer oder das Unternehmen – automatisch und in Echtzeit.

---

## Architektur-Folie (Yen)

Unsere Architektur gliedert sich dabei in drei Ebenen:

1. **Edge**: Hier laufen die Sensoren in den Mülltonnen – die Datenerfassung geschieht lokal.
2. **Fog**: Die Daten werden über WLAN an den ioBroker übertragen, wo Regeln, Zustände und Schnittstellen zur Weiterverarbeitung laufen.
3. **Cloud**: Über Webserver, REST-APIs und E-Mail-Dienste werden Daten weitergegeben, visualisiert oder in andere Systeme integriert.

Damit bieten wir nicht nur **Effizienz**, sondern auch **Sicherheit**, **Transparenz** und neue Möglichkeiten der **Automatisierung** – für Kommunen, Entsorgungsunternehmen und private Haushalte.

**Binova** macht sichtbar, was vorher unsichtbar war – und schafft damit die Grundlage für eine smartere, nachhaltigere Stadt.
