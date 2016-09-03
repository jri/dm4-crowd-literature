angular.module("crowd").controller("MainController", function($scope, $rootScope, $location, $timeout, crowdService,
                                                              leafletData) {
    var SHOW_BUSTOUR = true;
    var BUSTOUR_ZOOM_THRESHOLD = 11;    // bustour is shown only below this zoom level

    var bustour;                        // GeoJSON cache

    var today = todayDate();
    
    $scope.hires = matchMedia("(min-resolution: 144dpi)").matches;  // put in scope solely for debugging
    $scope.devicePixelRatio = devicePixelRatio;                     // put in scope solely for debugging

    // --- Leaflet config (marker + cluster) ---

    var markerIcon          = createMarkerIcon(false);
    var markerIconEventOver = createMarkerIcon(false, true);
    var markerIconSelected  = createMarkerIcon(true);

    if (!$scope.hires) {
        var clusterSize = 40;
        var maxClusterRadius = 40;
        var spiderfyDistanceMultiplier = 1.5;
    } else {
        var clusterSize = 52;
        var maxClusterRadius = 52;
        var spiderfyDistanceMultiplier = 2;
    }

    // --- Leaflet config (map) ---

    $scope.center = {
        lat: 56.5,
        lng: 20,
        zoom: 4
        // lat: 42,     // focus on south europe for 2nd tour half
        // lng: 24,
        // zoom: 5
    }

    $scope.defaults = {
        scrollWheelZoom: true
    }

    $scope.tiles = {
        url: "https://api.mapbox.com/v4/{mapId}/{z}/{x}/{y}.png?access_token={accessToken}",
        options: {
            mapId: 'jri.2eeeaa1d',
            accessToken: 'pk.eyJ1IjoianJpIiwiYSI6ImNpaG5ubmtsdDAwaHB1bG00aGk1c3BhamcifQ.2XkYFs4hGOel8DYCy4qKKw',
            attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a>, ' +
                'Imagery &copy; <a href="http://mapbox.com">Mapbox</a>'
        }
    }

    $scope.layers = {
        overlays: {
            events: {
                name: "Events",
                type: "markercluster",
                visible: true,
                layerParams: {
                    showOnSelector: false,
                    maxClusterRadius: maxClusterRadius,
                    spiderfyDistanceMultiplier: spiderfyDistanceMultiplier,
                    iconCreateFunction: createClusterIcon
                }
            }
        }
    }

    $scope.markers = {};

    // --- Event Listeners ---

    // recalculate the map size each time when the map reappears on screen
    $scope.$watch("mapVisibility", function(mapVisibility) {
        if (mapVisibility) {
            calculateMapSize();
        }
    });

    $scope.$watch("selectedEventId", function(eventId, oldEventId) {
        if (eventId) {
            $scope.markers[eventId].icon = markerIconSelected;
        }
        if (oldEventId) {
            $scope.markers[oldEventId].icon = $scope.markers[oldEventId].eventOver ? markerIconEventOver : markerIcon;
        }
    });

    $scope.$on("leafletDirectiveMarker.map.click", function(event, args) {
        var eventId = args.modelName;
        $location.path("/event/" + eventId);
    })

    // --- Controller Methods ---

    $scope.setMapVisibility = function(mapVisibility) {
        $scope.mapVisibility = mapVisibility;
    }

    $scope.setSelectedEvent = function(eventId) {
        $scope.selectedEventId = eventId;
    }

    // ### TODO: use an Angular filter instead?
    $scope.sortEvents = function(events) {
        if (events) {
            events.sort(function(e1, e2) {
                return compareDateTime(e1.from, e2.from)
            });
        }
    }

    // --- Startup ---

    var mql = matchMedia("(orientation: landscape)");
    mql.addListener(updateOrientation);
    updateOrientation(mql);

    // initial calculation of the map size once the flex layout is done
    calculateMapSize();

    $rootScope.allEvents = crowdService.getAllEvents(function(response) {
        response.data.forEach(function(event) {
            addMarker(event);
        })
    })

    if (SHOW_BUSTOUR) {
        crowdService.loadBustourGeojson(function(response) {
            bustour = {
                data: response.data,
                style: {
                    color: "rgb(218, 105, 6)",
                    weight: 5,
                    opacity: 1,
                    dashArray: "15, 10",
                    lineCap: "butt",
                    lineJoin: "miter"
                }
            }
            $scope.$watch("center.zoom", function(zoom) {
                $scope.bustour = $scope.center.zoom < BUSTOUR_ZOOM_THRESHOLD ? bustour : null;
            });
        })
    }

    // ------------------------------------------------------------------------------------------------- Private Methods

    // --- Marker ---

    function createMarkerIcon(selected, eventOver) {
        return !$scope.hires ? {
            iconUrl: markerIconUrl(selected, eventOver),
            iconSize: [28, 41],
            iconAnchor: [14, 41],
            shadowUrl: "lib/leaflet/images/marker-shadow.png",
            shadowSize: [41, 41],
            shadowAnchor: [12, 41]
        } : {
            iconUrl: markerIconUrl(selected, eventOver),
            iconSize: [36, 53],
            iconAnchor: [18, 53],
            shadowUrl: "lib/leaflet/images/marker-shadow.png",
            shadowSize: [41, 41],
            shadowAnchor: [12, 41]
        }
    }

    function markerIconUrl(selected, eventOver) {
        var iconFile = "event-marker" +
            (selected ? "-selected" : eventOver ? "-over" : "") +
            ($scope.hires ? "-1.3x" : "") + ".png";
        return "lib/leaflet/images/" + iconFile;
    }

    function addMarker(event) {
        if (event.lat != undefined && event.lng != undefined) {
            var eventOver = dateIsOver(event.from);
            $scope.markers[event.id] = {
                lat: event.lat,
                lng: event.lng,
                layer: "events",
                icon: eventOver ? markerIconEventOver : markerIcon,
                eventOver: eventOver
            }
        } else {
            console.log("WARNING: event \"" + event.title + "\" (" + event.id +
                ") can't appear on map -- its geo coordinate is unknown")
        }
    }

    // --- Cluster ---

    function createClusterIcon(cluster) {
        return new L.DivIcon({
            html: "<div><span>" + cluster.getChildCount() + "</span></div>",
            className: "marker-cluster" + (allEventsOver(cluster) ? " all-events-over" : ""),
            iconSize: new L.Point(clusterSize, clusterSize)
        });
    }

    function allEventsOver(cluster) {
        return cluster.getAllChildMarkers().every(function(marker) {
            return marker.options.eventOver;
        });
    }

    // --- Map ---

    function calculateMapSize() {
        leafletData.getMap("map").then(function(map) {
            $timeout(function() {
                map.invalidateSize();
            }, 1200);
        });
    }

    // --- Viewport ---

    function updateOrientation(mql) {
        // Note: this media query listener is called directly from the browser, that is outside the angular context.
        // So, we must explicitly $apply the scope manipulation.
        $scope.$applyAsync(function() {
            $scope.landscape = mql.matches;
            $scope.portrait = !$scope.landscape
        })
    }

    // --- Date ---

    function dateIsOver(dt) {
        return compareDateTime(dt, today) < 0;
    }

    function compareDateTime(dt1, dt2) {
        var d1 = dt1.date;
        var d2 = dt2.date;
        var t1 = dt1.time;
        var t2 = dt2.time;
        if (d1.year != d2.year) {
            return d1.year - d2.year;
        } else if (d1.month != d2.month) {
            return d1.month - d2.month;
        } else if (d1.day != d2.day) {
            return d1.day - d2.day;
        } else if (t1.hour != t2.hour) {
            return t1.hour - t2.hour;
        } else {
            return t1.minute - t2.minute;
        }
    }

    function todayDate() {
        var d = new Date();
        return {
            date: {
                month: d.getMonth() + 1,
                day:   d.getDate(), 
                year:  d.getFullYear()
            },
            time: {
                hour: 0,    // the date-is-over check is based only on the date, not the time
                minute: 0
            }
        }
    }
})
