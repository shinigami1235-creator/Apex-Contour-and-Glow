<?php
/**
 * Content as the design's data structure. apex_site( 'th' ) returns the same shape the Python builders read
 * (SETTINGS and HOME from tools/site_content.py, TX from tools/tx_content.py, ROWS, PAIRS and ZONES from
 * tools/layout.py), built from what editors entered in WordPress. The templates in inc/render.php draw from it.
 *
 * Storage: a field with 'src' => 'title' lives in the post title, 'order' in the menu order, 'key' in _apex_key,
 * everything else in post meta "apex_<key>". Settings, home, compare and planner are options apex_<name>_<lang>.
 */
defined( 'ABSPATH' ) || exit;

function apex_meta_key( string $k ): string { return $k === 'key' ? '_apex_key' : 'apex_' . $k; }

/** A stored value cleaned to its field type: numbers as numbers, lists without blanks, empty groups as null. */
function apex_norm( array $f, $v ) {
	switch ( $f['t'] ) {
		case 'number':
			return is_numeric( $v ) ? $v + 0 : null;
		case 'lines':
			if ( is_string( $v ) ) $v = preg_split( '/\r\n|\r|\n/', $v );
			if ( ! is_array( $v ) ) return [];
			return array_values( array_filter( array_map( fn( $x ) => trim( (string) ( is_array( $x ) ? '' : $x ) ), $v ), fn( $x ) => $x !== '' ) );
		case 'group':
			$o = []; $any = false;
			foreach ( $f['f'] as $sf ) {
				$x = apex_norm( $sf, is_array( $v ) ? ( $v[ $sf['k'] ] ?? null ) : null );
				$o[ $sf['k'] ] = $x;
				if ( $x !== null && $x !== '' && $x !== [] ) $any = true;
			}
			return $any ? $o : null;
		case 'repeater':
			if ( ! is_array( $v ) ) return [];
			$rows = [];
			foreach ( $v as $row ) {
				if ( ! is_array( $row ) ) continue;
				$r = apex_norm( [ 't' => 'group', 'f' => $f['f'] ], $row );
				if ( $r !== null ) $rows[] = $r;
			}
			return $rows;
		case 'image':
			return apex_img_store( is_scalar( $v ) ? (string) $v : '' );
		default:
			return is_scalar( $v ) ? trim( (string) $v ) : '';
	}
}

/* ---------- stored shape <-> design shape ----------
   The design keeps some rows as plain lists, [label, value]; the admin edits them as named fields. */
function apex_to_design( array $f, $v ) {
	if ( $f['t'] === 'group' ) {
		if ( ! is_array( $v ) ) $v = [];
		$o = [];
		foreach ( $f['f'] as $sf ) $o[ $sf['k'] ] = apex_to_design( $sf, $v[ $sf['k'] ] ?? null );
		return $o;
	}
	if ( $f['t'] === 'repeater' ) {
		$out = [];
		foreach ( is_array( $v ) ? $v : [] as $row ) {
			$r = [];
			foreach ( $f['f'] as $sf ) $r[ $sf['k'] ] = apex_to_design( $sf, $row[ $sf['k'] ] ?? null );
			$out[] = empty( $f['list'] ) ? $r : array_values( $r );
		}
		return $out;
	}
	if ( $f['t'] === 'lines' ) return is_array( $v ) ? $v : [];
	if ( $f['t'] === 'number' ) return $v;
	return $v ?? '';
}
function apex_from_design( array $f, $v ) {
	if ( $f['t'] === 'group' ) {
		$o = [];
		foreach ( $f['f'] as $sf ) if ( is_array( $v ) && array_key_exists( $sf['k'], $v ) ) $o[ $sf['k'] ] = apex_from_design( $sf, $v[ $sf['k'] ] );
		return $o;
	}
	if ( $f['t'] === 'repeater' ) {
		$out = [];
		foreach ( is_array( $v ) ? $v : [] as $row ) {
			$r = [];
			foreach ( $f['f'] as $i => $sf ) {
				$x = empty( $f['list'] ) ? ( $row[ $sf['k'] ] ?? null ) : ( $row[ $i ] ?? null );
				$r[ $sf['k'] ] = apex_from_design( $sf, $x );
			}
			$out[] = $r;
		}
		return $out;
	}
	return $v;
}

/* ---------- posts ---------- */
/** Every schema field of a post, in the design's shape. */
function apex_read_post( $post, string $schema ): array {
	$post = get_post( $post );
	if ( ! $post ) return [];
	$o = [];
	foreach ( apex_schema( $schema ) as $f ) {
		$src = $f['src'] ?? '';
		if ( $src === 'title' ) $o[ $f['k'] ] = $post->post_title;
		elseif ( $src === 'order' ) $o[ $f['k'] ] = (int) $post->menu_order;
		else $o[ $f['k'] ] = apex_to_design( $f, apex_norm( $f, get_post_meta( $post->ID, apex_meta_key( $f['k'] ), true ) ) );
	}
	return $o;
}
/** Write fields in the design's shape to a post. Only keys present in $vals are touched. */
function apex_write_post( int $id, string $schema, array $vals ): void {
	$post = [];
	foreach ( apex_schema( $schema ) as $f ) {
		if ( ! array_key_exists( $f['k'], $vals ) ) continue;
		$v = $vals[ $f['k'] ];
		$src = $f['src'] ?? '';
		if ( $src === 'title' ) { $post['post_title'] = (string) $v; continue; }
		if ( $src === 'order' ) { $post['menu_order'] = (int) $v; continue; }
		apex_store_meta( $id, $f, apex_norm( $f, apex_from_design( $f, $v ) ) );
	}
	if ( $post ) { $post['ID'] = $id; wp_update_post( wp_slash( $post ) ); }
}
/** Save one field already in the stored shape (the admin form and the importer both end here). */
function apex_store_meta( int $id, array $f, $v ): void {
	if ( $v === null || $v === '' || $v === [] ) delete_post_meta( $id, apex_meta_key( $f['k'] ) );
	else update_post_meta( $id, apex_meta_key( $f['k'] ), wp_slash( $v ) );
}

/* ---------- options: settings, home, compare, planner ---------- */
const APEX_OPTIONS = [ 'settings', 'home', 'compare', 'planner' ];
function apex_read_opt( string $name, string $lang ): array {
	$v = get_option( "apex_{$name}_{$lang}" );
	$v = is_array( $v ) ? $v : [];
	$o = [];
	foreach ( apex_schema( $name ) as $f ) $o[ $f['k'] ] = apex_to_design( $f, apex_norm( $f, $v[ $f['k'] ] ?? null ) );
	return $o;
}
/** $vals in the stored shape (the admin form) or, with $design, in the design's shape (the importer). */
function apex_write_opt( string $name, string $lang, array $vals, bool $design = false ): void {
	$cur = get_option( "apex_{$name}_{$lang}" );
	$cur = is_array( $cur ) ? $cur : [];
	foreach ( apex_schema( $name ) as $f ) {
		if ( ! array_key_exists( $f['k'], $vals ) ) continue;
		$cur[ $f['k'] ] = apex_norm( $f, $design ? apex_from_design( $f, $vals[ $f['k'] ] ) : $vals[ $f['k'] ] );
	}
	update_option( "apex_{$name}_{$lang}", $cur, true );
}

/** Published posts of a type in a language, in editor order. */
function apex_posts( string $type, string $lang ): array {
	$ids = get_posts( [ 'post_type' => $type, 'post_status' => 'publish', 'posts_per_page' => -1, 'orderby' => [ 'menu_order' => 'ASC', 'ID' => 'ASC' ], 'lang' => '', 'suppress_filters' => true, 'fields' => 'ids', 'no_found_rows' => true ] );
	return array_values( array_filter( $ids, fn( $id ) => apex_post_lang( $id ) === $lang ) );
}

/* ---------- the whole site in one object, cached until anything is saved ---------- */
function apex_site( ?string $lang = null ): array {
	$lang = $lang ?: apex_lang();
	static $mem = [];
	$v = (int) get_option( 'apex_data_v', 1 );
	$ck = "apex_site_{$v}_{$lang}";
	if ( isset( $mem[ $ck ] ) ) return $mem[ $ck ];
	$t = defined( 'APEX_NO_CACHE' ) && APEX_NO_CACHE ? false : get_transient( $ck );
	if ( is_array( $t ) ) return $mem[ $ck ] = $t;
	$d = apex_with_lang( $lang, fn() => apex_build_site( $lang ) );
	set_transient( $ck, $d, DAY_IN_SECONDS );
	return $mem[ $ck ] = $d;
}
function apex_build_site( string $lang ): array {
	$S = [];
	foreach ( APEX_OPTIONS as $o ) $S[ $o ] = apex_read_opt( $o, $lang );
	$S['tx'] = []; $S['order'] = []; $S['ids'] = [];
	foreach ( apex_posts( 'apex_tx', $lang ) as $id ) {
		$t = apex_read_post( $id, 'apex_tx' );
		if ( ( $t['key'] ?? '' ) === '' ) continue;
		$S['tx'][ $t['key'] ] = $t; $S['order'][] = $t['key']; $S['ids'][ $t['key'] ] = $id;
	}
	$S['cases'] = [];
	foreach ( apex_posts( 'apex_case', $lang ) as $id ) {
		$c = apex_read_post( $id, 'apex_case' );
		if ( ( $c['tx'] ?? '' ) !== '' ) $S['cases'][ $c['tx'] ][] = $c;
	}
	return $S;
}
/** Any save makes the cached site stale at once. */
function apex_data_bump(): void { update_option( 'apex_data_v', (int) get_option( 'apex_data_v', 1 ) + 1, true ); }
add_action( 'save_post', function ( $id, $p ) { if ( $p->post_type !== 'revision' && $p->post_type !== 'apex_lead' ) apex_data_bump(); }, 10, 2 );
foreach ( [ 'deleted_post', 'trashed_post', 'untrashed_post' ] as $h ) add_action( $h, 'apex_data_bump' );
add_action( 'updated_option', function ( $name ) { if ( preg_match( '/^apex_(settings|home|compare|planner)_/', $name ) ) apex_data_bump(); } );
