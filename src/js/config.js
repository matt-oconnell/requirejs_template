/**
 * Configuration object
 * These can be overridden by custom options passed into the widget
 */
const config = {
	search: 'spotify',
	media: 'software',
	proxy: 'proxy.php',
	template: 'template1',
	endpoints: {
		dev: 'src/js/data/service-shim.json',
		prod: 'https://itunes.apple.com/search?'
		// 'http://itunes.apple.com/lookup?id=400274934'
	},
	env: 'prod'
};

export default config;