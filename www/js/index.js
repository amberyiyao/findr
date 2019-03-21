let app = {
    map: null,
    markerList: [],
    markers: [],
    center: {
        lat: 45.3496711,
        lng: -75.7569551
    },
    infoWindow: null,
    init: function () {
        if (localStorage.getItem('markers')) {
            app.markerList = JSON.parse(localStorage.getItem('markers'));
        }
        app.getGolocation();
        app.addListeners();
    },
    addListeners: function () {
        document.getElementById('close').addEventListener('click', app.backMap);
        document.getElementById('save').addEventListener('click', app.saveMarker);
    },
    backMap: function () {
        document.getElementById('add').classList.add('hide');
    },
    getGolocation: function () {
        if (navigator.geolocation) {
            const opts = {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 1000 * 60 * 60 * 24,
            };
            navigator.geolocation.getCurrentPosition((pos) => {
                console.log('get geolocation!')
                app.center = {
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude
                }
                document.getElementById('loading').classList.add('hide');
                app.getMap();
            }, (err) => {
                document.getElementById('loading').classList.add('hide');
                app.getMap();
                alert(err.message);
            }, opts);
        }
    },
    getMap: function () {
        app.map = new google.maps.Map(document.getElementById("map"), {
            center: app.center,
            zoom: 15,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            disableDoubleClickZoom: true
        });
        app.map.addListener('dblclick', app.newMarker);
        app.createMarkers();
    },
    createMarkers: function () {
        let i = 0;
        setTimeout(() => {
            if (app.markerList != []) {
                app.markerList.forEach((item) => {
                    let marker = new google.maps.Marker({
                        id: item.id,
                        position: item.position,
                        map: app.map,
                        label: null,
                        icon: app.icon,
                    });
                    app.markers.push(marker);
                    marker.addListener("click", app.showInfoWindow);
                    i++;
                })
            }
        }, i * 200);
    },
    icon: {
        url: "./img/marker.png", // url
        scaledSize: new google.maps.Size(20, 27), // scaled size
        origin: new google.maps.Point(0, 0), // origin
        anchor: new google.maps.Point(10, 27) // anchor
    },
    showInfoWindow: function (ev) {

        if (app.infoWindow) {
            app.infoWindow.close();
            app.infoWindow = null;
        }

        let position = {
            lat: ev.latLng.lat(),
            lng: ev.latLng.lng()
        };

        let n = app.markerList.findIndex((item) => {
            if (item.position.lat == position.lat && item.position.lng == position.lng) {
                return true;
            }
        });

        let contentString = `<div class="infoWindow">
        <p class="infoLabel">${app.markerList[n].label}</p>
        <i id="deleteButton" onclick="app.deleteMarker(${app.markerList[n].id})" class="far fa-trash-alt"></i>
        </div>`;

        app.infoWindow = new google.maps.InfoWindow({
            map: app.map,
            content: contentString,
            position: position
        });
    },
    deleteMarker: function (id) {
        let n = app.markerList.findIndex(item => item.id == id);

        app.markerList.splice(n, 1);
        app.infoWindow.close();

        localStorage.setItem('markers', JSON.stringify(app.markerList));

        app.markers.forEach((item) => {
            if (item.id == id) {
                item.setMap(null);
            }
        });
    },
    newMarker: function (ev) {

        document.getElementById('newLabel').value = "";

        app.newPos = {
            lat: ev.latLng.lat(),
            lng: ev.latLng.lng()
        }
        app.map.setCenter(app.newPos);

        document.getElementById('add').classList.remove('hide');
    },
    newPos: {},
    saveMarker: function () {

        let newId = Date.now();

        let newMarker = new google.maps.Marker({
            id: newId,
            position: app.newPos,
            map: app.map,
            icon: app.icon,
            label: null,
            animation: google.maps.Animation.DROP
        });

        console.log(newMarker);

        app.markers.push(newMarker);

        let newMarkerInfo = {
            id: newId,
            label: document.getElementById('newLabel').value,
            position: app.newPos
        };

        newMarker.addListener("click", app.showInfoWindow);

        app.markerList.push(newMarkerInfo);

        localStorage.setItem('markers', JSON.stringify(app.markerList));

        document.getElementById('add').classList.add('hide');
    }
}

document.addEventListener("DOMContentLoaded", app.init);