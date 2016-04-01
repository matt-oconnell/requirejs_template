requirejs.config({
	baseUrl: 'scripts',
	paths: {
		jquery: 'lib/jquery',
		mustache: 'lib/mustache'
	}
});


requirejs(['jquery', 'app/widget'],
	function($) {
		$('div').iTunesWidget({
			env: 'dev'
		});
	}
);