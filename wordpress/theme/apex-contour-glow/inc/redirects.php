<?php
/**
 * Addresses from the preview site (botox.html, compare.html, privacy.html) go to their WordPress pages, so a
 * link someone saved or shared during the review still works.
 */
defined( 'ABSPATH' ) || exit;

add_action( 'template_redirect', function () {
	if ( ! is_404() ) return;
	$path = (string) parse_url( $_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH );
	if ( ! preg_match( '#/([a-z0-9-]+)\.html$#', $path, $m ) ) return;
	$lang = apex_request_lang();
	$to = apex_link( $m[1] . '.html', $lang );
	$qs = (string) parse_url( $_SERVER['REQUEST_URI'] ?? '', PHP_URL_QUERY );
	if ( $m[1] !== 'index' && $to === apex_home_url( $lang ) ) return;   // nothing by that name
	wp_safe_redirect( $to . ( $qs !== '' ? '?' . $qs : '' ), 301 );
	exit;
} );
