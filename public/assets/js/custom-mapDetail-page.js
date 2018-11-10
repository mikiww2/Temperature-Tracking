//

function setAlert(type, message) {
    var alert = document.getElementById('mapAlert');

    alert.classList.remove('alert-success');
    alert.classList.remove('alert-info');
    alert.classList.remove('alert-warning');
    alert.classList.remove('alert-danger');

    alert.classList.add('alert-' + type);

    alert.innerText = message;

    alert.classList.replace('d-none', 'd-block');
}

// create & update detector

var modeDetectorModal;
var updateDetectorId;
var updateOldDetector;

var loadDetectorModal = function(mode, id) {
    modeDetectorModal = mode;

    switch (mode) {
        case 'update':
            if (!id)
                console.log('id undefined in update modal case');

            updateDetectorId = id;
            updateOldDetector = {};

            document.getElementById('nameDetectorModal').value = document.getElementById(id).children[0].innerText.replace(/\s/g, '');
            updateOldDetector.name = document.getElementById(id).children[0].innerText;

            if (document.getElementById(id).children[1].innerText.includes('Interna')) {
                document.getElementById('positionDetectorModal').selectedIndex = 1;
                updateOldDetector.position = 'indoor';
            }

            if (document.getElementById(id).children[1].innerText.includes('Esterna')) {
                document.getElementById('positionDetectorModal').selectedIndex = 2;
                updateOldDetector.position = 'outdoor';
            }

            if (!document.getElementById(id).children[1].innerText.includes('Interna') && !document.getElementById(id).children[1].innerText.includes('Esterna')) {
                document.getElementById('positionDetectorModal').selectedIndex = 0;
                updateOldDetector.position = 'undefined';
            }
            break;
        case 'create':
        default:
            document.getElementById('nameDetectorModal').value = '';
            document.getElementById('positionDetectorModal').selectedIndex = 0;
    }

};

var executeDetector = function(mapId) {
    if (modeDetectorModal == 'update')
        return updateDetector(mapId);

    return createDetector(mapId);
};

function createDetector(mapId) {
    var name = document.getElementById('nameDetectorModal').value;
    var position = document.getElementById('positionDetectorModal').options[document.getElementById('positionDetectorModal').selectedIndex].value;

    if (!name) {
        setAlert('danger', 'Devi dare un nome al termometro che vuoi aggiungere .');

        return $("#DetectorModal").modal();
    }

    var query = new XMLHttpRequest();
    query.open('POST', '/api/map/' + mapId + '/detector', true);
    query.setRequestHeader('Content-Type', 'application/JSON');

    query.onreadystatechange = function() {
        if (this.readyState == 4) {
            if (this.status == 200)
                return location.reload(true);

            console.log('Error code: ' + this.status);
            console.log(this.responseText);

            return setAlert('danger', 'Non sono riuscito a creare il termometro .');
        }
    };

    query.send(JSON.stringify({ name: name, position: position }));
}

function updateDetector(mapId) {

    var name = document.getElementById('nameDetectorModal').value;

    if (!name) {
        setAlert('danger', 'Il termometro deve avere un nome .');

        return $("#DetectorModal").modal();
    }

    var position = document.getElementById('positionDetectorModal').options[document.getElementById('positionDetectorModal').selectedIndex].value;

    var payload = {};

    if (updateOldDetector.name && updateOldDetector.name != name)
        payload.name = name;

    if (updateOldDetector.position && updateOldDetector.position != position)
        payload.position = position || 'undefined';

    if (!payload)
        return;

    var query = new XMLHttpRequest();
    query.open('POST', '/api/map/' + mapId + '/detector/' + updateDetectorId + '/update', true);
    query.setRequestHeader('Content-Type', 'application/JSON');

    query.onreadystatechange = function() {
        if (this.readyState == 4) {
            if (this.status == 200)
                return location.reload(true);

            console.log('Error code: ' + this.status);
            console.log(this.responseText);

            return setAlert('danger', 'Non sono riuscito ad aggiornare il termometro .');
        }
    };

    query.send(JSON.stringify(payload));
}

// delete detector

var deleteDetectorId;

var loadDeleteDetectorModal = function(id) {
    deleteDetectorId = id;
};

var deleteDetector = function(mapId) {
    var query = new XMLHttpRequest();
    query.open('GET', '/api/map/' + mapId + '/detector/' + deleteDetectorId + '/delete', true);

    query.onreadystatechange = function() {
        if (this.readyState == 4) {
            if (this.status == 200) {
                //return location.reload(true);

                document.getElementById('idTable').removeChild(document.getElementById(deleteDetectorId));
                return setAlert('success', 'Termometro eliminato correttamente .');
            }

            console.log('Error code: ' + this.status);
            console.log(this.responseText);

            return setAlert('danger', 'Non sono riuscito ad eliminare il termometro .');
        }
    };

    query.send();
};

// update map name

var updateNameMap = function(mapId) {
    var newName = document.getElementById('nameMapModal').value;

    if (document.getElementById('nameMap').innerText == newName || !name) {
        setAlert('danger', 'La mappa non può rimanere senza nome .');

        return $("#updateNameMapModal").modal();
    }

    var query = new XMLHttpRequest();
    query.open('POST', '/api/map/' + mapId + '/update', true);
    query.setRequestHeader('Content-Type', 'application/JSON');

    query.onreadystatechange = function() {
        if (this.readyState == 4) {
            if (this.status == 200) {
                //return location.reload(true);

                document.getElementById('nameMap').innerText = JSON.parse(this.responseText).map.name;

                return setAlert('success', 'Nome della mappa cambiato correttamente .');
            }

            console.log('Error code: ' + this.status);
            console.log(this.responseText);

            return setAlert('danger', 'Non sono riuscito a modificare il nome della mappa .');
        }
    };

    query.send(JSON.stringify({ name: newName }));
};

var areachartfalse;

var loadChart = function(name, data) {

    var l = [],
        v = [];

    var a = data.split('%').filter(Boolean);

    while (a.length) {
        l.push(a.shift().toString().slice(10));
        v.push(a.shift());
    }

    if (areachartfalse)
        delete areachartfalse;

    var ctx = document.getElementById("linechart");
    areachartfalse = new Chart(ctx, {
        type: 'line',
        data: {
            labels: l,
            datasets: [{
                label: name || 'Termometro',
                fill: false,
                backgroundColor: '#00c292',
                borderColor: '#00c292',
                data: v
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            spanGaps: false,
            title: {
                display: false,
                text: ''
            },
            elements: {
                line: {
                    tension: 0.000001
                }
            },
            plugins: {
                filler: {
                    propagate: false
                }
            },
            scales: {
                xAxes: [{
                    ticks: {
                        autoSkip: false,
                        maxRotation: 0
                    }
                }]
            }
        }
    });
};