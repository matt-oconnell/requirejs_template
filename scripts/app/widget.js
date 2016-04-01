(function (factory) {
  if (typeof define === 'function' && define.amd) {
    define(['jquery', 'mustache', './oservice'], factory);
  } else if (typeof exports === 'object') {
    factory(require('jquery', 'mustache', './oservice'));
  } else {
    factory(jQuery, Mustache, oService);
  }
}(function ($, Mustache, oService) {
	'use strict';

	/**
	 * @constructor
	 *
	 * @param {Object} el | Current DOM element
	 * @param {Object} custom | Custom configuration options
	 */
	var iTunesWidget = function(el, custom) {
		this.el = el;
		this.custom = custom;
		this.configure();
		this.core();
	};

	/**
	 * Configuration object
	 * These can be overridden by custom options passed into the widget
	 */
	var config = {
		search: 'spotify',
		media: 'software',
		proxy: 'proxy.php',
		template: 'template1',
		endpoints: {
			dev: 'scripts/app/test-data.json',
			prod: 'https://itunes.apple.com/search?'
			// 'http://itunes.apple.com/lookup?id=400274934'
		},
		env: 'prod'
	};

	/**
	 * Configures current object
	 *
	 * @method configure
	 */
	iTunesWidget.prototype.configure = function() {
		/**
		 * @property {Object} config | merges custom options and config.options
		 */
		this.config = $.extend(config, this.custom);
		this.endpoint = this.endpoint();
		this.params = this.params();
		this.proxy = this.proxy();
		this.template = this.template();
	};

	/**
	 * Returns API endpoint url
	 * References config.env settings
	 *
	 * @method endpoint
	 * @return {String} | endpoint url
	 */
	iTunesWidget.prototype.endpoint = function() {
		return this.config.endpoints[this.config.env];
	};

	/**
	 * Returns API parameters to be passed to .ajax request
	 *
	 * @method params
	 * @return {Object} | API parameters
	 */
	iTunesWidget.prototype.params = function() {
		return {
			term: this.config.search,
			media: this.config.media
		};
	};

	/*
	 * Returns a proxy URL
	 * If env != 'dev', use config.proxy
	 * else use null
	 *
	 * @method proxy
	 * @return {String|null} | proxy URL
	 */
	iTunesWidget.prototype.proxy = function() {
		var proxy = null;
		if(this.config.env != 'dev') {
			proxy = this.config.proxy;
		}
		return proxy;
	};

	/*
	 * Returns a template URL
	 *
	 * @method template
	 * @return {String} | template URL
	 */
	iTunesWidget.prototype.template = function() {
		return 'templates/' + this.config.template + '.hbs';
	};

	/*
	 * Call the API service and template service
	 * Populate template with API data
	 *
	 * @method core
	 */
	iTunesWidget.prototype.core = function() {
		Promise.all([
			this.getAPIData(),
			this.getTemplateData()
			// Wait for both responses
		]).then((responses) => {
			var data = this.formatData(responses[0]);
			var template = responses[1];
			var tmpl = Mustache.render(template, data);
			$(this.el).append($(tmpl));
		}).catch((e) => {
			console.log('Error', e);
		});
	};

	/*
	 * Gets data from API endpoint
	 *
	 * @method getAPIData
	 * @returns {Object.<XMLHttpRequest>} | API data
	 */
	iTunesWidget.prototype.getAPIData = function() {
		return oService.prototype.get(this.endpoint, this.params, this.proxy)
	};

	/*
	 * Gets raw template
	 *
	 * @method getTemplateData
	 * @returns {Object.<XMLHttpRequest>} | raw template
	 */
	iTunesWidget.prototype.getTemplateData = function() {
		return oService.prototype.get(this.template)
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

	///**
	// * Makes an HTTP GET request
	// *
	// * @method get
	// * @param {String} url
	// * @param {Object|null} data | Query parameters
	// * @param {String} proxy | Server-side proxy that will forward our request
	// * @param {String} dataType | Datatype we are expecting to recieve
	// * @returns {Object.<XMLHttpRequest>} | response from url
	// */
	//iTunesWidget.prototype.get = function(url, data = null, proxy = null, dataType = 'text') {
	//	if(proxy) {
	//		data = {
	//			url: url + $.param(data)
	//		};
	//		url = proxy;
	//	}
	//	return $.ajax({
	//		url: url,
	//		method: 'get',
	//		data: data,
	//		dataType: dataType
	//	}).fail((e) => {
	//		console.log('Get failed: ', e.responseText);
	//	});
	//};

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