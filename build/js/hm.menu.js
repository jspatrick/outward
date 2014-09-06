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

hm.menu = (function() {
	var configMap = {
		main_html: String() + 
			//Center section
			'<div class="hm-menu-section">' +
			  '<div class="hm-menu-section-header">' +
  			    '<div class="hm-menu-section-header-title">Origin</div>' +
			  '</div>' +
			  '<div class="hm-menu-section-body">' +
  			    '<input id="origin-input" type="text"></input>' +
              '</div>'+
			'</div>' +
			'<div class="hm-menu-section">' +
			  '<div class="hm-menu-section-header">' +
			    '<div class="hm-menu-section-header-title">CSV Download</div>' +
			  '</div>' +
			  '<div class="hm-menu-section-body">' +
  			    '<a id="hm-menu-csv-download">Download CSV File</a>' +
              '</div>'+
			'</div>',
			/*
			'<div class="hm-menu-section">' + 
			  '<div class="hm-menu-section-header">' +
                '<div class="hm-menu-section-header-title">Locations</div>' +
                '<div class="hm-menu-locations-header-add-btn">+</div>' +
			  '</div>' + 
              '<ul class="hm-menu-locations-list">' +
			  '</ul>' +
            '</div>',
*/
		location_html: String() + 
			'<li class="hm-locations-loc">' +
			'<div class="hm-locations-loc-remove-btn">-</div>' +
			'<div class="hm-locations-loc-name"></div>' +
			'<div class="hm-locations-loc-addr"></div>' +
			'</li>',
		menu_open_time: 250,
		menu_close_time: 250,		
		menu_open_size_px: 300,
		set_menu_anchor: null,
		set_origin_anchor: null,
		settable_map: {
			menu_open_time: true,
			menu_close_time: true,
			menu_open_size_px: true,
			set_menu_anchor: true,
			set_origin_anchor: true
		}
	},
		

		jqueryMap = {},
		stateMap =  {
			position_type: 'closed',
			origin: '',
			places: {}
		},
		setPosition, initModule, handleResize, configModule, setDownloadLink,
		addPlace, setJqueryMap;
	
	configModule = function ( input_map ) {	
		hm.util.setConfigMap({
			input_map    : input_map,
			settable_map : configMap.settable_map,
			config_map   : configMap
		});
		return true;
	};

	setJqueryMap = function() {
		var $menuContainer = stateMap.$menuContainer;
		var $menuButton = stateMap.$menuButton;
		jqueryMap = {
			$menuButton: $menuButton,
			$menuContainer: $menuContainer,
			$originInput: $menuContainer.find("#origin-input"),
			$locationsList: $menuContainer.find(".hm-menu-locations-list"),
			$downloadAnchor: $menuContainer.find("#hm-menu-csv-download")
		};
	};

	/*
	  Set the 'status' of the current origin
	  Valid states:
		- 'saved'
		- 'unsaved'
	    - 'invalid'
	*/
	setDownloadLink = function(place_info)
	{
		console.log("Setting download link:", place_info);

		var new_row = "%0A",
			new_col = "%2C",
			link_text = "data:application/octet-stream,",
			columns = ["name", "address", "city", "origin_distance"],
			i, place, key;

		for (i=0; i < columns.length; ++i) {
			if (i === columns.length - 1){
				link_text += columns[i] + new_row;
			} else {
				link_text += columns[i] + new_col;
			}
			
		}

		for (key in place_info){
			if (place_info.hasOwnProperty(key))
			{
				place = place_info[key];
				for (i=0; i<columns.length; ++i){
					link_text += place[columns[i]];
					if (i === columns.length - 1){
						link_text += new_row;
					} else {
						link_text += new_col;
					}					
				}
			}
		}
		console.log("Link text: ", link_text);
		jqueryMap.$downloadAnchor.attr("href", link_text);
	};


	setCurrentOriginState = function(state){
		var border_color;
		switch(state) {
			case "saved" :
			border_color = "green";
			break;
			
			case "unsaved":
			border_color = "yellow";
			break;

			case "invalid":
			border_color = "red";
			break;
		}

		jqueryMap.$originInput.css("border-color", border_color);
	};

	setPosition = function(position_type){
		var width_px, animate_time;
		if (stateMap.position_type === position_type) {
			return true;
		}
		
		switch (position_type){
		case 'opened': 
			left_px = '0px';
			animate_time = configMap.menu_open_time;
			break;
			
		case 'closed':
			left_px = String(-1 * configMap.menu_open_size_px) + 'px';
			animate_time = configMap.menu_close_time;
			break;

		default:
			return false;
		}

		stateMap.position_type = '';
		jqueryMap.$menuContainer.animate(
			{ left: left_px },
			animate_time,
			function () {
				stateMap.position_type = position_type;
			}
		);


		return true;
	};

	onClickToggle = function(event){
		var set_menu_anchor = configMap.set_menu_anchor;
		if ( stateMap.position_type === 'opened' ) {
			set_menu_anchor( 'closed' );
		}
		else if ( stateMap.position_type === 'closed' ){
			set_menu_anchor( 'opened' );
		}
		return false;		
	};


	onOriginKeypress = function(event) {		
		var $ipt = jqueryMap.$originInput,
			value = $ipt.val();

		if (event.keyCode === 13 && value != "") {
			configMap.set_origin_anchor(value);
		}
		set_menu_anchor( 'closed' );
	};


	addPlace = function(place_info){
		console.log("place requested:");
		console.log(place_info);
		var addr = place_info.address,
			name = place_info.name,
			dist = place_info.origin_distance,
			id = place_info.id;
		
		var $newPlace = $(configMap.location_html);
		$newPlace.find('.hm-locations-loc-name').html(name);
		$newPlace.find('hm-locations-loc-addr').html(addr);		
		jqueryMap.$locationsList.append($newPlace);
	};

	
	initModule = function($menuContainer, $menuButton) {
		$menuContainer.css('width', 
						   String(configMap.menu_open_size_px) + "px");
		$menuContainer.css('left', 
						   String(-1*configMap.menu_open_size_px) + "px");
		$menuContainer.html(configMap.main_html);
		
		stateMap.$menuContainer = $menuContainer;
		stateMap.$menuButton = $menuButton;
		setJqueryMap();



		stateMap.position_type = 'closed';
		jqueryMap.$menuButton.click(onClickToggle);
		jqueryMap.$originInput.keypress(onOriginKeypress);
		
	};

	return {setPosition: setPosition,
			initModule: initModule,
			addPlace: addPlace,
			configModule: configModule,
			setDownloadLink: setDownloadLink,
			handleResize: handleResize};
	
}());
