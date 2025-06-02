const kundenDatei = 'Kundendaten.json';
const abholDatei = 'AbholListe.json';
const leerungDatei = 'Leerungen.json';
const fuellstandDatei = 'FuellstandMap.json';

const topicFuellstand = 'mqtt.0.Muelleimer.Fuellstand';
const topicLeerung = 'mqtt.0.Muelleimer.Leerung';

let fuellstandMap = {};

// Füllstand-Map beim Start laden
readFile('javascript.admin', fuellstandDatei, (err, data) => {
    if (!err && data) {
        try {
            fuellstandMap = JSON.parse(data);
            log('FuellstandMap geladen.', 'info');
        } catch (e) {
            log('FuellstandMap konnte nicht geladen werden. Neue Map wird verwendet.', 'warn');
        }
    }
});

// -----------------------------
// 1. MQTT: Füllstand empfangen
// -----------------------------
on({ id: topicFuellstand, change: 'any' }, obj => {
    try {
        const payload = JSON.parse(obj.state.val);
        const rfid = payload.muelleimer_id;
        const status = payload.status;

        const jetzt = new Date();
        const zeitString = jetzt.toLocaleString('de-DE');
        const zeitStempel = jetzt.getTime();

        readFile('javascript.admin', kundenDatei, (err, data) => {
            if (err || !data) return;

            const kunden = JSON.parse(data);
            const kunde = kunden.find(k => k.rfid === rfid);
            if (!kunde) return;

            // Status speichern
            fuellstandMap[rfid] = status;
            writeFile('javascript.admin', fuellstandDatei, JSON.stringify(fuellstandMap, null, 2));

            if (status === 'voll') {
                const eintrag = {
                    rfid,
                    vorname: kunde.vorname,
                    nachname: kunde.nachname,
                    adresse: kunde.adresse,
                    gemeldet_am: zeitString,
                    timestamp: zeitStempel
                };

                readFile('javascript.admin', abholDatei, (err2, abholData) => {
                    let liste = [];
                    if (!err2 && abholData) {
                        try { liste = JSON.parse(abholData); } catch (_) { }
                    }

                    const dreissigTageMs = 1000 * 60 * 60 * 24 * 30;
                    const bereitsGemeldet = liste.some(e =>
                        e.rfid === rfid &&
                        e.timestamp &&
                        zeitStempel - e.timestamp < dreissigTageMs
                    );

                    if (bereitsGemeldet) {
                        log(`RFID ${rfid} wurde bereits in den letzten 30 Tagen gemeldet. Kein neuer Eintrag.`, 'info');
                    } else {
                        liste.push(eintrag);
                        writeFile('javascript.admin', abholDatei, JSON.stringify(liste, null, 2));
                        log(`Abholliste erweitert: ${kunde.vorname} ${kunde.nachname}`, 'info');
                    }
                });
            }
        });
    } catch (e) {
        log('Fehler beim Verarbeiten der Füllstandsmeldung: ' + e, 'error');
    }
});

// ------------------------------------
// 2. MQTT: Leerung bei RFID-Scan
// ------------------------------------
on({ id: topicLeerung, change: 'any' }, obj => {
    try {
        const payload = JSON.parse(obj.state.val);
        const rfid = payload.muelleimer_id;
        const timestamp = new Date().toLocaleString('de-DE');

        readFile('javascript.admin', kundenDatei, (err, data) => {
            if (err || !data) return;

            const kunden = JSON.parse(data);
            const kunde = kunden.find(k => k.rfid === rfid);
            if (!kunde) return;

            if (fuellstandMap[rfid] !== 'voll') {
                log(`Leerung ignoriert – ${rfid} war nicht als "voll" gespeichert.`, 'warn');
                return;
            }

            const leerungseintrag = {
                rfid: rfid,
                vorname: kunde.vorname,
                nachname: kunde.nachname,
                adresse: kunde.adresse,
                leerungsdatum: timestamp
            };

            readFile('javascript.admin', leerungDatei, (err2, leerungData) => {
                let liste = [];
                if (!err2 && leerungData) {
                    try { liste = JSON.parse(leerungData); } catch (_) { }
                }

                liste.push(leerungseintrag);
                writeFile('javascript.admin', leerungDatei, JSON.stringify(liste, null, 2));
                log(`Leerung gespeichert: ${kunde.vorname} ${kunde.nachname}`, 'info');

                // Optional: Füllstand zurücksetzen
                fuellstandMap[rfid] = 'leer';
                writeFile('javascript.admin', fuellstandDatei, JSON.stringify(fuellstandMap, null, 2));

                // Abholliste bereinigen
                readFile('javascript.admin', abholDatei, (err3, abholData) => {
                    if (err3 || !abholData) return;
                    try {
                        let abholListe = JSON.parse(abholData);
                        const neueListe = abholListe.filter(e => e.rfid !== rfid);
                        if (neueListe.length !== abholListe.length) {
                            writeFile('javascript.admin', abholDatei, JSON.stringify(neueListe, null, 2));
                            log(`RFID ${rfid} aus der Abholliste entfernt (nach Leerung).`, 'info');
                        }
                    } catch (e) {
                        log('Fehler beim Bereinigen der Abholliste: ' + e, 'error');
                    }
                });
            });
        });
    } catch (err) {
        log('Fehler beim Verarbeiten der Leerung: ' + err, 'error');
    }
});
