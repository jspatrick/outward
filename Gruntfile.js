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
			    'public/javascripts/app.min.js': ['public/js/*.js']
			  }
			}
		},
		cssmin: {
			compress: {
			    files: {
			      'public/stylesheets/app.min.css': [
			      	'public/css/*.css', 
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
