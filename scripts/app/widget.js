(function (factory) {
  if (typeof define === 'function' && define.amd) {
    define(['jquery', 'mustache', 'oclient'], factory);
  } else if (typeof exports === 'object') {
    factory(require('jquery', 'mustache', 'oclient'));
  } else {
    factory(jQuery, Mustache, oClient);
  }
}(function ($, Mustache, oClient) {
	'use strict';

	/**
	 * @constructor
	 *
	 * @param {Object} el | Current DOM element
	 * @param {Object} customOptions | Custom configuration options
	 */
	var iTunesWidget = function(el, customOptions) {
		if(!this.isValid(customOptions)) {
			return false;
		}
		/**
		 * @property {Object} config | will contain custom options and config.options
		 */
		var config = this.configure(customOptions);
		this.core(el, config);
	};

	/**
	 * This is intended for static $.iTunesWidget.pollAPI calls
	 * Contains all the functionality of the widget without manipulating the DOM
	 * Returns formatted JSON as the callback parameter
	 *
	 * @method isValid
	 * @param {Object} customOptions | Custom configuration options
	 * @param {Object} callback | Callback function
	 * @return {Function(JSON)} | callback function
	 */
	iTunesWidget.prototype.pollAPI = function(customOptions, callback) {
	    var config = this.configure(customOptions);
		this.core(null, config, callback);
	};

	/**
	 * Checks for required input configurations
	 * Checks for valid env values
	 *
	 * @method isValid
	 * @return {Boolean}
	 */
	var required = ['term'];
	iTunesWidget.prototype.isValid = function(customOptions) {
		required.forEach(function(key) {
			if(!(key in customOptions)){
				console.log('Missing required parameter: ', key);
				return false;
			}
		});

		var env = customOptions.env;
		if(env) {
			if(env != 'dev' && env != 'prod') {
				console.log('Invalid env value: ', env);
				return false;
			}
		}

		return true;
	};

	/**
	 * Configuration object
	 * These can be overridden by custom options passed into the widget
	 */
	iTunesWidget.prototype.config = {
		media: 'software',
		proxy: 'proxy.php',
		template: 'default',
		endpoints: {
			dev: 'scripts/app/test-data.json',
			prod: 'https://itunes.apple.com/search?'
		},
		env: 'prod'
	};

	/**
	 * Configures current object
	 *
	 * @method configure
	 * @param {Object} customOptions | User options
	 * @return {Object} | Modified config
	 */
	iTunesWidget.prototype.configure = function(customOptions) {
		// Combine user options with defaults
		var config = $.extend({}, this.config, customOptions);

		config.endpoint = this.endpoint(config);
		config.proxy = this.proxy(config);
		config.template = this.template(config);

		return config;
	};

	/**
	 * Returns API endpoint url
	 * References config.env settings
	 *
	 * @method endpoint
	 * @param {Object} config | Merged config object
	 * @return {String} | endpoint url
	 */
	iTunesWidget.prototype.endpoint = function(config) {
		return config.endpoints[config.env];
	};

	/*
	 * Returns a proxy URL
	 * If env != 'dev', use config.proxy
	 * else use null
	 *
	 * @method proxy
	 * @param {Object} config | Merged config object
	 * @return {String|null} | proxy URL
	 */
	iTunesWidget.prototype.proxy = function(config) {
		var proxy = null;
		if(config.env != 'dev') {
			proxy = config.proxy;
		}
		return proxy;
	};

	/*
	 * Returns a template URL
	 *
	 * @method template
	 * @param {Object} config | Merged config object
	 * @return {String} | template URL
	 */
	iTunesWidget.prototype.template = function(config) {
		return 'templates/' + config.template + '.hbs';
	};

	/*
	 * Call the API service and template service
	 * Populate template with API data
	 *
	 * @method core
	 * @param {Object} el | Current DOM element
	 * @param {Object} config | Merged config object
	 * @param {Object} callback | Callback function (this is for the static .pollAPI option!)
	 */
	iTunesWidget.prototype.core = function(el, config, callback) {
		var that = this;
		Promise.all([
			this.getAPIData(config),
			this.getTemplateData(config)
			// Wait for both responses
		]).then(function(responses) {
			var data = that.formatData(responses[0]);

			// We're just polling, don't attempt to alter DOM
			if(callback) {
				callback(data);
				return false;
			}

			var template = responses[1];
			var tmpl = Mustache.render(template, data);
			$(el).append($(tmpl));
		}).catch(function(e) {
			console.log('Error', e);
		});
	};

	/*
	 * Gets data from API endpoint
	 *
	 * @method getAPIData
	 * @param {Object} config | Merged config object
	 * @returns {Object.<XMLHttpRequest>} | API data
	 */
	iTunesWidget.prototype.getAPIData = function(config) {
		var params = {
			term: config.term,
			media: config.media
		};
		return oClient.prototype.get(config.endpoint, params, config.proxy)
	};

	/*
	 * Gets raw template
	 *
	 * @method getTemplateData
	 * @param {Object} config | Merged config object
	 * @returns {Object.<XMLHttpRequest>} | raw template
	 */
	iTunesWidget.prototype.getTemplateData = function(config) {
		return oClient.prototype.get(config.template)
	};

	/*
	 * Maps API data to template-friendly object form
	 *
	 * @method formatData
	 * @param {String} raw | raw JSON-parseable API data
	 * @returns {Object} | formatted API data
	 */
	iTunesWidget.prototype.formatData = function(raw) {
		var json = JSON.parse(raw);

		if(json.resultCount == 0) {
			console.log('No results returned');
			return false;
		}

		var results = json.results;
		var data = [];
		results.forEach((d) => {
			data.push({
				img: {
					small: d.artworkUrl60,
					medium: d.artworkUrl100,
					large: d.artworkUrl512
				},
				developer: {
					name: d.artistName,
					url: d.sellerUrl
				},
				price: d.formattedPrice,
				name: d.trackName,
				url: d.trackViewUrl,
				description: d.description,
				rating: {
					average: d.averageUserRating,
					count: d.userRatingCount
				}
			})
		});
		return {
			data: data
		};
	};

	// Extend JQuery fn for $('$id').iTunesWidget()
	$.fn.iTunesWidget = function(options) {
		return this.each(function() {
			(new iTunesWidget(this, options));
		});
	};

	// Extend JQuery for $.iTunesWidget()
	// ONLY prototype(static) methods
	$.extend({
		iTunesWidget: iTunesWidget.prototype
	});

}));