module.exports = function(grunt) {
	"use strict";

	grunt.initConfig({
		watch: {
			files: [
				'public/css/*.css',
				'public/js/*.js'
			],
			tasks: ['build']
		},
		uglify: {
			my_target: {
			  files: {
			    'public/js/hm.min.js': ['public/js/hm*.js']
			  }
			}
		},
		cssmin: {
			compress: {
			    files: {
			      'public/css/hm.min.css': [
			      	'public/css/hm*.css', 
			      ]
			    }
			  }
		}
	});

	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.registerTask('build', [
		'uglify', 
		'cssmin'
	]);
	grunt.event.on('watch', function(action, filepath) {
	  grunt.log.writeln(filepath + ' has ' + action);
	});
}
