var tiles = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    minZoom: 2,
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
});
var latlng = L.latLng(40.7756816, -73.8767632);
var map = L.map('map', {
    center: latlng,
    zoom: 8,
    zoomControl: false,
    fullscreenControl: true,
    fullscreenControlOptions: { // optional
        title: "Show me the fullscreen !",
        titleCancel: "Exit fullscreen mode"
    },
    layers: [tiles]
});


var buildings = L.tileLayer.wms("http://localhost:8080/geoserver/Malleshwaram/wms",
        {
            layers: 'Buildings',
            format: 'image/png',
            transparent: true
        });



var markers = L.markerClusterGroup();
var markerList = [];
var controlSearch = new L.Control.Search({
    position: 'topright',
    layer: markers,
    initial: false,
    zoom: 18,
    marker: false
});

$.ajax({
    url: '/api',
    type: 'POST',
    dataType: "json",
    success: function (map_data) {
        for (var i = 0; i < map_data.length; i++) {
            var title = map_data[i].Name;
            var selfIcon = L.divIcon({
                className: 'my-div-icon',
                iconSize: [50, 50],
//                html: '<img  class="circle_img" src="' + map_data[i].Picture + '" style="border: 3px solid ' + map_data[i].Color + '" />'
                html: '<span class="dot"></span>'
            });
            var marker = L.marker(new L.LatLng(map_data[i].Latitude, map_data[i].Longitude), {
                title: title,
                icon: selfIcon
            }).setBouncingOptions({
                bounceHeight: 20,
                exclusive: true
            }).on('click', function () {
                this.bounce(3);
            }).addTo(markers);

            var content = title + "</br>" + "Latitude:" + map_data[i].Latitude + "</br>" + "Longitude:" + map_data[i].Longitude;
            marker.bindPopup(content, {
                maxWidth: 600
            });

            markers.addLayer(marker);
            markerList.push(marker);

        }
        controlSearch.on('search:locationfound', function (e) {
            if (e.layer._popup) {
                var index = markerList.map(function (e) {
                    return e.options.title;
                }).indexOf(e.text);
                var m = markerList[index];
                markers.zoomToShowLayer(m, function () {
                    m.openPopup();
                    m.bounce(3);
                });
            }
        });
        map.addControl(controlSearch);
        map.addLayer(markers);
        //mini map
        lc = L.control.locate({
            position: 'topright',
            strings: {
                title: "Show me where I am, yo!",
                popup: "i am here"
            },
            drawCircle: true,
            showPopup: true
        }).addTo(map);

        // zoom position
        L.control.zoom({
            position: 'topright'
        }).addTo(map);
    }
});

var imageUrl = 'http://www.lib.utexas.edu/maps/historical/newark_nj_1922.jpg',
    imageBounds = [[30.712216, 104.22655], [30.773941, 104.12544]];
L.imageOverlay(imageUrl, imageBounds).addTo(map);

//
//var gl = L.mapboxGL({
//    accessToken: 'pk.eyJ1IjoiamFzb243NDQ5IiwiYSI6ImNqZ21udWtldDBkc2oycnFzczJ6MW1hcHoifQ.dYkl0nna2yXZ64joo7Se_Q',
//    style: 'mapbox://styles/jason7449/cjgmrnyrz000k2rqncyvxd414'
//}).addTo(map);

