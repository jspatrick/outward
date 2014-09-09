/*
 * hm.menu.js
 * Root namehmce module
 */

/*jslint           browser : true,   continue : true,
 devel  : true,    indent : 2,       maxerr  : 50,
 newcap : true,     nomen : true,   plusplus : true,
 regexp : true,    sloppy : true,       vars : false,
 white  : true
 */
/*global $, hm */

hm.map = (function() {
	var configMap = {
		base_html: String() 
		    + '<div class="hm-map-canvas-container">'
		       +'<div class="hm-map-canvas"></div>' 
			+ '</div>'
			+ '<div class="hm-map-places"></div>',
		place_html: String()
			+ '<div class="hm-map-places-place">'
			  + '<div class="hm-map-places-place-key-wrapper">'
    		    + '<div class="hm-map-places-place-key"></div>'
    	      +'</div>'
		     + '<div class="hm-map-places-place-distance"></div>'
 			  +  '<div class="hm-map-places-place-info">'
		        + '<div class="hm-map-places-place-name"></div>'
			    + '<div class="hm-map-places-place-address"></div>'
              + '</div>'
		    + '<a class="hm-map-places-place-remove" href="#">x</a>'
			+ '</div>',
		marker_label_html: String() 
			+ '<div class="hm-map-label-container"></div>',
		map_zoom: 14,
		search_distance: 16093,
		marker_label_class: 'hm-map-label',
		marker_label_width: 50,
		map_styles: [
			{
				"featureType": "administrative",
				"stylers": [
					{ "visibility": "simplified" }
				]
			},{
				"stylers": [
					{ "hue": "#0091ff" },
					{ "saturation": -39 },
					{ "lightness": 4 },
					{ "gamma": 0.89 }
				]
			},{
				"featureType": "poi",
				"stylers": [
					{ "visibility": "off" }
				]
			},{
				"featureType": "transit",
				"stylers": [
					{ "visibility": "simplified" }
				]
			},{
				"featureType": "road",
				"elementType": "labels",
				"stylers": [
					{ "lightness": 30 },
					{ "weight": 3.1 }
				]
			}
		], //end map style

		//Callback that accepts ({place: place, place_id: place_id})
		on_places_changed: null,
		settable_map: {
			on_places_changed: true,
			marker_label_class: true
		}
	},
		stateMap = {
			$mapArea: undefined,			
			map: undefined,
			origin: undefined,
			markers: {},
			place_info: {},
			origin_marker: undefined
		},

		jqueryMap = {
			places: {}
		},
		configModule, initModule, initMap, setJqueryMap,
		createPlace, setPlaceKeys,
		createMarker, removeMarker, setMarkerLabel, 
		setOrigin, getLatLng, setDownloadLink,
		onRemovePlaceClicked;

	setJqueryMap = function(){
		jqueryMap.$mapArea = stateMap.$mapArea;		
		jqueryMap.$mapCanvas = jqueryMap.$mapArea.find(".hm-map-canvas");
		jqueryMap.$places = jqueryMap.$mapArea.find(".hm-map-places");
	};


	configModule = function(input_map){
		hm.util.setConfigMap({
			input_map    : input_map,
			settable_map : configMap.settable_map,
			config_map   : configMap
		});
		return true;
	};

	
	initMap = function() {
		stateMap.geocoder = new google.maps.Geocoder();
		stateMap.infoWindow = new google.maps.InfoWindow();
		stateMap.distanceMatrix = new google.maps.DistanceMatrixService();
		var mapOptions = {zoom: configMap.map_zoom,
						  styles: configMap.map_styles};

		stateMap.map =  new google.maps.Map(jqueryMap.$mapCanvas[0],
											mapOptions);
		
		//initialize places
		stateMap.places = new google.maps.places.PlacesService(stateMap.map);

		//Add a symbol
		stateMap.markerIcon = {path: google.maps.SymbolPath.CIRCLE,
							   scale: 4,
							   strokeWeight: 1,
							   strokeColor: "#333",
							   fillColor: "#666",
							   fillOpacity: 1};

	};


	
	createMarker = function(lat, lng, label, id) {
		//Create the marker
		var map = stateMap.map,
			location = new google.maps.LatLng(lat, lng),
			marker;
		
		marker = new MarkerWithLabel({
			map: map,
			position: location,
			draggable: false,
			icon: stateMap.markerIcon,
			labelAnchor: new google.maps.Point(32, 32),
			labelContent: "",
			labelClass: configMap.marker_label_class
		});

		return marker;

	};


	createPlace = function(place_info) {

		var $place = $(configMap.place_html),
			id = place_info.id,
			marker;

		$place.find('.hm-map-places-place-name').html(place_info.name);
		$place.find('.hm-map-places-place-address').html(place_info.address);
		$place.find('.hm-map-places-place-distance').html(place_info.origin_distance);
		$place.find('.hm-map-places-place-remove').bind('click', onRemovePlaceClicked);
		$place.attr('id', place_info.id);
		jqueryMap.$places.append($place);
		jqueryMap.places[place_info.id] = $place;

		marker = createMarker(place_info.latitude,
							  place_info.longitude,
							  place_info.name, 
							  place_info.id);				
		stateMap.markers[id] = marker;
		stateMap.place_info[id] = place_info;

	};

	
	//Set the key of places on the map and in the places list.  
	setPlaceKeys = function() {
		var places = [],
			i=0, 
			place_info, place_id;


		for (place_id in stateMap.place_info){
			if (stateMap.place_info.hasOwnProperty(place_id)) {
				places[places.length] = stateMap.place_info[place_id];
			}
		}

		places.sort(function(a,b){
			return b.latitude - a.latitude;
		});

		jqueryMap.$places.find('.hm-map-places-place').detach();
		for (i=0; i < places.length; ++i){
			place_info = places[i];
			setMarkerLabel(place_info.id, String(i+1));
			var place = jqueryMap.places[place_info.id];
			place.find('.hm-map-places-place-key').html(String(i+1));
			jqueryMap.$places.append(place);
		}

	};


	removeMarker = function(id){
		var marker = stateMap.markers[id];
		marker.setMap(null);
		delete stateMap.markers[id];
	};
	

	setMarkerLabel = function(id, label) {
		var label_html,
			marker = stateMap.markers[id];
		label_html = $(configMap.marker_label_html);
		label_html.html(label);
		console.log(label_html);
		marker.set('labelContent', label_html[0].outerHTML);
	};


	setDownloadLink = function() {
		
	};


	setOrigin = function(origin_addr) {
		//Clear current places
		jqueryMap.$places.html('');
		for (var key in stateMap.markers)
		{
			if (stateMap.hasOwnProperty(key)){
				stateMap.markers[key].setMap(null);
			}
		}
		stateMap.markers = {};
		stateMap.place_info = {};
		
		function onPlacesFinished() {
			setPlaceKeys();
			if (configMap.on_places_changed !== null)
				configMap.on_places_changed(stateMap.place_info);
		}

		var placesSearchCallback = function(results, status) {
			if (status != google.maps.places.PlacesServiceStatus.OK) {
				return false;
			}

			for (var i = 0; i < results.length; i++) {
				var place = results[i],
					//place_id = hm.util.getUUID(),
					is_last = i === (results.length - 1) ? true : false,
					place_info;

				place_info = {'address': place.vicinity,
							  'latitude': place.geometry.location.lat(),
							  'longitude': place.geometry.location.lng(),
							  'name': place.name,
							  'place_type': '',
							  'origin_distance': '',
							  'id': place.place_id};

				
				function set_distance(place_info, is_last){
					stateMap.distanceMatrix.getDistanceMatrix(
						{
							origins: [stateMap.origin],
							destinations: [new google.maps.LatLng(
								place_info.latitude, 
								place_info.longitude)],
							travelMode: google.maps.TravelMode.DRIVING,
							unitSystem: google.maps.UnitSystem.IMPERIAL,
							avoidHighways: false,
							avoidTolls: false
						},
						function(response, status){
							var origin_distance = response.rows[0].elements[0].distance.text,
								origin_distance_value = response.rows[0].elements[0].distance.value;
							place_info.origin_distance = origin_distance;
							place_info.origin_distance_value = origin_distance_value;
							createPlace(place_info);
							if (is_last){
								console.log("Finished creating places");
								onPlacesFinished();
							}
						}
					);}

				set_distance(place_info, is_last);

			}			
			return true;	
		};

		stateMap.geocoder.geocode(
			{address: origin_addr},
			function (results, status) {				 
				var latlng = results[0].geometry.location;
				stateMap.map.setCenter(latlng);
				stateMap.origin = latlng;
				
				origin_marker = new google.maps.Marker({
					position: latlng,
					title: origin_addr,
					map: stateMap.map,
					zIndex: 99999
					});
				
				var request = {
					location: stateMap.origin,
					radius: String(configMap.search_distance),
					types: ['lodging']					 
				};
				//Add nearby places;
				stateMap.places.nearbySearch(request, placesSearchCallback);
				
			}
		);
		return true;
	};


	//Handlers
	onRemovePlaceClicked = function(event){
		event.preventDefault();
		var $target = $(event.target),
			id;
		id = $target.parent().attr('id');
		removeMarker(id);
		$target.parent().detach();
		delete stateMap.place_info[id];
		delete jqueryMap.places[id];
		setPlaceKeys();
	};
	//

	initModule = function($mapArea) {
		stateMap.$mapArea = $mapArea;
		$mapArea.html(configMap.base_html);
		setJqueryMap();
		initMap();

		
		
	};
	
	
	return {
		setOrigin: setOrigin,
		initModule: initModule,
		configModule: configModule,
		map: stateMap.map,
		createMarker: createMarker,
		removeMarker: removeMarker,
		setMarkerLabel: setMarkerLabel
	};

}());
