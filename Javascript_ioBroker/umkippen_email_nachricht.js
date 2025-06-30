const topic = 'mqtt.0.Muelleimer.Neigung';
const dateipfad = 'Kundendaten.json';
const letzterAlarmDateipfad = 'Neigungsalarm.json';

on({ id: topic, change: 'any' }, (obj) => {
    try {
        const payload = JSON.parse(obj.state.val);
        const rfid = payload.muelleimer_id;
        const status = payload.status;
        const heute = new Date().toISOString().split('T')[0]; // "YYYY-MM-DD"

        log(`Mülltonne ID: ${rfid}, aktueller Status: ${status}`);

        if (status === 'umgekippt') {
            readFile('javascript.admin', letzterAlarmDateipfad, (err, fileData) => {
                let bereitsGemeldet = {};

                if (!err && fileData && fileData.trim() !== '') {
                    try {
                        bereitsGemeldet = JSON.parse(fileData);
                    } catch (e) {
                        log('Fehler beim Parsen von Neigungsalarm.json – wird neu erstellt.', 'warn');
                    }
                }

                // Nur melden, wenn noch kein Alarm heute gesendet wurde
                if (bereitsGemeldet[rfid] === heute) {
                    log(`Heute wurde für RFID ${rfid} bereits ein Umkipp-Alarm gesendet.`, 'info');
                    return;
                }

                readFile('javascript.admin', dateipfad, (err2, kundendaten) => {
                    if (err2 || !kundendaten || kundendaten.trim() === '') {
                        log('Kundendaten-Datei fehlt oder ist leer.', 'error');
                        return;
                    }

                    try {
                        const kunden = JSON.parse(kundendaten);
                        const kunde = kunden.find(k => k.rfid === rfid);

                        if (!kunde) {
                            log(`Kein Kunde mit RFID ${rfid} gefunden.`, 'warn');
                            return;
                        }

                        // E-Mail senden
                        sendTo('email', {
                            from:    'iotkurs@iotheros.de',
                            to:      kunde.email,
                            subject: 'Ihre Mülltonne ist umgekippt!',
                            text:    `Sehr geehrte/r ${kunde.vorname} ${kunde.nachname},\n\nIhre Mülltonne an der Adresse ${kunde.adresse} ist umgekippt und sollte wieder aufgestellt werden.\n\nMit freundlichen Grüßen,\nIhr Müllservice`
                        });

                        log(`E-Mail an ${kunde.vorname} ${kunde.nachname} gesendet.`, 'info');

                        // Datum speichern, dass Alarm gesendet wurde
                        bereitsGemeldet[rfid] = heute;
                        writeFile('javascript.admin', letzterAlarmDateipfad, JSON.stringify(bereitsGemeldet, null, 2));
                    } catch (parseErr) {
                        log('Fehler beim Parsen der Kundendaten: ' + parseErr, 'error');
                    }
                });
            });
        }

    } catch (err) {
        log('Fehler beim Verarbeiten der Neigungsnachricht: ' + err, 'error');
    }
});
