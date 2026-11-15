<?php
/**
 * Content types, their Polylang registration, and slugs shared across languages.
 *
 * apex_tx    a treatment page, /treatments/<key>/ (Thai under /th/)
 * apex_case  one before and after case, shown on its treatment's page and in the home page mirror
 * apex_lead  a consultation request from the booking form; private, Apex staff and administrators only
 */
defined( 'ABSPATH' ) || exit;

add_action( 'init', function () {
	$cpt = function ( string $type, string $one, string $many, array $args ) {
		register_post_type( $type, $args + [
			'labels' => [ 'name' => $many, 'singular_name' => $one, 'add_new_item' => "Add $one", 'edit_item' => "Edit $one", 'new_item' => "New $one", 'view_item' => "View $one", 'search_items' => "Search $many", 'not_found' => "No $many found", 'all_items' => "All $many", 'menu_name' => $many ],
			'show_in_rest' => true,
			'menu_position' => 21,
		] );
	};
	$cpt( 'apex_tx', 'Treatment', 'Treatments', [ 'public' => true, 'menu_icon' => 'dashicons-heart', 'supports' => [ 'title', 'revisions', 'page-attributes' ], 'rewrite' => [ 'slug' => 'treatments', 'with_front' => false ], 'has_archive' => false ] );
	$hidden = [ 'public' => false, 'show_ui' => true, 'show_in_menu' => true, 'exclude_from_search' => true, 'publicly_queryable' => false, 'rewrite' => false ];
	$cpt( 'apex_case', 'Before and after case', 'Before and after', $hidden + [ 'menu_icon' => 'dashicons-images-alt2', 'supports' => [ 'title', 'page-attributes' ] ] );
	// enquiries hold personal details: no REST, no search, administrators and the Apex staff role only
	$private = [ 'public' => false, 'show_ui' => true, 'show_in_menu' => true, 'show_in_rest' => false, 'exclude_from_search' => true, 'publicly_queryable' => false, 'rewrite' => false, 'map_meta_cap' => true, 'capabilities' => [ 'create_posts' => 'do_not_allow' ] ];
	$cpt( 'apex_lead', 'Enquiry', 'Enquiries', $private + [ 'capability_type' => [ 'apex_lead', 'apex_leads' ], 'menu_icon' => 'dashicons-email-alt', 'supports' => [ 'title' ], 'menu_position' => 3 ] );

	foreach ( [ 'post', 'page', 'attachment' ] as $t ) { remove_post_type_support( $t, 'comments' ); remove_post_type_support( $t, 'trackbacks' ); }
	register_post_meta( '', '_apex_key', [ 'type' => 'string', 'single' => true, 'show_in_rest' => false ] );
} );

/* who may see enquiries: administrators and the "Apex staff" role; set once, again when this list changes */
add_action( 'init', function () {
	if ( (int) get_option( 'apex_caps_v' ) === 1 ) return;
	$lead = [ 'edit_apex_leads', 'edit_others_apex_leads', 'edit_private_apex_leads', 'edit_published_apex_leads', 'read_private_apex_leads', 'delete_apex_leads', 'delete_others_apex_leads', 'delete_private_apex_leads', 'delete_published_apex_leads', 'publish_apex_leads' ];
	if ( $r = get_role( 'administrator' ) ) foreach ( $lead as $c ) $r->add_cap( $c );
	remove_role( 'apex_staff' );
	add_role( 'apex_staff', 'Apex staff (enquiries)', array_fill_keys( array_merge( [ 'read' ], $lead ), true ) );
	update_option( 'apex_caps_v', 1, true );
}, 20 );

/* Polylang translates treatments and cases; enquiries stay single-language records */
add_filter( 'pll_get_post_types', function ( $types, $is_settings ) {
	foreach ( [ 'apex_tx', 'apex_case' ] as $t ) $types[ $t ] = $t;
	unset( $types['apex_lead'] );
	return $types;
}, 10, 2 );

/* ---------- one slug in both languages ----------
   Polylang (free) makes every slug unique across languages, so /th/treatments/botox/ would become botox-2.
   A slug is allowed again when every other post that has it is in another language. */
const APEX_SHARED_SLUG_TYPES = [ 'page', 'apex_tx' ];
add_filter( 'wp_unique_post_slug', function ( $slug, $post_id, $status, $type, $parent, $original ) {
	if ( $slug === $original || ! in_array( $type, APEX_SHARED_SLUG_TYPES, true ) || ! function_exists( 'pll_get_post_language' ) ) return $slug;
	if ( defined( 'POLYLANG_PRO' ) || defined( 'ICL_SITEPRESS_VERSION' ) ) return $slug;
	$lang = pll_get_post_language( $post_id, 'slug' );
	if ( ! $lang ) return $slug;
	global $wpdb;
	$others = $wpdb->get_col( $wpdb->prepare( "SELECT ID FROM $wpdb->posts WHERE post_name = %s AND post_type = %s AND ID != %d AND post_status NOT IN ('trash','auto-draft','inherit')", $original, $type, (int) $post_id ) );
	foreach ( $others as $o ) if ( pll_get_post_language( (int) $o, 'slug' ) === $lang ) return $slug;
	return $original;
}, 20, 6 );

/** Language of the current request from its address: /th/... is Thai, anything else English. */
function apex_request_lang(): string {
	$path = trim( (string) parse_url( $_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH ), '/' );
	$home = trim( (string) parse_url( home_url( '/' ), PHP_URL_PATH ), '/' );
	if ( $home && str_starts_with( $path, $home ) ) $path = trim( substr( $path, strlen( $home ) ), '/' );
	foreach ( APEX_LANGS as $l ) if ( $l !== apex_default_lang() && ( $path === $l || str_starts_with( $path, $l . '/' ) ) ) return $l;
	return apex_default_lang();
}

/* With shared slugs, a treatment address is resolved within its language. */
add_filter( 'request', function ( $qv ) {
	if ( is_admin() || ! function_exists( 'pll_get_post_language' ) || empty( $qv['name'] ) ) return $qv;
	$type = $qv['post_type'] ?? '';
	if ( ! is_string( $type ) || ! in_array( $type, APEX_SHARED_SLUG_TYPES, true ) ) return $qv;
	global $wpdb;
	$ids = $wpdb->get_col( $wpdb->prepare( "SELECT ID FROM $wpdb->posts WHERE post_name = %s AND post_type = %s AND post_status = 'publish'", sanitize_title( rawurldecode( $qv['name'] ) ), $type ) );
	if ( count( $ids ) < 2 ) return $qv;
	$lang = apex_request_lang();
	foreach ( $ids as $id ) if ( pll_get_post_language( (int) $id, 'slug' ) === $lang ) { $qv['p'] = (int) $id; unset( $qv['name'] ); break; }
	return $qv;
}, 5 );
