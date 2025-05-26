const kundenDatei = 'Kundendaten.json';
const abholDatei = 'AbholListe.json';
const leerungDatei = 'Leerungen.json';

// MQTT Topics
const topicFuellstand = 'mqtt.0.Muelleimer.Fuellstand';
const topicLeerung = 'mqtt.0.Muelleimer.Leerung';

// Cache: letzter bekannter Füllstand je Tonne (rfid)
let fuellstandMap = {};

// Datenpunkte für Jarvis
createState('javascript.0.anmeldung.abholListeText', '', { type: 'string', read: true, write: false });
createState('javascript.0.anmeldung.abholListeJson', '[]', { type: 'string', read: true, write: false });
createState('javascript.0.leerung.leerungslisteText', '', { type: 'string', read: true, write: false });
createState('javascript.0.leerung.leerungslisteJson', '[]', { type: 'string', read: true, write: false });
createState('javascript.0.kunden.info', '{}', { type: 'string', read: true, write: false }); // Letzter Kunde

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

            fuellstandMap[rfid] = status;

            if (status === 'voll') {
                const eintrag = {
                    rfid,
                    vorname: kunde.vorname,
                    nachname: kunde.nachname,
                    adresse: kunde.adresse,
                    gemeldet_am: zeitString,
                    timestamp: zeitStempel // NEU
                };

                readFile('javascript.admin', abholDatei, (err2, abholData) => {
                    let liste = [];
                    if (!err2 && abholData) {
                        try { liste = JSON.parse(abholData); } catch (_) { }
                    }

                    const dreißigTageMs = 1000 * 60 * 60 * 24 * 30;
                    const bereitsGemeldet = liste.some(e =>
                        e.rfid === rfid &&
                        e.timestamp &&
                        zeitStempel - e.timestamp < dreißigTageMs
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
                log(`Leerung ignoriert: ${rfid} war nicht als "voll" markiert`, 'warn');
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

                // kunden.info aktualisieren
                const kundeMitLeerung = {
                    ...kunde,
                    leerungsdatum: timestamp
                };
                setState('javascript.0.kunden.info', JSON.stringify(kundeMitLeerung), true);

                // Aus Abholliste entfernen
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

// ---------------------------------------------------
// 3. Alle 30 Sekunden: Anzeige aktualisieren
// ---------------------------------------------------
schedule("*/30 * * * * *", () => {
    // Abholliste anzeigen
    readFile('javascript.admin', abholDatei, (err, data) => {
        if (err || !data) {
            setState('javascript.0.anmeldung.abholListeText', 'Keine Einträge vorhanden.');
            setState('javascript.0.anmeldung.abholListeJson', '[]');
            return;
        }

        try {
            const eintraege = JSON.parse(data);
            eintraege.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

            const text = eintraege.map(e => {
                return `${e.adresse}
RFID: ${e.rfid}
Gemeldet am: ${e.gemeldet_am}`;
            }).join('\n\n---\n\n');

            setState('javascript.0.anmeldung.abholListeText', text);
            setState('javascript.0.anmeldung.abholListeJson', JSON.stringify(eintraege, null, 2));
        } catch (e) {
            log('Fehler beim Parsen der Abholliste: ' + e, 'error');
        }
    });

    // Leerungsliste anzeigen
    readFile('javascript.admin', leerungDatei, (err, data) => {
        if (err || !data) {
            setState('javascript.0.leerung.leerungslisteText', 'Keine Leerungen vorhanden.');
            setState('javascript.0.leerung.leerungslisteJson', '[]');
            return;
        }

        try {
            const eintraege = JSON.parse(data);
            eintraege.sort((a, b) => new Date(b.leerungsdatum) - new Date(a.leerungsdatum));

            const text = eintraege.map(e => {
                return `RFID: ${e.rfid}
Name: ${e.vorname} ${e.nachname}
Adresse: ${e.adresse}
Leerungsdatum: ${e.leerungsdatum}`;
            }).join('\n\n---------------------\n\n');

            setState('javascript.0.leerung.leerungslisteText', text);
            setState('javascript.0.leerung.leerungslisteJson', JSON.stringify(eintraege, null, 2));
        } catch (e) {
            log('Fehler beim Parsen der Leerungsliste: ' + e, 'error');
        }
    });
});
