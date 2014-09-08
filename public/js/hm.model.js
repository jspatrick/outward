/*
hm.model.js

Stores data and publishes events when:
  - The origin address is updated
  - Nearby locations are added, removed, or updated
    
*/

/*jslint           browser : true,   continue : true,
  devel  : true,    indent : 2,       maxerr  : 50,
  newcap : true,     nomen : true,   plusplus : true,
  regexp : true,    sloppy : true,       vars : false,
  white  : true
*/
/*global $, hm */

hm.model = (function(){
	'use strict';
	var
	configMap = {},
	stateMap = {
		location_id_map: {}
	},	
	isFakeData = true,
	locationProto, makeLocation, addLocation, removeLocation;
	
	locationProto = {
		get_color: function (){
			return this._color;
		},
		get_location: function(){
			return {latitude: this.latitude,
					longitude: this.longitude};
		}
	};
	
	makeLocation = function(location_map){
		var location,
			address = location_map.address,
			name = location_map.name,
			distance = location_map.distance;
		    latitude = location_map.latitude;
		    longitude = location_map.longitude;
		
		location = Object.create(locationProto);
		location.address = address;
		location.name = name;
		location.latitude = latitude;
		location.longitude = longitude;
		location.distance = distance ? distance : "unknown";		

		return location;
	};

	
}());
