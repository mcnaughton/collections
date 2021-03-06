(function( wp, $ ){

	if ( ! wp || ! wp.customize ) {
		return;
	}

	var api = wp.customize;

	/**
	 * wp.customize.collectionCustomizer
	 */
	api.collectionCustomizer = {

		renderedCollections: {},
		prototypeControl: false,

		/**
		 * Initialize the Collection Customizer
		 */
		init: function() {

			this.prototypeControl = $( '#customize-controls #accordion-section-collection_section___prototype__' );

			this.bindEvents();

		},

		/**
		 * Bind the events we want to pay attention to
		 */
		bindEvents: function() {

			this.previewer.bind( 'rendered-collections', $.proxy( function( renderedCollections ) {

				$.each( renderedCollections, $.proxy( function( name, data ) {

					if ( $( '#customize-controls #accordion-section-collection_section_' + data.slug ).length ) {
						return;
					}

					this.renderCollectionControl( name, data );

				}, this ) );

			}, this ) );

		},

		/**
		 * Render a control for a Collection
		 */
		renderCollectionControl: function( name, data ) {

			// Set up DOM
			var clone = this.prototypeControl.clone();
			var collectionControlHTML = clone.wrap('<div>').parent().html().replace(/__prototype__/g, data.slug );
			collectionControlHTML = $( collectionControlHTML );
			var id = collectionControlHTML.attr( 'id' );
			collectionControlHTML.find( 'h3' ).append( ' ' + name );
			this.prototypeControl.after( collectionControlHTML );
			var control = $.extend( {}, collectionControl );
			control.init( collectionControlHTML );
			if ( data.items.length > 0 ) {
				control.selectPosts( data.items );
			}

			// Set up Customizer
			var settingId = 'collection_setting_' + data.slug;
			var settingArgs = {
				transport: 'refresh',
				previewer: this.previewer
			};
			var setting = api.create( settingId, settingId, {}, settingArgs );

			var controlType = 'text';
			api.control.add( settingId, new api.Control( settingId, {
				params: {
					settings: {
						'default': settingId
					},
					type: controlType
				}
			} ) );

			$('input.collection-item-ids', collectionControlHTML ).on( 'change', function(){
				setting.set( $(this).val().split( ',' ) );
			});

		}

	};

	/**
	 * Capture the instance of the Previewer since it is private
	 */
	OldPreviewer = api.Previewer;
	api.Previewer = OldPreviewer.extend({
		initialize: function( params, options ) {
			api.collectionCustomizer.previewer = this;
			OldPreviewer.prototype.initialize.call( this, params, options );
			this.bind( 'refresh', this.refresh );
		}
	} );

	/**
	 * Init Collections Customizer
	 */
	api.bind( 'ready', function() {

		api.collectionCustomizer.init();

	} );

})( window.wp, jQuery );