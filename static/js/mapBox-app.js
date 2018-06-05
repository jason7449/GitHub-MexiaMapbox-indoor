mapboxgl.accessToken = 'pk.eyJ1IjoiamFzb243NDQ5IiwiYSI6ImNqZ21udWtldDBkc2oycnFzczJ6MW1hcHoifQ.dYkl0nna2yXZ64joo7Se_Q';
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/jason7449/cjhtmx25o81yy2snrswfoca8r',
     center: [-73.87217, 40.77512],
    zoom: 19.08,
    pitch: 10, //x-axis
    bearing: 0, //y-axis
    hash: true,
    container: 'map',
//    interactive: false // disable dragging & zoom
});

//// disable map zoom when using scroll
//map.scrollZoom.disable();
//map.dragging.disable();








//----------------------Start get source from URL--------------
var position_data = "http://127.0.0.1:5000/position"
map.on('load', function () {
    window.setInterval(function() {
        map.getSource('people').setData(position_data);
    }, 300);

    map.addSource('people', { type: 'geojson', data: position_data });
    map.addLayer({
        "id": "people",
        "type": "symbol",
        "source": "people",
        "layout": {
            "icon-image": "triangle-15"
        }
    });


});




//var url = 'https://wanderdrone.appspot.com/';
//map.on('load', function () {
//    window.setInterval(function() {
//        map.getSource('drone').setData(url);
//    }, 500);
//
//    map.addSource('drone', { type: 'geojson', data: url });
//    map.addLayer({
//        "id": "drone",
//        "type": "symbol",
//        "source": "drone",
//        "layout": {
//            "icon-image": "triangle-15"
//        }
//    });
//
//
//});

//----------------------End get source from URL--------------












////-----------------------start routing--------------------------------
// start_position
var origin = [-73.872637, 40.7750943];

// Endposition
var destination = [-73.8726393, 40.7749636];
var destination2 = [-73.8725728, 40.7749861];

// A simple line from origin to destination.
var route = {
    "type": "FeatureCollection",
    "features": [{
        "type": "Feature",
        "geometry": {
            "type": "LineString",
            "coordinates": [
                origin,
                destination,
                destination2
            ]
        }
    }]
};

// A single point that animates along the route.
// Coordinates are initially set to origin.
var point = {
    "type": "FeatureCollection",
    "features": [{
        "type": "Feature",
        "properties": {},
        "geometry": {
            "type": "Point",
            "coordinates": origin
        }
    }]
};

// Calculate the distance in kilometers between route start/end point.
var lineDistance = turf.lineDistance(route.features[0], 'kilometers');

var arc = [];

// Number of steps to use in the arc and animation, more steps means
// a smoother arc and animation, but too many steps will result in a low frame rate
var steps = 300;

// Draw an arc between the `origin` & `destination` of the two points
for (var i = 0; i < lineDistance; i += lineDistance / steps) {
    var segment = turf.along(route.features[0], i, 'kilometers');
    arc.push(segment.geometry.coordinates);
}

// Update the route with calculated arc coordinates
route.features[0].geometry.coordinates = arc;

// Used to increment the value of the point measurement against the route.
var counter = 0;

map.on('load', function () {
    // Add a source and layer displaying a point which will be animated in a circle.
    map.addSource('route', {
        "type": "geojson",
        "data": route
    });

    map.addSource('point', {
        "type": "geojson",
        "data": point
    });

// Adding line on Map
//    map.addLayer({
//        "id": "route",
//        "source": "route",
//        "type": "line",
//        "paint": {
//            "line-width": 2,
//            "line-color": "#007cbf"
//        }
//    });

    map.addLayer({
        "id": "point",
        "source": "point",
        "type": "symbol",
        "layout": {
            "icon-image": "triangle-15",
            "icon-rotate": ["get", "bearing"],
            "icon-rotation-alignment": "map",
            "icon-allow-overlap": true
        }
    });

    function animate() {
        // Update point geometry to a new position based on counter denoting
        // the index to access the arc.
        point.features[0].geometry.coordinates = route.features[0].geometry.coordinates[counter];

        // Calculate the bearing to ensure the icon is rotated to match the route arc
        // The bearing is calculate between the current point and the next point, except
        // at the end of the arc use the previous point and the current point
        point.features[0].properties.bearing = turf.bearing(
            turf.point(route.features[0].geometry.coordinates[counter >= steps ? counter - 1 : counter]),
            turf.point(route.features[0].geometry.coordinates[counter >= steps ? counter : counter + 1])
        );

        // Update the source with this new data.
        map.getSource('point').setData(point);

        // Request the next frame of animation so long the end has not been reached.
        if (counter < steps) {
            requestAnimationFrame(animate);
        }

        counter = counter + 1;
    }

    document.getElementById('replay').addEventListener('click', function() {
        // Set the coordinates of the original point back to origin
        point.features[0].geometry.coordinates = origin;

        // Update the source layer
        map.getSource('point').setData(point);

        // Reset the counter
        counter = 0;

        // Restart the animation.
        animate(counter);
    });

    // Start the animation.
    animate(counter);
});
////-----------------------End routing--------------------------------




