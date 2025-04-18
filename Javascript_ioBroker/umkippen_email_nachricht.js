const topic = 'mqtt.0.Muelleimer.Neigung';

// Trigger auf MQTT-Nachricht zum Neigungsstatus
on({ id: topic, change: 'any' }, (obj) => {
    try {
        const payload = JSON.parse(obj.state.val);
        const rfid = payload.muelleimer_id;
        const status = payload.status;
        log(`Mülltonne Id: ${rfid}, Status: ${status}`);

        // Nur bei "umgekippt" reagieren
        if (status === 'umgekippt') {
            const dateipfad = 'Kundendaten.json';

            readFile('javascript.admin', dateipfad, (err, data) => {
                if (err) {
                    log('Fehler beim Laden der Kundendaten: ' + err, 'error');
                    return;
                }

                if (!data || data.trim() === '') {
                    log('Kundendaten-Datei ist leer oder ungültig.', 'error');
                    return;
                }

                try {
                    const kunden = JSON.parse(data);
                    const kunde = kunden.find(k => k.rfid === rfid);

                    if (kunde) {
                        log(`Sende E-Mail an ${kunde.vorname} ${kunde.nachname} (${kunde.email})`);

                        // Email versenden
                        sendTo('email', {
                            from:       'iotkurs@iotheros.de',
                            to:         kunde.email,
                            subject:    'Ihre Mülltonne ist umgekippt!',
                            text:       `Sehr geehrte/r ${kunde.vorname} ${kunde.nachname},\n\nIhre Mülltonne an der Adresse ${kunde.adresse} ist umgekippt und sollte wieder aufgestellt werden.\n\nMit freundlichen Grüßen,\nIhr Müllservice`
                        });

                    } else {
                        log(`Kein Kunde mit RFID ${rfid} gefunden.`, 'warn');
                    }
                } catch (jsonErr) {
                    log('Fehler beim Parsen der Kundendaten: ' + jsonErr, 'error');
                }
            });
        }

    } catch (parseError) {
        log('Fehler beim Verarbeiten der Neigungsnachricht: ' + parseError, 'error');
    }
});
