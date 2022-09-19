'use strict';
jQuery(function($) {
	$.fn.ultravioletBackground = function(Options) {

		/*
		Copyright (c) 2015 by Nik (http://codepen.io/nikrowell/pen/BNdaKV)

		Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

		The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

		Ultraviolet
		------------------------------------------------------------
		Inspired by the album "Save Your Heart" by Lights and Motion
		http://labs.nikrowell.com/lightsandmotion/ultraviolet
		http://deepelmdigital.com/album/save-your-heart

		Modified by Boom apps
		*/

		var Container = $(this);
		var It = $(this).find("canvas").eq(0);

		var ctx,
			hue,
			buffer,
			target = {},
			tendrils = [],
			settings = {};

		settings.debug = false;
		settings.friction = 0.5;
		settings.size = 50;
		settings.dampening = 0.25;
		settings.tension = 0.98;

		settings.trails = 20;

		settings.fixedHue = false;
		settings.hueSpeed = 0.051;
		settings.hue = 20;
		settings.saturation = "90%";
		settings.lightness = "50%";
		settings.opacity = .25;
		settings.trailsCompositeOperation = 'darken';
		settings.bgR = 0;
		settings.bgG = 3;
		settings.bgB = 0;
		settings.bgType = '';


		settings = $.extend(true, settings, Options);

		Math.TWO_PI = Math.PI * 2;

		// ========================================================================================
		// Oscillator
		// ----------------------------------------------------------------------------------------

		function Oscillator(options) {
			this.init(options || {});
		}

		Oscillator.prototype = (function() {

			var value = 0;

			return {

				init: function(options) {
					this.phase = options.phase || 0;
					this.offset = options.offset || 0;
					this.frequency = options.frequency || 0.001;
					this.amplitude = options.amplitude || 1;
				},

				update: function() {
					this.phase += this.frequency;
					value = this.offset + Math.sin(this.phase) * this.amplitude;

					return value;
				},

				value: function() {
					return value;
				}
			};

		})();

		// ========================================================================================
		// Tendril
		// ----------------------------------------------------------------------------------------

		function Tendril(options) {
			this.init(options || {});
		}

		Tendril.prototype = (function() {

			function Node() {
				this.x = 0;
				this.y = 0;
				this.vy = 0;
				this.vx = 0;
			}

			return {

				init: function(options) {

					this.spring = options.spring + (Math.random() * 0.1) - 0.05;
					this.friction = settings.friction + (Math.random() * 0.01) - 0.005;
					this.nodes = [];

					for(var i = 0, node; i < settings.size; i++) {

						node = new Node();
						node.x = target.x;
						node.y = target.y;

						this.nodes.push(node);
					}
				},

				update: function() {

					var spring = this.spring,
						node = this.nodes[0];

					node.vx += (target.x - node.x) * spring;
					node.vy += (target.y - node.y) * spring;

					for(var prev, i = 0, n = this.nodes.length; i < n; i++) {

						node = this.nodes[i];

						if(i > 0) {

							prev = this.nodes[i - 1];

							node.vx += (prev.x - node.x) * spring;
							node.vy += (prev.y - node.y) * spring;
							node.vx += prev.vx * settings.dampening;
							node.vy += prev.vy * settings.dampening;
						}

						node.vx *= this.friction;
						node.vy *= this.friction;
						node.x += node.vx;
						node.y += node.vy;

						spring *= settings.tension;
					}
          // console.log(spring);
				},

				draw: function() {

					var x = this.nodes[0].x,
						y = this.nodes[0].y,
						a, b;

					ctx.beginPath();
					ctx.moveTo(x, y);

					for(var i = 1, n = this.nodes.length - 2; i < n; i++) {

						a = this.nodes[i];
						b = this.nodes[i + 1];
						x = (a.x + b.x) * 0.5;
						y = (a.y + b.y) * 0.5;

						ctx.quadraticCurveTo(a.x, a.y, x, y);
					}

					a = this.nodes[i];
					b = this.nodes[i + 1];

					ctx.quadraticCurveTo(a.x, a.y, b.x, b.y);
					ctx.stroke();
					ctx.closePath();
				}
			};

		})();

		// ----------------------------------------------------------------------------------------

		function reset() {

			tendrils = [];

			for(var i = 0; i < settings.trails; i++) {

				tendrils.push(new Tendril({
					spring: 0.45 + 0.025 * (i / settings.trails)
				}));
			}
		}

		function loop() {

			ctx.globalCompositeOperation = 'source-over';
			ctx.fillStyle = 'rgba(' + settings.bgR + ',' + settings.bgG + ',' + settings.bgB + ',0.4)';
			ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
			ctx.globalCompositeOperation = settings.trailsCompositeOperation;
			if (settings.fixedHue) {
				ctx.strokeStyle = 'hsla(' + settings.hue + ',' + settings.saturation +',' + settings.lightness +',' + settings.opacity +')';
			} else {
				ctx.strokeStyle = 'hsla(' + Math.round(hue.update()) + ',' + settings.saturation +',' + settings.lightness +',' + settings.opacity +')';
			}

			ctx.lineWidth = 1;

			for(var i = 0, tendril; i < settings.trails; i++) {
				tendril = tendrils[i];
				tendril.update();
				tendril.draw();
			}

			//ctx.stats.update();
			requestAnimFrame(loop);
		}

		function resize() {
			ctx.canvas.width = $(Container).width();
			ctx.canvas.height = $(Container).height();
		}

		function mousemove(event) {
			if(event.touches) {
				target.x = Math.floor(event.touches[0].pageX / $(window).width() * $(Container).width());
				target.y = Math.floor(event.touches[0].pageY / $(window).height() * $(Container).height());
			} else {
				target.x = Math.floor(event.clientX / $(window).width() * $(Container).width());
				target.y = Math.floor(event.clientY / $(window).height() * $(Container).height());
			}
			//event.preventDefault();
		}

		function touchstart(event) {
			if(event.touches.length == 1) {
				target.x = Math.floor(event.touches[0].pageX / $(window).width() * $(Container).width());
				target.y = Math.floor(event.touches[0].pageY / $(window).height() * $(Container).height());
			}
		}

		window.requestAnimFrame = (function() {
			return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function(fn) { window.setTimeout(fn, 1000 / 60) };
		})();

		function init() {

			ctx = $(It)[0].getContext('2d');
			//ctx.stats = new Stats();

			ctx.globalCompositeOperation = 'source-over';

			hue = new Oscillator({
				phase: Math.random() * Math.TWO_PI,
				amplitude: 85,
				frequency: settings.hueSpeed,
				offset: 0
			});


			document.body.addEventListener('orientationchange', resize);
			window.addEventListener('resize', resize);

			document.addEventListener('mousemove', mousemove);
			document.addEventListener('touchmove', mousemove);
			document.addEventListener('touchstart', touchstart);

			target.x = Math.random() * ctx.canvas.width;
			target.y = Math.random() * ctx.canvas.height;

			resize();
			reset();
			loop();

			// kind of a hack ... but trigger a few mousemoves to kick things off

			mousemove({
				clientX: Math.random() * ctx.canvas.width,
				clientY: Math.random() * ctx.canvas.height
			});

			setTimeout(function() {
				mousemove({
					clientX: Math.random() * ctx.canvas.width,
					clientY: Math.random() * ctx.canvas.height
				});
			}, 100);

			setTimeout(function() {
				mousemove({
					clientX: Math.random() * ctx.canvas.width,
					clientY: Math.random() * ctx.canvas.height
				});
			}, 500);

			setTimeout(function() {
				mousemove({
					clientX: Math.random() * ctx.canvas.width,
					clientY: Math.random() * ctx.canvas.height
				});
			}, 1000);

			setTimeout(function() {
				mousemove({
					clientX: Math.random() * ctx.canvas.width,
					clientY: Math.random() * ctx.canvas.height
				});
			}, 2000);
		};

		init();
	}
});
