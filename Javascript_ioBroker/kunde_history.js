// Nur bei Bedarf manuell aktivieren – liest Verlauf von kunden.info der letzten 7 Tage

const historyOptions = {
    id: 'javascript.0.kunden.info',
    options: {
        start: Date.now() - 1000 * 60 * 60 * 24 * 7, // letzte 7 Tage
        end: Date.now(), // bis jetzt
        count: 1000,
        aggregate: 'none'
    }
};

getHistory(historyOptions, (err, data) => {
    if (err) {
        log('Fehler beim Abrufen der History: ' + err, 'error');
        return;
    }

    const eintraege = data.result || [];

    if (eintraege.length === 0) {
        log('Keine historischen Einträge gefunden.', 'info');
        return;
    }

    eintraege.forEach(entry => {
        try {
            const kunde = JSON.parse(entry.val);
            const zeit = new Date(entry.ts).toLocaleString('de-DE');
            log(`Zeit: ${zeit} | ${kunde.vorname} ${kunde.nachname} (${kunde.rfid}) – ${kunde.adresse}`);
        } catch (e) {
            log('Fehler beim Parsen eines Eintrags: ' + e.message, 'warn');
        }
    });
});
