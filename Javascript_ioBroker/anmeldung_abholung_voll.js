const topic = 'mqtt.0.Muelleimer.Fuellstand';
const kundenDatei = 'Kundendaten.json';
const sammelDatei = 'AbholListe.json';

on({ id: topic, change: 'any' }, (obj) => {
    try {
        const daten = JSON.parse(obj.state.val);
        const rfid = daten.muelleimer_id;
        const status = daten.status;

        log(`Meldung von ${rfid} mit Status: ${status}`, 'info');

        if (status === 'voll') {
            // Kundendaten laden
            readFile('javascript.admin', kundenDatei, (err, fileData) => {
                if (err) {
                    log('Fehler beim Lesen der Kundendaten: ' + err, 'error');
                    return;
                }

                const kunden = JSON.parse(fileData);
                const kunde = kunden.find(k => k.rfid === rfid);

                if (!kunde) {
                    log(`Kein Kunde mit RFID ${rfid} gefunden`, 'warn');
                    return;
                }

                const eintrag = {
                    rfid: rfid,
                    adresse: kunde.adresse,
                    timestamp: Date.now()
                };

                // Vorhandene AbholListe laden
                readFile('javascript.admin', sammelDatei, (err2, sammelData) => {
                    let abholListe = [];

                    if (!err2 && sammelData.trim() !== '') {
                        try {
                            abholListe = JSON.parse(sammelData);
                        } catch (e) {
                            log('Fehler beim Parsen der AbholListe, wird neu erstellt.', 'warn');
                        }
                    }

                    // Neuen Eintrag hinzufügen, aber doppelte vermeiden
                    const bereitsDrin = abholListe.some(e => e.rfid === rfid);
                    if (!bereitsDrin) {
                        abholListe.push(eintrag);
                        log(`Adresse ${kunde.adresse} zur Abholungsliste hinzugefügt.`, 'info');

                        // Liste speichern
                        writeFile('javascript.admin', sammelDatei, JSON.stringify(abholListe, null, 2));
                    } else {
                        log(`Adresse ${kunde.adresse} ist bereits in der Liste.`, 'info');
                    }
                });
            });
        }

    } catch (e) {
        log('Fehler beim Verarbeiten der MQTT-Nachricht: ' + e, 'error');
    }
});
