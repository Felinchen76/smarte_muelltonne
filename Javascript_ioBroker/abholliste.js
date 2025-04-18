// Datenpunkt zur Anzeige der Liste in Jarvis erstellen
createState('javascript.0.anmeldung.abholListeText', '', {
    type: 'string',
    read: true,
    write: false,
    role: 'text',
    desc: 'Liste der Mülltonnen, die zur Abholung gemeldet wurden'
});

// Zeitgesteuert alle 30 Sekunden aktualisieren
schedule("*/30 * * * * *", () => {
    readFile('javascript.admin', 'AbholListe.json', (err, data) => {
        if (err || !data) {
            setState('javascript.0.anmeldung.abholListeText', 'Keine Einträge vorhanden.');
            return;
        }

        try {
            const eintraege = JSON.parse(data);

            if (!Array.isArray(eintraege) || eintraege.length === 0) {
                setState('javascript.0.anmeldung.abholListeText', 'Keine Einträge vorhanden.');
                return;
            }

            const text = eintraege.map(e => {
                const datum = e.timestamp ? new Date(e.timestamp).toLocaleString('de-DE') : 'kein Datum';
                return `${e.adresse}\nRFID: ${e.rfid}\nGemeldet am: ${e.timestamp}`;
            }).join('\n\n---\n\n');

            setState('javascript.0.anmeldung.abholListeText', text);
        } catch (e) {
            log('Fehler beim Parsen der AbholListe: ' + e, 'error');
            setState('javascript.0.anmeldung.abholListeText', 'Fehler beim Einlesen.');
        }
    });
});
