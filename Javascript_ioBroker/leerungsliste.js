// Datenpunkt vorbereiten
createState('javascript.0.leerung.leerungslisteText', '', {
    type: 'string',
    read: true,
    write: false,
    role: 'text',
    desc: 'Liste aller durchgeführten Leerungen'
});

// Alle 30 Sekunden aktualisieren
schedule("*/30 * * * * *", () => {
    readFile('javascript.admin', 'Leerungen.json', (err, data) => {
        if (err || !data) {
            setState('javascript.0.leerung.leerungslisteText', 'Keine Leerungen vorhanden.');
            return;
        }

        try {
            const eintraege = JSON.parse(data);

            if (!Array.isArray(eintraege) || eintraege.length === 0) {
                setState('javascript.0.leerung.leerungslisteText', 'Keine Leerungen vorhanden.');
                return;
            }

            const text = eintraege.map(e => {
                return `RFID: ${e.rfid}
Name: ${e.vorname} ${e.nachname}
Adresse: ${e.adresse}
Leerungsdatum: ${e.leerungsdatum}`;
            }).join('\n\n---------------------\n\n');

            setState('javascript.0.leerung.leerungslisteText', text);
        } catch (e) {
            log('Fehler beim Parsen der Leerungen: ' + e, 'error');
            setState('javascript.0.leerung.leerungslisteText', 'Fehler beim Einlesen.');
        }
    });
});
