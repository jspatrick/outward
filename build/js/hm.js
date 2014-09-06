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

var hm = (function (){
	  var initModule = function ( $container ) {
		  hm.shell.initModule( $container );
	  };

	return { initModule: initModule };
}());
