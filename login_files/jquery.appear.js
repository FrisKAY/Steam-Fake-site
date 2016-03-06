/*
 * jQuery appear plugin
 *
 * Copyright (c) 2012 Andrey Sidorov
 * licensed under MIT license.
 *
 * https://github.com/morr/jquery.appear/
 *
 * Version: 0.3.3
 */
(function ( $ ) {
	var selectors = [];

	var check_binded = false;
	var global_check_lock = false;
	// this code wishes it didn't have global state but has tons of global state - so let's not pretend.
	var opts = {
		interval: 250,
		force_process: false
	};
	var on_check = function () {
		if ( global_check_lock ) {
			return;
		}
		global_check_lock = true;

		setTimeout( process, opts.interval );
	};
	var $window = $( window );

	function process() {
		global_check_lock = false;
		if ( !selectors )
			return;

		var window_left = $window.scrollLeft();
		var window_top = $window.scrollTop();
		var window_height = $window.height();
		var window_width = $window.width();

		var elements_removed = false;

		for ( var index = 0; index < selectors.length; index++ ) {
			if ( !selectors[index] )
				continue;

			var $elements = $( selectors[index] );

			var $appeared = $elements.filter( function () {
				var $element = $J( this );

				if ( $element.data( 'appeared' ) )
					return false;

				var offset = $element.offset();
				var left = offset.left;
				var top = offset.top;

				if ( top + $element.height() >= window_top &&
					top <= window_top + window_height &&
					left + $element.width() >= window_left &&
					left <= window_left + window_width &&
					$element.is(':visible') ) {
					return true;
				} else {
					return false;
				}
			} );

			if ( $appeared )
			{
				$appeared.trigger( 'appear', [$appeared] );
				$appeared.data( 'appeared', true );

				if ( !$elements.filter( function() { return !$(this).data('appeared') } ).length )
				{
					selectors[index] = null;
					elements_removed = true;
				}
			}

			// this doesn't even work...
			/*
			 if ($prior_appeared) {
			 var $disappeared = $prior_appeared.not($appeared);
			 $disappeared.trigger('disappear', [$disappeared]);
			 }
			 $prior_appeared = $appeared;
			 */
		}

		if ( elements_removed )
		{
			//cleanup
			selectors = selectors.filter( function( element ) { return !!element; } );
		}
	}

	// "appeared" custom filter
	$.expr[':']['appeared'] = function ( element ) {
		var $element = $( element );
		if ( !$element.is( ':visible' ) ) {
			return false;
		}

		var window_left = $window.scrollLeft();
		var window_top = $window.scrollTop();
		var offset = $element.offset();
		var left = offset.left;
		var top = offset.top;

		if ( top + $element.height() >= window_top &&
			top - ($element.data( 'appear-top-offset' ) || 0) <= window_top + $window.height() &&
			left + $element.width() >= window_left &&
			left - ($element.data( 'appear-left-offset' ) || 0) <= window_left + $window.width() ) {
			return true;
		} else {
			return false;
		}
	}

	$.fn.extend( {
		// watching for element's appearance in browser viewport
		appear: function ( options ) {
			opts = $.extend( {}, opts, options || {} );
			var selector = this.selector || this;
			if ( !check_binded ) {

				$( window ).scroll( on_check ).resize( on_check );
				check_binded = true;
			}

			if ( opts.force_process ) {
				setTimeout( process, opts.interval );
			}
			selectors.push( selector );
			return $( selector );
		}
	} );

	$.extend( {
		// force elements's appearance check
		force_appear: function () {
			if ( check_binded ) {
				on_check();
				return true;
			}
			;
			return false;
		},

		force_appear_on_scroll: function( $context ) {
			$($context).on( 'scroll.Appear', on_check );
		}
	} );
})( jQuery );