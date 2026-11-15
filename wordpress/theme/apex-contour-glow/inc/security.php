<?php
/**
 * Hardening that belongs to the site rather than the server: no comments, no XML-RPC, no user listing,
 * fewer version hints, basic security headers and a brake on password guessing.
 * The server side (file permissions, PHP in uploads, HTTPS) is in HANDOVER.md.
 */
defined( 'ABSPATH' ) || exit;

/* fewer hints about the software */
remove_action( 'wp_head', 'wp_generator' );
remove_action( 'wp_head', 'rsd_link' );
remove_action( 'wp_head', 'wlwmanifest_link' );
remove_action( 'wp_head', 'wp_shortlink_wp_head' );
remove_action( 'wp_head', 'print_emoji_detection_script', 7 );
remove_action( 'wp_print_styles', 'print_emoji_styles' );
remove_action( 'admin_print_scripts', 'print_emoji_detection_script' );
remove_action( 'admin_print_styles', 'print_emoji_styles' );
add_filter( 'the_generator', '__return_empty_string' );

/* no XML-RPC: nothing on this site uses it, and it is a common password-guessing route */
add_filter( 'xmlrpc_enabled', '__return_false' );
add_filter( 'xmlrpc_methods', '__return_empty_array' );   // pingback.ping and system.multicall go too
add_filter( 'wp_headers', function ( $h ) { unset( $h['X-Pingback'] ); return $h; } );
add_filter( 'pings_open', '__return_false', 20 );

/* no comments anywhere */
add_filter( 'comments_open', '__return_false', 20 );
add_filter( 'comments_array', '__return_empty_array', 20 );
add_action( 'admin_menu', function () { remove_menu_page( 'edit-comments.php' ); remove_submenu_page( 'options-general.php', 'options-discussion.php' ); } );
add_action( 'admin_bar_menu', function ( $bar ) { $bar->remove_node( 'comments' ); }, 100 );
add_action( 'wp_dashboard_setup', function () { remove_meta_box( 'dashboard_recent_comments', 'dashboard', 'normal' ); } );

/* nobody can list the site's user names from outside */
add_filter( 'rest_endpoints', function ( $e ) {
	if ( ! is_user_logged_in() ) foreach ( array_keys( $e ) as $k ) if ( str_starts_with( $k, '/wp/v2/users' ) ) unset( $e[ $k ] );
	return $e;
} );
add_action( 'template_redirect', function () {
	if ( is_author() || ( isset( $_GET['author'] ) && ! is_admin() ) ) { wp_safe_redirect( home_url( '/' ), 301 ); exit; }
}, 0 );
add_filter( 'oembed_response_data', function ( $d ) { unset( $d['author_name'], $d['author_url'] ); return $d; } );

/* the same message for a wrong name and a wrong password */
add_filter( 'login_errors', fn() => __( 'The username or password is not right.', 'apex' ) );

/* password guessing: after 8 failures for one username from one connection in 15 minutes, that pair waits.
   Counting the pair keeps one person behind a shared address from locking out
   the whole office, and keeps a stranger from locking a staff member out from elsewhere. */
function apex_login_key( string $username ): string {
	$ip = function_exists( 'apex_client_ip' ) ? apex_client_ip() : ( $_SERVER['REMOTE_ADDR'] ?? '' );
	return 'apex_login_' . substr( hash_hmac( 'sha256', $ip . '|' . strtolower( $username ), wp_salt( 'auth' ) ), 0, 20 );
}
add_filter( 'authenticate', function ( $user, $username ) {
	if ( ! $username ) return $user;
	if ( (int) get_transient( apex_login_key( (string) $username ) ) >= 8 ) return new WP_Error( 'apex_locked', __( 'Too many tries. Wait 15 minutes and try again.', 'apex' ) );
	return $user;
}, 30, 2 );
add_action( 'wp_login_failed', function ( $username ) {
	$k = apex_login_key( (string) $username );
	set_transient( $k, (int) get_transient( $k ) + 1, 15 * MINUTE_IN_SECONDS );
} );

/* security headers on every page the theme sends */
add_action( 'send_headers', function () {
	if ( headers_sent() ) return;
	header( 'X-Content-Type-Options: nosniff' );
	header( 'Referrer-Policy: strict-origin-when-cross-origin' );
	header( 'X-Frame-Options: SAMEORIGIN' );
	header( 'Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=()' );
	// HTTPS only, once every address works over HTTPS: define( 'APEX_HSTS', 31536000 ); in wp-config.php.
	// Browsers remember it for that many seconds, so start with a day (86400) and raise it after a week.
	if ( defined( 'APEX_HSTS' ) && (int) APEX_HSTS > 0 && is_ssl() ) header( 'Strict-Transport-Security: max-age=' . (int) APEX_HSTS );
} );
/* the REST answers (the booking form) skip send_headers, so they get the same basics here */
add_filter( 'rest_post_dispatch', function ( $res ) {
	if ( $res instanceof WP_REST_Response ) { $res->header( 'X-Content-Type-Options', 'nosniff' ); $res->header( 'Referrer-Policy', 'strict-origin-when-cross-origin' ); }
	return $res;
} );

/* uploads: images, video and PDF only (no SVG, which can carry script) */
add_filter( 'upload_mimes', function ( $m ) {
	unset( $m['svg'], $m['svgz'], $m['swf'], $m['exe'] );
	return $m;
} );
