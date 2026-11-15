<?php
/**
 * Language, escaping, theme files and links. The templates keep the design's page names (index.html,
 * botox.html, compare.html) so they read the same as the Python builders; apex_link() turns each into the
 * WordPress address in the current language.
 */
defined( 'ABSPATH' ) || exit;

/** Current language: Polylang's when it is active, otherwise the site default. */
function apex_lang(): string {
	if ( isset( $GLOBALS['apex_lang_override'] ) ) return $GLOBALS['apex_lang_override'];
	if ( function_exists( 'pll_current_language' ) ) {
		$l = pll_current_language( 'slug' );
		if ( in_array( $l, APEX_LANGS, true ) ) return $l;
	}
	return apex_default_lang();
}
/** Run $fn with the language set to $lang (the importer and the data layer use this). */
function apex_with_lang( string $lang, callable $fn ) {
	$prev = $GLOBALS['apex_lang_override'] ?? null;
	$GLOBALS['apex_lang_override'] = $lang;
	try { return $fn(); } finally {
		if ( $prev === null ) unset( $GLOBALS['apex_lang_override'] ); else $GLOBALS['apex_lang_override'] = $prev;
	}
}
function apex_post_lang( $post_id ): string {
	if ( function_exists( 'pll_get_post_language' ) ) {
		$l = pll_get_post_language( $post_id, 'slug' );
		if ( $l ) return $l;
	}
	return apex_default_lang();
}

/** The same escaping as Python's html.escape, so server pages match the design byte for byte. */
function apex_e( $s ): string {
	return str_replace( [ '&', '<', '>', '"', "'" ], [ '&amp;', '&lt;', '&gt;', '&quot;', '&#x27;' ], (string) ( $s ?? '' ) );
}

/* ---------- files ---------- */
function apex_asset( string $path ): string { return APEX_URI . '/assets/' . ltrim( $path, '/' ); }
/** An image as stored: "~/wp-content/uploads/..." is an upload on this site, "assets/..." ships with the theme. */
function apex_img( $s ): string {
	$s = (string) ( $s ?? '' );
	if ( $s === '' ) return '';
	if ( str_starts_with( $s, '~/' ) ) return trailingslashit( get_option( 'home' ) ) . substr( $s, 2 );
	if ( str_starts_with( $s, 'assets/' ) ) return apex_asset( substr( $s, 7 ) );
	return $s;
}
/** The reverse, for storing: an upload on this site becomes "~/..." so content survives a domain move. */
function apex_img_store( $s ): string {
	$s = trim( (string) $s );
	$home = trailingslashit( get_option( 'home' ) );
	if ( $s !== '' && str_starts_with( $s, $home . 'wp-content/uploads/' ) ) return '~/' . substr( $s, strlen( $home ) );
	if ( $s !== '' && str_starts_with( $s, APEX_URI . '/assets/' ) ) return 'assets/' . substr( $s, strlen( APEX_URI . '/assets/' ) );
	return $s;
}

/* ---------- links ---------- */
function apex_home_url( ?string $lang = null ): string {
	$lang = $lang ?: apex_lang();
	if ( function_exists( 'pll_home_url' ) ) return pll_home_url( $lang );
	return home_url( '/' );
}
/** Post id of a content item by its key (treatments, cases) in a language, or 0. */
function apex_key_id( string $type, string $key, ?string $lang = null ): int {
	static $cache = [];
	$lang = $lang ?: apex_lang();
	$ck = "$type|$key|$lang";
	if ( isset( $cache[ $ck ] ) ) return $cache[ $ck ];
	$ids = get_posts( [ 'post_type' => $type, 'post_status' => 'publish', 'posts_per_page' => -1, 'meta_key' => '_apex_key', 'meta_value' => $key, 'lang' => '', 'suppress_filters' => true, 'fields' => 'ids' ] );
	$found = 0;
	foreach ( $ids as $id ) if ( apex_post_lang( $id ) === $lang ) { $found = (int) $id; break; }
	return $cache[ $ck ] = $found;
}
/** WordPress page id for a page the theme draws (compare, privacy) in a language, or 0. */
function apex_page_id( string $key, ?string $lang = null ): int {
	$lang = $lang ?: apex_lang();
	$ids = get_posts( [ 'post_type' => 'page', 'post_status' => 'publish', 'posts_per_page' => -1, 'meta_key' => '_apex_page', 'meta_value' => $key, 'lang' => '', 'suppress_filters' => true, 'fields' => 'ids' ] );
	foreach ( $ids as $id ) if ( apex_post_lang( $id ) === $lang ) return (int) $id;
	return 0;
}
/** A design link ('index.html#book', 'botox.html', 'compare.html?a=botox&b=filler') as a WordPress address. */
function apex_link( string $href, ?string $lang = null ): string {
	$lang = $lang ?: apex_lang();
	if ( preg_match( '#^(https?:|tel:|mailto:|\#)#', $href ) ) return $href;
	$hash = '';
	if ( ( $p = strpos( $href, '#' ) ) !== false ) { $hash = substr( $href, $p ); $href = substr( $href, 0, $p ); }
	$query = '';
	if ( ( $p = strpos( $href, '?' ) ) !== false ) { $query = substr( $href, $p ); $href = substr( $href, 0, $p ); }
	$file = $href === '' ? 'index.html' : $href;
	if ( $file === 'index.html' ) return apex_home_url( $lang ) . $query . $hash;
	$key = preg_replace( '/\.html$/', '', $file );
	if ( $id = apex_page_id( $key, $lang ) ) return get_permalink( $id ) . $query . $hash;
	if ( $id = apex_key_id( 'apex_tx', $key, $lang ) ) return get_permalink( $id ) . $query . $hash;
	return apex_home_url( $lang ) . $hash;
}
/** Every href="..." in a block of design markup turned into WordPress addresses, and asset paths into theme files. */
function apex_links( string $html ): string {
	$html = preg_replace_callback( '#(src|href)="assets/([^"]*)"#', fn( $m ) => $m[1] . '="' . apex_asset( $m[2] ) . '"', $html );
	return preg_replace_callback( '#href="([^"]*)"#', fn( $m ) => 'href="' . esc_url( apex_link( html_entity_decode( $m[1] ) ) ) . '"', $html );
}
