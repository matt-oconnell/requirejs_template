(function(factory) {
	if(typeof define === 'function' && define.amd) {
		// AMD. Register as an anonymous module depending on jQuery.
		define(['jquery'], factory);
	} else {
		// No AMD. Register plugin with global jQuery object.
		factory(jQuery);
	}
}(function($) {
	"use strict";

	/*
	 * Only gets called when we're using $('$el').widget format
	 */
	var Widget = function(el) {
		var _ = this;
		_.$el = $(el).addClass('widget');
	};

	// Extend JQuery fn for $('$id').widget()
	$.fn.widget = function(options) {
		return this.each(function() {
			(new Widget(this, options));
		});
	};

	// Extend JQuery for $.widget()
	// ONLY prototype(static) methods
	$.extend({
		widget: Widget.prototype
	});

}));