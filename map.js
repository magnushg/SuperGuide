var scope,
    jeloya,
    helloMarker,
    map,
    textPopup,
    paths = {},
    userMarkers = {},
    lineColors = {},
    lineLayer,
    markerLayer,
    zoom = 16;

// Breaking ze cache

$(function () {
        map = L.map('map', {
            zoomControl: false
        }).setView([59, 10], zoom);

        lineLayer = L.layerGroup([])
            .addTo(map);

        markerLayer = L.layerGroup([])
            .addTo(map);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 18,
            attribution: 'SuperGuide - Maps by OpenStreetMap',
            id: 'superguideMap'
        }).addTo(map);


        scope = angular.element($('body')).scope();
        scope.users.$loaded(
            function (data) {
                console.log("Data: ", data);
                var users = scope.users;
                $.each(users, function (userIdx, userElement) {
                    var userKey = userElement.$id;
                    var trackings = userElement.Trackings;

                    if (!trackings) {
                        console.log("No trackings?");
                        return;
                    }

                    $.each(trackings, function (trackingKey, trackingElement) {
                        addPosition(userKey, trackingElement.lat, trackingElement.lng);
                        updateMapPin(userKey, [trackingElement.lat, trackingElement.lng], "Last position");
                    });
                });

                updateMapToBounds();

                scope.users.$watch(function (data) {
                    lineLayer.clearLayers();
                    markerLayer.clearLayers();
                    paths = {};
                    userMarkers = {};

                    var users = scope.users;
                    $.each(users, function (userKey, userElement) {
                        var trackings = userElement.Trackings;

                        if (!trackings) {
                            console.log("No trackings?");
                            return;
                        }

                        $.each(trackings, function (trackingKey, trackingElement) {
                            addPosition(userKey, trackingElement.lat, trackingElement.lng);
                            updateMapPin(userKey, [trackingElement.lat, trackingElement.lng], "Last position");
                        });
                    });
                    updateMapToBounds();
                });

                map.on('click', function (e) {
                    addPosition('click', e.latlng.lat, e.latlng.lng);
                });
            })
    },
    function (err) {
        console.error(err);
    });

function addMapPin(userId, pos, text) {
    if (!lineColors[userId]) {
        lineColors[userId] = getRandomColor();
    }
    var icon = L.MakiMarkers.icon({icon: "pitch", color: lineColors[userId], size: "m"});
    userMarkers[userId] = L.marker(pos, {icon: icon});
    var popup = new L.popup().setContent("User: " + userId);
    userMarkers[userId].bindPopup(popup).openPopup();
    markerLayer.addLayer(userMarkers[userId]);

}

function updateMapPin(userId, pos, text) {
    if (userMarkers[userId]) {
        userMarkers[userId].setLatLng(pos);
    } else {
        addMapPin(userId, pos, text);
    }
}

function updateMapToBounds() {
    var bounds = null;

    var layers = lineLayer.getLayers();
    for (var i=0; i<layers.length; i++) {
        var currentLayer = layers[i];

        var curBounds = currentLayer.getBounds();

        if (bounds === null) {
            bounds = new L.LatLngBounds(curBounds);
        } else {
            bounds.extend(curBounds);
        }
    }

    map.fitBounds(bounds);
}

function getRandomColor() {
    return '#' + ('000000' + (Math.random() * 0xFFFFFF << 0).toString(16)).slice(-6);
}

function addPosition(lineId, lat, lng) {
    if (paths[lineId]) {
        paths[lineId].addLatLng([lat, lng]);
    } else {
        if (!lineColors[lineId]) {
            lineColors[lineId] = getRandomColor();
        }
        paths[lineId] = L.polyline([[lat, lng]], {color: lineColors[lineId]});
        lineLayer.addLayer(paths[lineId]);
    }
}


window.onload = function () {
    cast.receiver.logger.setLevelValue(0);
    window.castReceiverManager = cast.receiver.CastReceiverManager.getInstance();
    console.log('Starting Receiver Manager');

    // handler for the 'ready' event
    castReceiverManager.onReady = function (event) {
        console.log('Received Ready event: ' + JSON.stringify(event.data));
        window.castReceiverManager.setApplicationState("Application status is ready...");
    };

    // handler for 'senderconnected' event
    castReceiverManager.onSenderConnected = function (event) {
        console.log('Received Sender Connected event: ' + event.data);
        console.log(window.castReceiverManager.getSender(event.data).userAgent);
    };

    // handler for 'senderdisconnected' event
    castReceiverManager.onSenderDisconnected = function (event) {
        console.log('Received Sender Disconnected event: ' + event.data);
        if (window.castReceiverManager.getSenders().length == 0) {
            window.close();
        }
    };

    // handler for 'systemvolumechanged' event
    castReceiverManager.onSystemVolumeChanged = function (event) {
        console.log('Received System Volume Changed event: ' + event.data['level'] + ' ' +
        event.data['muted']);
    };

    // create a CastMessageBus to handle messages for a custom namespace
    window.messageBus =
        window.castReceiverManager.getCastMessageBus(
            'urn:x-cast:com.google.cast.sample.helloworld');

    // handler for the CastMessageBus message event
    window.messageBus.onMessage = function (event) {
        console.log('Message [' + event.senderId + ']: ' + event.data);
        // display the message from the sender
        displayText(event.data);
        // inform all senders on the CastMessageBus of the incoming message event
        // sender message listener will be invoked
        window.messageBus.send(event.senderId, event.data);
    };

    // initialize the CastReceiverManager with an application status message
    window.castReceiverManager.start({statusText: "Application is starting"});
    console.log('Receiver Manager started');
};


// utility function to display the text message in the input field
function displayText(text) {
    console.log(text);
    textPopup.setContent(text);
    var scope = angular.element($('body')).scope();
    scope.message = text;
    window.castReceiverManager.setApplicationState(text);
}
