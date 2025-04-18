const topic = 'mqtt.0.Muelleimer.Leerung';

// Datenpunkte vorbereiten
createState('kunden.rfid', '', { read: true, write: false });
createState('kunden.vorname', '', { read: true, write: false });
createState('kunden.nachname', '', { read: true, write: false });
createState('kunden.adresse', '', { read: true, write: false });
createState('kunden.email', '', { read: true, write: false });
createState('kunden.leerungsdatum', '', { read: true, write: false });

// Trigger bei neuer Abholmeldung via MQTT
on({ id: topic, change: 'any' }, (obj) => {
    try {
        const payload = JSON.parse(obj.state.val);
        const rfid = payload.muelleimer_id;

        setState('kunden.rfid', rfid, true);

        // Aktuelles Datum als Leerungszeit
        const leerungZeit = new Date().toLocaleString('de-DE'); // z. B. "18.4.2025, 15:34:02"
        setState('kunden.leerungsdatum', leerungZeit, true); 

        const dateipfad = 'Kundendaten.json';

        readFile('javascript.admin', dateipfad, (err, data) => {
            if (err) {
                log('Fehler beim Laden der JSON: ' + err, 'error');
                return;
            }

            if (!data || data.trim() === '') {
                log('Die Datei enthält keine Daten oder ist leer.', 'error');
                return;
            }

            log('Geladene Datei: ' + data);

            try {
                const kunden = JSON.parse(data);

                if (!Array.isArray(kunden)) {
                    log('Die JSON-Daten enthalten kein gültiges Kunden-Array.', 'error');
                    return;
                }

                const kunde = kunden.find(k => k.rfid === rfid);

                if (kunde) {
                    log(`Kunde gefunden: ${kunde.vorname} ${kunde.nachname}`);
                    setState('kunden.vorname', kunde.vorname, true);
                    setState('kunden.nachname', kunde.nachname, true);
                    setState('kunden.adresse', kunde.adresse, true);
                    setState('kunden.email', kunde.email, true);
                } else {
                    log(`Kein Kunde mit RFID ${rfid} gefunden.`, 'warn');
                    setState('kunden.vorname', 'Unbekannt', true);
                    setState('kunden.nachname', '', true);
                    setState('kunden.adresse', '', true);
                    setState('kunden.email', '', true);
                }
            } catch (jsonError) {
                log('Fehler beim Parsen der JSON: ' + jsonError, 'error');
            }
        });

    } catch (err) {
        log('Fehler beim Verarbeiten der Nachricht: ' + err, 'error');
    }
});
