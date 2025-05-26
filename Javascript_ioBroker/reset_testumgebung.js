// Manuelles Reinigungsskript für Testumgebung
// Achtung: löscht ALLE Abhol- und Leerungsdaten – NICHT Kundendaten

const abholDatei = 'AbholListe.json';
const leerungDatei = 'Leerungen.json';

// Dateien zurücksetzen
writeFile('javascript.admin', abholDatei, JSON.stringify([], null, 2), err => {
    if (err) {
        log('Fehler beim Zurücksetzen der Abholliste: ' + err, 'error');
    } else {
        log('Abholliste erfolgreich geleert.', 'info');
    }
});

writeFile('javascript.admin', leerungDatei, JSON.stringify([], null, 2), err => {
    if (err) {
        log('Fehler beim Zurücksetzen der Leerungsliste: ' + err, 'error');
    } else {
        log('Leerungsliste erfolgreich geleert.', 'info');
    }
});

// States zurücksetzen
setState('javascript.0.anmeldung.abholListeText', 'Keine Einträge vorhanden.');
setState('javascript.0.anmeldung.abholListeJson', '[]');
setState('javascript.0.leerung.leerungslisteText', 'Keine Leerungen vorhanden.');
setState('javascript.0.leerung.leerungslisteJson', '[]');
setState('javascript.0.kunden.info', '{}');

log('Testumgebung zurückgesetzt. Kundendaten wurden nicht verändert.', 'info');
