module.exports = function(grunt) {
	'use strict';
	// Project config
	var gruntConfig = {
		pkg: grunt.file.readJSON('package.json'),
		bootstrap_pkg: grunt.file.readJSON('bootstrap_package.json'),
		bootstrap_banner: '/*!\n' +
            ' * Bootstrap v<%= bootstrap_pkg.version %> (<%= bootstrap_pkg.homepage %>)\n' +
            ' * Copyright 2011-<%= grunt.template.today("yyyy") %> <%= bootstrap_pkg.author %>\n' +
            ' * Licensed under <%= bootstrap_pkg.license.type %> (<%= bootstrap_pkg.license.url %>)\n' +
            ' */\n',

		jqueryCheck: 'if (typeof jQuery === \'undefined\') { throw new Error(\'Bootstrap\\\'s JavaScript requires jQuery\') }\n\n',

		// -- Task configuration --

		//Clean config
		clean: {
			dist: ['dist']
		},

		// Concat config
		concat: {
			options: {
				banner: '<%= bootstrap_banner %>\n<%= jqueryCheck %>',
				stripBanners: false
			},
			bootstrap: {
				src: [
					'js/bootstrap/transition.js',
					'js/bootstrap/alert.js',
					'js/bootstrap/button.js',
					'js/bootstrap/carousel.js',
					'js/bootstrap/collapse.js',
					'js/bootstrap/dropdown.js',
					'js/bootstrap/modal.js',
					'js/bootstrap/tooltip.js',
					'js/bootstrap/popover.js',
					'js/bootstrap/scrollspy.js',
					'js/bootstrap/tab.js',
					'js/bootstrap/affix.js'
				],
				dest: 'dist/js/<%= bootstrap_pkg.name %>.js'
			},
			pickem: {
				src: ['js/init.js', 
					  'js/generic_*.js', 
					  'js/<%= pkg.name %>_*.js'],
				dest: 'dist/js/<%= pkg.name %>.js',
			},
			
		},

		//Uglify config
		uglify: {

			bootstrap: {
				options: {
					banner: '<%= bootstrap_banner %>'
				},
				src: '<%= concat.bootstrap.dest %>',
				dest: 'dist/js/<%= bootstrap_pkg.name %>.min.js'
			},
			pickem: {
				src: '<%= concat.pickem.dest %>',
				dest: 'dist/js/<%= pkg.name %>.min.js'

			},
		},

		// Copy config		
		copy: {
			fonts: {
				expand: true,
				nonull: true,
				src: 'fonts/*',
				dest: 'dist/'				
			},
			/*
			  bootstrap: {
			  expand: true,
			  nonull: true,
			  src: '<%= pkg.bootstrapSrc %>/less/*.less',
			  dest: 'less/bootstrap/'
			  },
			*/
			dist: {
				expand: true,
				nonull: true,
				cwd: 'dist',
				src: './**',
				dest: '<%= pkg.distTgt %>'
			}
		},
		//Less config
		less: {
			/*This is the bootstrap core.  And actually...we shouldn't need it.  We can
			  go ahead and build it to prove that it works, but we should be using the bootstrap
			  Less files in our own stylesheets
			*/
			bootstrapCore: {
				options: {
					strictMath: true,
					sourceMap: true,
					outputSourceFiles: true,
					sourceMapURL: '<%= bootstrap_pkg.name %>.css.map',
					sourceMapFilename: 'dist/bootstrap/css/<%= bootstrap_pkg.name %>.css.map'
				},
				files: {
					'dist/bootstrap/css/<%= bootstrap_pkg.name %>.css': 'less/bootstrap/bootstrap.less'
				}
			},
			
			//Okay - here's our real stuff!
			core: {
				options: {
					strictMath: true,
					sourceMap: true,
					outputSourceFiles: true,
					sourceMapURL: '<%= pkg.name %>.css.map',
					sourceMapFilename: 'dist/css/<%= pkg.name %>.css.map'
				},
				files: {
					'dist/css/<%= pkg.name %>.css': 'less/style.less'
				}
			}
		},


		cssmin: {
			options: {
				compatibility: 'ie8',
				keepSpecialComments: '*'
			},
			core: {
				files: {
					'dist/css/<%= pkg.name %>.min.css': 'dist/css/<%= pkg.name %>.css',
				}
			},
		},

		watch: {
			js: {
				files: ['js/*.js', '!js/.*'],
				tasks: ['dist-js', 'copy:dist']
			},		
			less: {
				files: ['less/*.less', '!less/.*'],
				tasks: ['dist-css', 'copy:dist']
			}
		},
	};


	grunt.initConfig(gruntConfig);

  // These plugins provide necessary tasks.
	require('load-grunt-tasks')(grunt, {scope: 'devDependencies'});

	
	grunt.registerTask('dist-js', ['concat', 'uglify']);
	grunt.registerTask('dist-css', ['less:core', 'cssmin']);
	grunt.registerTask('default', ['dist-js', 'dist-css', 'copy:fonts', 'copy:dist']);
	//grunt.registerTask('copy-bootstrap', ['copy:bootstrap']);


};

