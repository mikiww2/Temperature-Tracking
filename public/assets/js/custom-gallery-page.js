//

function setAlert(type, message) {
    var alert = document.getElementById('galleryAlert');

    alert.classList.remove('alert-success');
    alert.classList.remove('alert-info');
    alert.classList.remove('alert-warning');
    alert.classList.remove('alert-danger');

    alert.classList.add('alert-' + type);

    alert.innerText = message;

    alert.classList.replace('d-none', 'd-block');
}


// delete map
var deleteMapId;

var loadDeleteMap = function(id) {
    deleteMapId = id;
};

var deleteMap = function() {

    var query = new XMLHttpRequest();

    var url = '/api/map/' + deleteMapId + '/delete';

    query.open('GET', url, true);

    query.onreadystatechange = function() {
        if (this.readyState == 4) {
            if (this.status == 200)
                return location.reload(true);

            console.log('Error code: ' + this.status);
            console.log(this.responseText);

            setAlert('danger', 'Non sono riuscito ad eliminare la mappa .');
        }
    };

    query.send();
};


// create map

var createMap = function() {
    var name = document.getElementById('nameMapModal').value;

    if (!name) {
        return setAlert('danger', 'La mappa deve avere un nome .');
    }

    var query = new XMLHttpRequest();

    var url = '/api/map/';

    query.open('POST', url, true);
    query.setRequestHeader('Content-type', 'application/json');

    query.onreadystatechange = function() {
        if (this.readyState == 4) {
            if (this.status == 200)
                return location.reload(true);

            console.log('Error code: ' + this.status);
            console.log(this.responseText);

            setAlert('danger', 'Non sono riuscito a creare la mappa .');
        }
    };

    query.send(JSON.stringify({ name: name }));
};