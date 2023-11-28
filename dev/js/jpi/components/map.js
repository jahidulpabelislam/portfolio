;new (function() {
    "use strict";

    var map = this;

    this.$map = jQuery(".js-map");

    this.initMap = function() {
        var zoomLevel = 12;
        var bognorRegisLat = 50.7842;
        var bognorRegisLng = -0.674;
        var bognorRegisLocation = new google.maps.LatLng(bognorRegisLat, bognorRegisLng);
        var config = {
            center: bognorRegisLocation,
            zoom: zoomLevel,
            zoomControl: true,
            mapTypeControl: false,
            scaleControl: false,
            streetViewControl: false,
            rotateControl: false,
            fullscreenControl: false,
            styles: JPI.googleMapStyles || {},
        };
        var map = new google.maps.Map(this.$map[0], config);

        new google.maps.Marker({
            position: bognorRegisLocation,
            icon: window.location.origin + "/assets/images/marker.png",
            map: map,
        });

        google.maps.event.addDomListener(window, "resize", function() {
            map.setCenter(bognorRegisLocation);
        });
    };

    jQuery(function() {
        google.maps.event.addDomListener(window, "load", map.initMap.bind(map));
    });
})();
