requirejs.config({
	baseUrl: 'scripts',
	paths: {
		jquery: 'lib/jquery',
		mustache: 'lib/mustache',
		oclient: 'lib/oclient'
	}
});

requirejs(['jquery', './app/widget'],
	function($) {
		$('div').iTunesWidget({
			env: 'dev'
		});
	}
);