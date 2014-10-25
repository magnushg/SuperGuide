var scope, jeloya, helloMarker, map, paths, textPopup;

$(function () {
  scope = angular.element($('body')).scope();
  scope.positions.$loaded(
    function(data) {
      var positions = scope.positions;
      initialPos = [positions[positions.length -1 ].lat, positions[positions.length -1 ].lng];
      map = L.map('map', {
        zoomControl: false
      }).setView(initialPos, 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: 'SuperGuide - Maps by OpenStreetMap',
        id: 'superguideMap'
      }).addTo(map);

      addMapPin(initialPos, "Last position");

      scope.positions.$watch(function(data) {
        console.log("Position changed: " + data);
        var newPos = [positions[positions.length -1 ].lat, positions[positions.length -1 ].lng];
        updateMapPin(newPos, "new position");
      })

      paths = {};
      map.on('click', function(e) {
        addPosition('click', e.latlng.lat, e.latlng.lng);
      });
    })
    },
    function(err) {
      console.error(err);
    })

    function addMapPin(pos, text) {
      helloMarker = L.marker(pos);
      textPopup = L.popup()
          .setContent(text);
      helloMarker.addTo(map).bindPopup(textPopup).openPopup();
    }

    function updateMapPin(pos, text) {
      helloMarker.setLatLng(pos);
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

    function getRandomColor() {
      return '#'+ ('000000' + (Math.random()*0xFFFFFF<<0).toString(16)).slice(-6);
    }

    function addPosition(lineId, lat, lng) {
      console.log("Adding position ", lineId, lat, lng);
      if (paths[lineId]) {
        console.log("Exists");
        paths[lineId].addLatLng([lat, lng]);
      } else {
        console.log("Creating new");
        paths[lineId] = L.polyline([[lat, lng]], {color: getRandomColor()});
        paths[lineId].addTo(map);
      }
    }


    // utility function to display the text message in the input field
    function displayText(text) {
      console.log(text);
      textPopup.setContent(text);
      window.castReceiverManager.setApplicationState(text);
    }
