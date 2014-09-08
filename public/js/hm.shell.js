/*
 * hm.js
 * Root namehmce module
*/

/*jslint           browser : true,   continue : true,
  devel  : true,    indent : 2,       maxerr  : 50,
  newcap : true,     nomen : true,   plusplus : true,
  regexp : true,    sloppy : true,       vars : false,
  white  : true
*/
/*global $, hm */

hm.shell = (function (){
	var configMap = {
		anchor_schema_map: {
			menu: {opened: true, closed: true},
			origin: true
		},
		
		resize_interval: 200,
		main_html: String()
		  + '<header class="hm-shell-header">'
            + '<div class="hm-shell-header-menu-btn">=</div>'
		    + '<div class="hm-shell-header-logo">Outward</div>'
         + '</header>'
		 + '<div class="hm-shell-menu"></div>'
		 + '<div class="hm-shell-map"></div>'
		 + '<div class="hm-shell-places"></div>'
		 + '<div class="hm-shell-modal"></div>'
		 + '<div class="hm-shell-footer"></div>'
	},
		stateMap = {$container: undefined},
		jqueryMap = {},
		copyAnchorMap, setJqueryMap,
		changeAnchorPart, onHashchange, onResize,
		setOriginAnchor, initModule,
		setMenuAnchor,placesChanged;

	//--------------------BEGIN UTILITY METHODS
	copyAnchorMap = function () {
		return $.extend( true, {}, stateMap.anchor_map );
	};


	//--------------------- BEGIN DOM METHODS --------------------
	// Begin DOM method /setJqueryMap/
	setJqueryMap = function () {
		var $container = stateMap.$container;

		jqueryMap = {
			$container : $container,
			$menuContainer : $container.find('.hm-shell-menu'),
			$menuButton: $container.find('.hm-shell-header-menu-btn'),
			$mapArea: $container.find('.hm-shell-map')
		};

	};
	// End DOM method /setJqueryMap/

	// Begin DOM method /changeAnchorPart/
	// Purpose    : Changes part of the URI anchor component
	// Arguments  :
	//   * arg_map - The map describing what part of the URI anchor
	//     we want changed.
	// Returns    :
	//   * true  - the Anchor portion of the URI was updated
	//   * false - the Anchor portion of the URI could not be updated
	// Actions    :
	//   The current anchor rep stored in stateMap.anchor_map.
	//   See uriAnchor for a discussion of encoding.
	//   This method
	//     * Creates a copy of this map using copyAnchorMap().
	//     * Modifies the key-values using arg_map.
	//     * Manages the distinction between independent
	//       and dependent values in the encoding.
	//     * Attempts to change the URI using uriAnchor.
	//     * Returns true on success, and false on failure.
	//
	changeAnchorPart = function ( arg_map ) {
		var
		anchor_map_revise = copyAnchorMap(),
		bool_return       = true,
		key_name, key_name_dep;

		// Begin merge changes into anchor map
		KEYVAL:
		for ( key_name in arg_map ) {
			if ( arg_map.hasOwnProperty( key_name ) ) {

				// skip dependent keys during iteration
				if ( key_name.indexOf( '_' ) === 0 ) { continue KEYVAL; }

				// update independent key value
				anchor_map_revise[key_name] = arg_map[key_name];

				// update matching dependent key
				key_name_dep = '_' + key_name;
				if ( arg_map[key_name_dep] ) {
					anchor_map_revise[key_name_dep] = arg_map[key_name_dep];
				}
				else {
					delete anchor_map_revise[key_name_dep];
					delete anchor_map_revise['_s' + key_name_dep];
				}
			}
		}
		// End merge changes into anchor map

		// Begin attempt to update URI; revert if not successful
		try {
			$.uriAnchor.setAnchor( anchor_map_revise );
		}
		catch ( error ) {
			// replace URI with existing state
			$.uriAnchor.setAnchor( stateMap.anchor_map,null,true );
			bool_return = false;
		}
		// End attempt to update URI...

		return bool_return;
	};
	// End DOM method /changeAnchorPart/
	//--------------------- END DOM METHODS ----------------------

	//------------------- BEGIN EVENT HANDLERS -------------------
	// Begin Event handler /onHashchange/
	// Purpose    : Handles the hashchange event
	// Arguments  :
	//   * event - jQuery event object.
	// Settings   : none
	// Returns    : false
	// Actions    :
	//   * Parses the URI anchor component
	//   * Compares proposed application state with current
	//   * Adjust the application only where proposed state
	//     differs from existing and is allowed by anchor schema
	//
	onHashchange = function ( event ) {
		console.log("Handling hash change");
		var
		_s_menu_previous, _s_menu_proposed, s_menu_proposed,
		_s_origin_previous, _s_origin_proposed, 
		anchor_map_proposed,
		is_ok = true,
		anchor_map_previous = copyAnchorMap();

		// attempt to parse anchor
		try { anchor_map_proposed = $.uriAnchor.makeAnchorMap(); }
		catch ( error ) {
			$.uriAnchor.setAnchor( anchor_map_previous, null, true );
			return false;
		}
		stateMap.anchor_map = anchor_map_proposed;
		console.log("Proposed anchor map: ", anchor_map_proposed);
		// convenience vars
		_s_menu_previous = anchor_map_previous._s_menu;
		_s_menu_proposed = anchor_map_proposed._s_menu;
		_s_origin_previous = anchor_map_previous._s_origin;
		_s_origin_proposed = anchor_map_proposed._s_origin;
		// Begin adjust menu component if changed
		if ( ! anchor_map_previous
			 || _s_menu_previous !== _s_menu_proposed
		   ) {
			s_menu_proposed = anchor_map_proposed.menu;
			switch ( s_menu_proposed ) {
			case 'opened' :
				is_ok = hm.menu.setPosition( 'opened' );
				break;
			case 'closed' :
				is_ok = hm.menu.setPosition( 'closed' );
				break;
			default :
				hm.menu.setPosition( 'closed' );
				delete anchor_map_proposed.menu;
				$.uriAnchor.setAnchor( anchor_map_proposed, null, true );
			}
		}

		if (! anchor_map_previous
			|| _s_origin_proposed !== _s_origin_previous ) {
			hm.map.setOrigin(_s_origin_proposed);
		}

		// End adjust chat component if changed

		// Begin revert anchor if slider change denied
		if ( ! is_ok ) {
			if ( anchor_map_previous ) {
				$.uriAnchor.setAnchor( anchor_map_previous, null, true );
				stateMap.anchor_map = anchor_map_previous;
			}
			else {
				delete anchor_map_proposed.chat;
				$.uriAnchor.setAnchor( anchor_map_proposed, null, true );
			}
		}
		// End revert anchor if slider change denied

		return false;
	};
	// End Event handler /onHashchange/


	// Begin Event handler /onResize/
	onResize = function () {
		if ( stateMap.resize_idto ) { return true; }

		//spa.menu.handleResize();
		stateMap.resize_idto = setTimeout(
			function () { stateMap.resize_idto = undefined; },
			configMap.resize_interval
		);
		console.log("Handling resize");
		return true;
	};
	// End Event handler /onResize/


	setMenuAnchor = function (position) {
		return changeAnchorPart({menu: position});
	};

	setOriginAnchor = function(location){
		return changeAnchorPart({origin: location});
	};

	placesChanged = function(place_info){
		console.log("Places changed: ", place_info);
		hm.menu.setDownloadLink(place_info);
		//return hm.menu.addPlace(place_info);
	};

	initModule = function ( $container ) {
		stateMap.$container = $container;
		$container.html(configMap.main_html);		
		setJqueryMap();
		$.uriAnchor.configModule({
			schema_map: configMap.anchor_schema_map
		});
		
		//Configure and initialze features
		hm.menu.configModule({set_menu_anchor: setMenuAnchor,
							  set_origin_anchor: setOriginAnchor});
		hm.menu.initModule(jqueryMap.$menuContainer,
						  jqueryMap.$menuButton);

		hm.map.configModule({on_places_changed: placesChanged});
		hm.map.initModule(jqueryMap.$mapArea);
		
		$(window)
			.bind( 'resize',     onResize )
			.bind( 'hashchange', onHashchange )
			.trigger( 'hashchange' );

	};

	return { initModule: initModule };
}());
	
