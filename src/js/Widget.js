import config from './config';
import Service from './Service';
const Mustache = require('./libs/mustache');

/**
 * Main iTunesWidget class
 *
 * @class ItunesWidget
 */
class ItunesWidget {

	/**
	 * @constructor
	 *
	 * @param {Object} el | Current DOM element
	 * @param {Object} custom | Custom configuration options
	 */
	constructor(el, custom) {
		this.el = el;
		this.custom = custom;
		this.configure();
		this.core();
	}

	/**
	 * Configures current object
	 *
	 * @method configure
	 */
	configure() {
		/**
		 * @property {Object} config | merges custom options and config.options
		 */
		this.config = $.extend(config, this.custom);
		this.endpoint = this.endpoint();
		this.params = this.params();
		this.proxy = this.proxy();
		this.template = this.template();
	}

	/**
	 * Returns API endpoint url
	 * References config.env settings
	 *
	 * @method endpoint
	 * @return {String} | endpoint url
	 */
	endpoint() {
		return this.config.endpoints[this.config.env];
	}

	/**
	 * Returns API parameters to be passed to .ajax request
	 *
	 * @method params
	 * @return {Object} | API parameters
	 */
	params() {
		return {
			term: this.config.search,
			media: this.config.media
		};
	}

	/*
	 * Returns a proxy URL
	 * If env != 'dev', use config.proxy
	 * else use null
	 *
	 * @method proxy
	 * @return {String|null} | proxy URL
	 */
	proxy() {
		var proxy = null;
		if(this.config.env != 'dev') {
			proxy = this.config.proxy;
		}
		return proxy;
	}

	/*
	 * Returns a template URL
	 *
	 * @method template
	 * @return {String} | template URL
	 */
	template() {
		return `templates/${this.config.template}.hbs`;
	}

	/*
	 * Call the API service and template service
	 * Populate template with API data
	 *
	 * @method core
	 */
	core() {
		Promise.all([
			this.getAPIData(),
			this.getTemplateData()
			// Wait for both responses
		]).then((responses) => {
			const data = ItunesWidget.formatData(responses[0]);
			const template = responses[1];
			const tmpl = Mustache.render(template, data);
			$(this.el).append($(tmpl));
		}).catch((e) => {
			console.log('Error', e);
		});
	}

	/*
	 * Gets data from API endpoint
	 *
	 * @method getAPIData
	 * @returns {Object.<XMLHttpRequest>} | API data
	 */
	getAPIData() {
		return Service.get(this.endpoint, this.params, this.proxy)
	}

	/*
	 * Gets raw template
	 *
	 * @method getTemplateData
	 * @returns {Object.<XMLHttpRequest>} | raw template
	 */
	getTemplateData() {
		return Service.get(this.template)
	}

	/*
	 * Maps API data to template-friendly object form
	 *
	 * @method formatData
	 * @param {String} raw | raw JSON-parseable API data
	 * @returns {Object} | formatted API data
	 */
	static formatData(raw) {
		let json = JSON.parse(raw);
		let results = json.results;
		let data = [];
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
	}
}

export default ItunesWidget;