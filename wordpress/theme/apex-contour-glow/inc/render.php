<?php
/**
 * The page templates: a PHP copy of tools/layout.py (head2, header2, footer2), tools/build_home.py,
 * tools/build_tx.py, tools/build_compare.py and tools/build_privacy.py. Each function returns the same markup
 * the Python builder writes, with the design's page names; apex_links() then turns those into WordPress addresses.
 * tests/wordpress/ssr.py compares every page with the static build, so a change here goes in the builder too.
 */
defined( 'ABSPATH' ) || exit;

const APEX_ASK = 'Ask your doctor';

function apex_planner_fixed(): array {
	static $P = null;
	if ( $P === null ) $P = json_decode( (string) file_get_contents( APEX_DIR . '/data/planner.json' ), true ) ?: [];
	return $P;
}
/** The curved section edge and the drawn skin layers (tools/layout.py CURVE, tools/skin_art.py). */
function apex_art(): array {
	static $A = null;
	if ( $A === null ) $A = json_decode( (string) file_get_contents( APEX_DIR . '/data/art.json' ), true ) ?: [ 'curve' => '', 'skin' => [] ];
	return $A;
}
function apex_line_url( array $S ): string { return 'https://line.me/R/ti/p/' . ( $S['settings']['line_id'] ?? '' ); }
function apex_tel( array $S ): string { return 'tel:' . str_replace( '-', '', $S['settings']['phone'] ?? '' ); }
/** "36,000 baht for two syringes" -> "36,000 baht", the way the Python builders shorten a price. */
function apex_short_price( string $p ): string {
	if ( strpos( $p, 'baht' ) === false ) return $p;
	$x = preg_replace( '/,/', '#', $p, 1 );
	$x = str_replace( '#', ',', explode( ',', $x )[0] );
	return implode( ' ', array_slice( preg_split( '/\s+/', trim( $x ) ), 0, 2 ) );
}
/** A care icon (tools/tx_art.py icon()). */
function apex_icon( string $k, string $cls = 'ico' ): string {
	static $I = null;
	if ( $I === null ) $I = json_decode( (string) file_get_contents( APEX_DIR . '/data/icons.json' ), true ) ?: [];
	return '<svg class="' . $cls . '" viewBox="0 0 24 24" aria-hidden="true">' . ( $I[ $k ] ?? '' ) . '</svg>';
}
/** An icon from the Apex set (tools/layout.py ic()): line icons by name, brand marks as 'brand:line'. */
function apex_ic( string $name, string $cls = '' ): string {
	static $I = null;
	if ( $I === null ) $I = json_decode( (string) file_get_contents( APEX_DIR . '/data/apex-icons.json' ), true ) ?: [];
	if ( str_starts_with( $name, 'brand:' ) ) return '<svg class="i br ' . $cls . '" viewBox="0 0 24 24" aria-hidden="true"><path d="' . ( $I[ 'b_' . substr( $name, 6 ) ] ?? '' ) . '"/></svg>';
	return '<svg class="i l ' . $cls . '" viewBox="0 0 24 24" aria-hidden="true">' . ( $I[ 'l_' . $name ] ?? '' ) . '</svg>';
}
function apex_h( array $d ): string { return apex_e( $d['h2'] ?? '' ) . ' ' . apex_e( $d['h2_em'] ?? '' ); }
/** The treatment's results setting with the design's defaults filled in. */
function apex_cases( array $S, string $k ): array { return $S['cases'][ $k ] ?? []; }
function apex_labels( array $t ): array { $l = $t['results']['labels'] ?? []; return count( $l ) >= 2 ? [ $l[0], $l[1] ] : [ 'Before', 'After' ]; }

/* ---------- shared parts: tools/layout.py ---------- */
function apex_head( string $title, string $desc ): string {
	ob_start();
	wp_head();
	$wp = ob_get_clean();
	// treatment addresses for the scripts, which build links to the pages
	$urls = [];
	foreach ( apex_site()['order'] as $k ) $urls[ $k ] = apex_link( "$k.html" );
	$wp .= '<script>window.CG_URLS = ' . wp_json_encode( $urls, JSON_UNESCAPED_SLASHES ) . '; window.CG_ASSETS = ' . wp_json_encode( apex_asset( '' ), JSON_UNESCAPED_SLASHES ) . '; window.CG_BOOK = ' . wp_json_encode( rest_url( 'apex/v1/book' ), JSON_UNESCAPED_SLASHES ) . ";</script>\n";
	$lang = apex_lang();
	$own = ! function_exists( 'apex_own_meta' ) || apex_own_meta();
	return "<!DOCTYPE html>\n<html lang=\"" . esc_attr( $lang ) . "\">\n<head>\n<meta charset=\"utf-8\">\n<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n"
		. ( $own ? '<title>' . apex_e( $title ) . "</title>\n<meta name=\"description\" content=\"" . apex_e( $desc ) . "\">\n" : '' ) . "<meta name=\"theme-color\" content=\"#1F0A30\">\n"
		. '<link rel="preload" href="assets/fonts/LINESeed-Rg-latin.woff2" as="font" type="font/woff2" crossorigin>' . "\n"
		. '<link rel="preload" href="assets/fonts/LINESeed-Bd-latin.woff2" as="font" type="font/woff2" crossorigin>' . "\n"
		. '<link rel="stylesheet" href="assets/css/apex.css?v=' . APEX_VERSION . '">' . "\n"
		. '<link rel="stylesheet" href="assets/css/cg.css?v=' . APEX_VERSION . '">' . "\n" . $wp . '</head>';
}
function apex_header( array $S, bool $home = false ): string {
	$p = $home ? '' : 'index.html';
	$nav = [ [ "$p#planner", 'Face planner' ], [ "$p#treatments", 'Treatments' ], [ "$p#layers", 'Skin layers' ], [ "$p#results", 'Results' ], [ "$p#doctors", 'Doctors' ], [ 'compare.html', 'Compare' ], [ "$p#book", 'Contact' ] ];
	$links = ''; $sheet = '';
	foreach ( $nav as [ $h, $t ] ) { $links .= '<a href="' . $h . '">' . apex_e( $t ) . '</a>'; $sheet .= '<a href="' . $h . '">' . apex_e( $t ) . apex_ic( 'arrow-right' ) . '</a>'; }
	$line = apex_line_url( $S ); $lid = apex_e( $S['settings']['line_id'] );
	return '<header class="hdr"><a class="skip" href="#main">Skip to content</a><div class="hdr-in">' . "\n"
		. '  <a class="hdr-logo" href="' . ( $p ?: '#main' ) . '" aria-label="Apex Contour and Glow"><span class="logo-txt cg-logo">APEX<small>Contour and Glow</small></span></a>' . "\n"
		. '  <nav class="hdr-nav" aria-label="Main">' . $links . '</nav>' . "\n"
		. '  <div class="hdr-right"><a class="btn btn-plum btn-sm" href="' . $p . '#book">' . apex_ic( 'message-circle' ) . 'Consultation</a><button type="button" class="burger" aria-label="Menu" data-sheet>' . apex_ic( 'menu' ) . '</button></div>' . "\n"
		. '</div></header>' . "\n"
		. '<dialog class="sheet" id="sheet" aria-label="Menu"><div class="sheet-top"><span class="logo-txt light">APEX<small>Contour and Glow</small></span><button type="button" class="close" aria-label="Close" data-close>' . apex_ic( 'x' ) . '</button></div>' . "\n"
		. '  <nav>' . $sheet . '</nav>' . "\n"
		. '  <div class="sheet-cta"><a class="btn btn-light" href="' . $p . '#book">' . apex_ic( 'message-circle' ) . 'Consultation</a><a class="btn btn-ghost" href="' . $line . '">' . apex_ic( 'brand:line' ) . 'LINE ' . $lid . '</a></div>' . "\n"
		. '</dialog>';
}
/** The clinic's social accounts as brand icons (tools/layout.py socials()). */
function apex_socials( array $S ): string {
	$o = '';
	foreach ( $S['settings']['socials'] as [ $k, $n, $u ] ) $o .= '<a href="' . apex_e( $u ) . '" aria-label="' . apex_e( $k !== 'x' ? ucfirst( $k ) : 'X' ) . ': ' . apex_e( $n ) . '" rel="noopener">' . apex_ic( 'brand:' . $k ) . '</a>';
	return '<p class="cg-soc">' . $o . '</p>';
}
/** One doctor card (tools/layout.py doc_card()). */
function apex_doc_card( array $S, array $d, string $cls = '' ): string {
	[ $slug, $name, $nick, $role, $school, $lic, $treats, $img ] = $d;
	$tx = array_values( array_filter( $S['order'], fn( $k ) => in_array( $k, $treats, true ) ) );
	$chips = '';
	foreach ( array_slice( $tx, 0, 4 ) as $k ) $chips .= '<li><a href="' . $k . '.html">' . apex_e( $S['tx'][ $k ]['name'] ) . '</a></li>';
	if ( count( $tx ) > 4 ) $chips .= '<li class="more">+' . ( count( $tx ) - 4 ) . '</li>';
	return '<article class="dr-card' . $cls . '"><div class="dr-ph"><img src="' . apex_e( apex_img( $img ) ) . '" alt="' . apex_e( $name ) . '" loading="lazy" width="480" height="600"></div>'
		. '<div class="dr-body"><p class="dr-role">' . apex_e( $role ) . '</p><h3 class="dr-name">' . apex_e( $name ) . '</h3>'
		. '<p class="dr-nick">' . apex_e( $nick ) . ( $nick !== '' ? ' · ' : '' ) . 'Licence ' . apex_e( $lic ) . '</p><p class="dr-school">' . apex_e( $school ) . '</p>'
		. ( $chips !== '' ? '<ul class="dr-tx">' . $chips . '</ul>' : '' ) . '</div></article>';
}
/** The doctors on a treatment page (tools/layout.py doctors_for()): trained in it, rotated by the page's place, then dermatologists, then anyone. */
function apex_doctors_for( array $S, string $slug, int $n = 3 ): array {
	$D = $S['clinic']['doctors'];
	$m = array_values( array_filter( $D, fn( $d ) => in_array( $slug, $d[6], true ) ) );
	if ( count( $m ) > $n ) {
		$i = array_search( $slug, $S['order'], true );
		$r = ( $i === false ? 0 : $i * $n ) % count( $m );
		$m = array_merge( array_slice( $m, $r ), array_slice( $m, 0, $r ) );
	}
	$out = array_slice( $m, 0, $n );
	foreach ( array_merge( array_values( array_filter( $D, fn( $d ) => strpos( $d[3], 'ermatolog' ) !== false ) ), $D ) as $d ) {
		if ( count( $out ) >= $n ) break;
		if ( ! in_array( $d, $out, true ) ) $out[] = $d;
	}
	return $out;
}
function apex_footer( array $S ): string {
	$s = $S['settings'];
	$tx = ''; foreach ( $S['order'] as $k ) $tx .= '<a href="' . $k . '.html">' . apex_e( $S['tx'][ $k ]['name'] ) . '</a>';
	$permit = $s['permit'] !== '' ? '<p class="ftr-lic">' . apex_e( $s['permit'] ) . '</p>' : '';
	return '<footer class="ftr sx-join" data-tone="night"><div class="wrap"><div class="ftr-top cg-ftr">' . "\n"
		. '  <div class="brand"><span class="logo-txt light">APEX<small>Contour and Glow</small></span><p>' . apex_e( $s['clinic'] ) . '</p><p class="cg-addr">' . apex_e( $s['address'] ) . '</p><p class="cg-since">' . apex_e( $s['founded'] ) . '</p>' . $permit . apex_socials( $S ) . '</div>' . "\n"
		. '  <div><h2 class="ftr-h">Treatments</h2>' . $tx . '</div>' . "\n"
		. '  <div><h2 class="ftr-h">Tools</h2><a href="index.html#planner">Face planner</a><a href="index.html#layers">Skin layers</a><a href="compare.html">Compare two treatments</a><a href="index.html#results">Before and after</a><a href="index.html#doctors">Doctors</a><a href="index.html#branches">Find a branch</a></div>' . "\n"
		. '  <div><h2 class="ftr-h">Contact</h2><a href="' . apex_line_url( $S ) . '">' . apex_ic( 'brand:line' ) . 'LINE ' . apex_e( $s['line_id'] ) . '</a><a href="' . apex_tel( $S ) . '">' . apex_ic( 'phone' ) . apex_e( $s['phone'] ) . '</a><a href="index.html#book">' . apex_ic( 'calendar' ) . 'Book a consultation</a></div>' . "\n"
		. '</div>' . "\n"
		. '<div class="ftr-bot cg-bot"><span>' . apex_e( $s['footer_note'] ) . '</span><span><a href="privacy.html">' . apex_e( $S['home']['book']['privacy'] ) . '</a></span></div></div>' . "\n"
		. '<p class="cg-mark" aria-hidden="true">APEX</p></footer>';
}
function apex_scripts( array $S ): string {
	return '<script src="assets/js/cg.js?v=' . APEX_VERSION . '"></script>';
}
function apex_tail( array $S ): string {
	ob_start();
	wp_footer();
	return ob_get_clean() . "</body>\n</html>\n";
}

/** The face planner data: tools/layout.py zones(). */
function apex_zones( array $S ): array {
	$P = apex_planner_fixed();
	$labels = [];
	foreach ( $S['planner']['zones'] as $z ) $labels[ $z['key'] ] = $z['label'];
	$z = [];
	foreach ( array_keys( $P['verts'] ) as $k ) $z[ $k ] = [];
	$z['skin'] = [];
	foreach ( $S['order'] as $slug ) {
		$t = $S['tx'][ $slug ];
		foreach ( array_merge( $t['face'], $t['body'] ) as $row ) {
			[ $lab, $note, $own ] = [ $row[0] ?? '', $row[1] ?? '', $row[2] ?? '' ];
			$a = $P['area_of'][ $lab ] ?? null;
			if ( ! $a || in_array( $slug, array_column( $z[ $a ], 'slug' ), true ) ) continue;
			$isnum = $note !== '' && ctype_digit( $note[0] );
			$z[ $a ][] = [ 'slug' => $slug, 'name' => $t['name'],
				'note' => ! $isnum ? '' : ( $slug !== 'botox' || strpos( $note, 'unit' ) !== false ? $note : ( strpos( $note, ' a side' ) !== false ? str_replace( ' a side', ' units a side', $note ) : $note . ' units' ) ),
				'price' => $own !== '' ? $own : apex_short_price( $t['summary']['from'] ) ];
		}
	}
	$names = [];
	foreach ( array_keys( $P['verts'] ) as $k ) $names[ $k ] = $labels[ $k ] ?? $k;
	$names['skin'] = $S['home']['hero']['whole'];
	return [ 'zones' => $z, 'names' => $names, 'verts' => $P['verts'], 'pts' => $P['pts'], 'fill' => $P['fill'], 'info' => $P['info'] ];
}

/* ---------- home: tools/build_home.py ---------- */
function apex_render_home( array $S ): string {
	$H = $S['home']; $T = $S['tx']; $L = $H['layers']; $s = $S['settings'];
	$from = function ( string $k ) use ( $T ) {
		$price = $T[ $k ]['summary']['from'];
		$p = apex_short_price( $price );
		if ( strpos( $price, 'typical' ) !== false ) $p = 'About ' . $p;
		return preg_match( '/\d/', $p ) ? 'From ' . $p : $p;
	};
	$groups = '';
	foreach ( $H['treatments']['halves'] as [ $half, $sub ] ) {
		$groups .= '<div class="cg-group"><h3 class="cg-gh"><b>' . apex_e( $half ) . '</b> ' . apex_e( $sub ) . '</h3><div class="svc-grid cg-grid">';
		$i = 0;
		foreach ( $S['order'] as $k ) {
			if ( $T[ $k ]['half'] !== $half ) continue;
			$groups .= '<a class="svc-tile cg-tile rv" data-d="' . ( $i * 50 ) . '" href="' . $k . '.html"><span class="st-glow" aria-hidden="true"></span>'
				. '<span class="st-ic cg-sym" aria-hidden="true">' . apex_e( $T[ $k ]['sym'] ) . '</span><span class="st-name">' . apex_e( $T[ $k ]['name'] ) . '</span>'
				. '<span class="st-en">' . apex_e( $T[ $k ]['material'] ) . '</span><span class="cg-from">' . apex_e( $from( $k ) ) . '</span>'
				. '<span class="st-go">' . apex_ic( 'arrow-up-right' ) . '</span></a>';
			$i++;
		}
		$groups .= '</div></div>';
	}
	$hero_tx = ''; foreach ( $S['order'] as $k ) $hero_tx .= '<li><a href="' . $k . '.html">' . apex_e( $T[ $k ]['name'] ) . '</a></li>';
	$rail = ''; foreach ( $S['planner']['zones'] as $z ) $rail .= '<li><button type="button" class="fz" data-z="' . $z['key'] . '">' . apex_e( $z['label'] ) . '</button></li>';
	// skin layers
	$art = apex_art();
	$lay_btns = ''; $lay_cards = '';
	foreach ( $L['layers'] as [ $k, $n, $p ] ) {
		$on = $k === 'dermis';
		$lay_btns .= '<button type="button" class="ly ly-' . $k . '" data-ly="' . $k . '" aria-pressed="' . ( $on ? 'true' : 'false' ) . '">' . ( $art['skin'][ $k ] ?? '' ) . '<span class="ly-n">' . apex_e( $n ) . '</span></button>';
		$chips = '';
		foreach ( $S['order'] as $x ) if ( in_array( $k, $T[ $x ]['layers'] ?? [], true ) ) $chips .= '<a class="ly-tx" href="' . $x . '.html"><b>' . apex_e( $T[ $x ]['sym'] ) . '</b>' . apex_e( $T[ $x ]['name'] ) . '</a>';
		$lay_cards .= '<div class="ly-card" data-ly="' . $k . '"' . ( $on ? '' : ' hidden' ) . '><p class="eyebrow on-night">' . apex_e( $n ) . '</p><p class="ly-p">' . apex_e( $p ) . '</p>'
			. ( $chips !== '' ? '<div class="ly-txs">' . $chips . '</div>' : '' ) . '</div>';
	}
	// before and after: the treatments that have slider cases
	$sets = array_values( array_filter( $S['order'], fn( $k ) => ( $T[ $k ]['results']['mode'] ?? '' ) === 'slider' && apex_cases( $S, $k ) ) );
	$RS = in_array( $H['results']['set'], $sets, true ) ? $H['results']['set'] : ( $sets[0] ?? '' );
	$ba_chips = ''; $thumbs = '';
	foreach ( $sets as $k ) {
		$ba_chips .= '<button type="button" class="chip" data-set="' . $k . '" aria-pressed="' . ( $k === $RS ? 'true' : 'false' ) . '">' . apex_e( $T[ $k ]['name'] ) . '</button>';
		$dl = apex_e( implode( ' | ', apex_labels( $T[ $k ] ) ) );
		foreach ( apex_cases( $S, $k ) as $i => $c ) {
			$thumbs .= '<button type="button" data-set="' . $k . '" data-b="' . apex_e( apex_img( $c['before'] ) ) . '" data-a="' . apex_e( apex_img( $c['after'] ) ) . '" data-l="' . $dl . '"'
				. ' class="' . ( $k === $RS && $i === 0 ? 'on' : '' ) . '"' . ( $k === $RS ? '' : ' hidden' ) . '><img src="' . apex_e( apex_img( $c['after'] ) ) . '" alt="' . apex_e( $c['alt'] ) . '" loading="lazy"></button>';
		}
	}
	$c1 = apex_cases( $S, $RS )[0] ?? [ 'before' => '', 'after' => '' ];
	$labels = $RS !== '' ? apex_labels( $T[ $RS ] ) : [ 'Before', 'After' ];
	$rsn = $RS !== '' ? $T[ $RS ]['name'] : '';
	$stats = ''; foreach ( $H['results']['stats'] as [ $a, $b ] ) $stats .= '<div><dt>' . apex_e( $a ) . '</dt><dd>' . apex_e( $b ) . '</dd></div>';
	$steps = '';
	foreach ( $H['visit']['steps'] as $i => [ $ic, $a, $b, $t ] ) $steps .= '<li><span class="vs-n">' . ( $i + 1 ) . '</span><div><b>' . apex_e( $a ) . '</b><p>' . apex_e( $b ) . '</p></div><span class="vs-t">' . apex_ic( 'clock' ) . apex_e( $t ) . '</span></li>';
	$pick = function ( string $name, string $sel ) use ( $S, $T ) {
		$o = '<select name="' . $name . '">';
		foreach ( $S['order'] as $k ) $o .= '<option value="' . $k . '"' . ( $k === $sel ? ' selected' : '' ) . '>' . apex_e( $T[ $k ]['name'] ) . '</option>';
		return $o . '</select>';
	};
	$book_opts = '<option>Not sure yet</option>';
	foreach ( $S['order'] as $k ) $book_opts .= '<option>' . apex_e( $T[ $k ]['name'] ) . '</option>';
	// doctors and branches
	$B = $H['book']; $C = $S['clinic'];
	$doctors = ''; foreach ( $C['doctors'] as $d ) $doctors .= apex_doc_card( $S, $d, ' rv' );
	$branch_opts = '<option value="">' . apex_e( $B['branch_any'] ) . '</option>'; $gname = []; $branch_tabs = '';
	foreach ( $B['groups'] as $i => [ $g, $gl ] ) {
		$gname[ $g ] = $gl;
		$branch_opts .= '<optgroup label="' . apex_e( $gl ) . '">';
		foreach ( $C['branches'] as $b ) if ( $b[1] === $g ) $branch_opts .= '<option>' . apex_e( $b[0] ) . '</option>';
		$branch_opts .= '</optgroup>';
		$branch_tabs .= '<button type="button" class="chip" data-g="' . $g . '" aria-pressed="' . ( $i === 0 ? 'true' : 'false' ) . '">' . apex_e( $gl ) . '</button>';
	}
	$branch_list = '';
	foreach ( $C['branches'] as $b ) $branch_list .= '<li data-g="' . $b[1] . '" data-lat="' . $b[4] . '" data-lng="' . $b[5] . '"><b>' . apex_e( $b[0] ) . '</b><small>' . apex_e( $gname[ $b[1] ] ?? '' ) . '</small>'
		. '<span class="br-acts"><a href="tel:' . str_replace( [ '-', ' ' ], '', $b[2] ) . '">' . apex_ic( 'phone' ) . apex_e( $b[2] ) . '</a>'
		. ( $b[3] !== '' ? '<a href="' . apex_e( $b[3] ) . '" rel="noopener">' . apex_ic( 'map-pin' ) . 'Map</a>' : '' ) . '</span></li>';
	$DR = $H['doctors'];
	$hero = $H['hero'];
	$e = 'apex_e'; $h = 'apex_h'; $ic = 'apex_ic'; $img = fn( $x ) => apex_e( apex_img( $x ) );
	$h1 = apex_e( $hero['h1'] ) . ( $hero['h1_em'] !== '' ? ' ' . apex_e( $hero['h1_em'] ) : '' );
	$line = apex_line_url( $S ); $tel = apex_tel( $S ); $curve = $art['curve']; $needle = $art['needle'] ?? '';
	$cmp_a = $pick( 'a', $H['compare']['a'] ); $cmp_b = $pick( 'b', $H['compare']['b'] );
	return apex_head( $H['seo_title'], $H['seo_desc'] ) . "\n" . '<body class="cg-home">' . "\n" . apex_header( $S, true ) . "\n" . <<<HTML
<main id="main">
<section class="hero-body cg-hero has-curve" id="planner" data-tone="night">
  <div class="hb-glow" aria-hidden="true"></div><div class="hb-suture" aria-hidden="true"></div>
  <div class="wrap hb-grid">
    <div class="hb-copy">
      <p class="eyebrow on-night rv">{$e( $hero['kicker'] )}</p>
      <h1 class="hb-h1 rv" data-d="60">$h1</h1>
      <p class="hb-lead rv" data-d="120">{$e( $hero['sub'] )}</p>
      <div class="hb-acts rv" data-d="180"><a class="btn btn-light" href="#book">{$ic( 'message-circle' )}Consultation</a><a class="btn btn-ghost" href="compare.html">{$ic( 'sliders-horizontal' )}Compare treatments</a></div>
      <ul class="hb-svcs rv" data-d="240">$hero_tx</ul>
    </div>
    <div class="hb-stage cg-stage">
      <div class="cg-sex" role="group" aria-label="Face"><button type="button" data-sex="female" aria-pressed="true">Female</button><button type="button" data-sex="male" aria-pressed="false">Male</button></div>
      <p class="empty cg-hint">{$ic( 'scan-face' )}{$e( $hero['empty'] )}</p>
      <div class="cg-head" id="planner-head" aria-label="Drag to turn the face. Tap an area below."></div>
      <canvas class="leads" aria-hidden="true"></canvas>
      <div class="cg-ba" role="group" aria-label="Filler"><button type="button" data-ba="before" aria-pressed="false">Before</button><button type="button" data-ba="after" aria-pressed="true">After</button></div>
      <ul class="cg-rail">$rail<li><button type="button" class="fz fz-skin" data-z="skin">{$e( $hero['whole'] )}</button></li></ul>
      <div class="picks" aria-live="polite">
        <div class="list" hidden><button type="button" class="pk-x" aria-label="Close">{$ic( 'x' )}</button><p class="area"></p><ul class="basis"></ul><ul class="txc"></ul></div>
      </div>
    </div>
  </div>
  <p class="refs cg-refs wrap">Filler areas follow the MD Codes (<a href="https://doi.org/10.1007/s00266-020-01762-7">de Maio, Aesthetic Plastic Surgery 2021</a>). Botox points follow published injection guides (<a href="https://doi.org/10.1097/01.PRS.0000144795.76040.D3">Carruthers, Plastic and Reconstructive Surgery 2004</a>; <a href="https://doi.org/10.3390/toxins15020082">Toxins 2023</a>; <a href="https://doi.org/10.5115/acb.22.258">Anatomy and Cell Biology 2023</a>). Simulation only. Your doctor decides the points and amounts.</p>
  <div class="sx sx-c sx-to-wash" aria-hidden="true">$curve</div>
</section>

<section class="section washed" id="treatments" data-tone="wash">
  <div class="wrap">
    <div class="shead"><div><p class="eyebrow rv">Treatments</p><h2 class="h-xl rv">{$h( $H['treatments'] )}</h2><p class="muted rv">{$e( $H['treatments']['p'] )}</p></div><a class="link-arrow rv" href="compare.html">Compare two treatments {$ic( 'arrow-right' )}</a></div>
    $groups
  </div>
</section>

<section class="section night tools-s has-sx" id="layers" data-tone="night"><div class="sx sx-b sx-wash-night" aria-hidden="true"></div>
  <div class="wrap">
    <div class="shead"><div><p class="eyebrow on-night rv">{$e( $L['eyebrow'] )}</p><h2 class="h-xl rv">{$h( $L )}</h2><p class="lead rv">{$e( $L['p'] )}</p></div></div>
    <div class="ly-wrap rv">
      <div class="ly-fig">$needle<div class="ly-stack" role="group" aria-label="Layers">$lay_btns</div></div>
      <div class="ly-cards">$lay_cards</div>
    </div>
  </div>
</section>

<section class="section has-sx" id="results" data-tone="light"><div class="sx sx-b sx-night-light" aria-hidden="true"></div>
  <div class="wrap">
    <div class="shead"><div><p class="eyebrow rv">Results</p><h2 class="h-xl rv">{$h( $H['results'] )}</h2></div></div>
    <div class="chips" role="group" aria-label="Treatment">$ba_chips</div>
    <div class="cg-res">
      <div class="cg-ba-card"><div class="ba" id="ba" data-set="$RS">
        <img src="{$img( $c1['after'] )}" alt="After {$e( $rsn )}" class="after">
        <img src="{$img( $c1['before'] )}" alt="Before {$e( $rsn )}" class="before">
        <span class="line" aria-hidden="true"></span><span class="knob" aria-hidden="true">{$ic( 'move-horizontal' )}</span>
        <span class="tag tb">{$e( $labels[0] )}</span><span class="tag ta">{$e( $labels[1] )}</span>
        <input class="range" type="range" min="0" max="100" value="50" aria-label="Move the line between before and after">
      </div></div>
      <div class="cg-res-side">
        <p class="lead">{$e( $H['results']['p'] )}</p>
        <div class="thumbs" id="thumbs">$thumbs</div>
        <dl class="stats">$stats</dl>
        <div class="tools"><button type="button" class="btn btn-plum btn-sm" data-ba="play">{$ic( 'play' )}Play again</button><a class="link-arrow" href="$RS.html" id="ba-read">Read about {$e( $rsn )} {$ic( 'arrow-right' )}</a></div>
        <p class="note">{$e( $H['results']['fine'] )}</p>
      </div>
    </div>
  </div>
</section>

<section class="section washed has-sx" id="doctors" data-tone="wash"><div class="sx sx-b sx-light-wash" aria-hidden="true"></div>
  <div class="wrap">
    <div class="shead"><div><p class="eyebrow rv">{$e( $DR['eyebrow'] )}</p><h2 class="h-xl rv">{$h( $DR )}</h2><p class="muted rv">{$e( $DR['p'] )}</p></div><a class="link-arrow rv" href="{$e( $DR['check_url'] )}" rel="noopener">{$e( $DR['check'] )} {$ic( 'arrow-up-right' )}</a></div>
    <div class="dr-row" tabindex="0" aria-label="Doctors">$doctors</div>
    <div class="dr-nav"><button type="button" class="dr-prev" aria-label="Previous doctors">{$ic( 'arrow-right' )}</button><button type="button" class="dr-next" aria-label="Next doctors">{$ic( 'arrow-right' )}</button></div>
  </div>
</section>

<section class="section has-sx" id="visit" data-tone="light"><div class="sx sx-b sx-wash-light" aria-hidden="true"></div>
  <div class="wrap cg-visit">
    <div><p class="eyebrow rv">Your visit</p><h2 class="h-xl rv">{$h( $H['visit'] )}</h2><p class="lead rv">{$e( $H['visit']['foot'] )}</p>
      <form class="cg-cmp rv" action="compare.html"><p class="eyebrow">{$h( $H['compare'] )}</p>
        <div class="cmp-row"><label>First$cmp_a</label><label>Second$cmp_b</label></div>
        <button class="btn btn-plum btn-sm" type="submit">{$ic( 'sliders-horizontal' )}Compare</button></form></div>
    <ol class="cg-steps rv">$steps</ol>
  </div>
</section>

<section class="section night has-sx" id="book" data-tone="night"><div class="sx sx-b sx-light-night" aria-hidden="true"></div>
  <div class="wrap"><div class="consult-band cg-book rv">
    <div class="cb-copy"><p class="eyebrow">Consult</p><h2 class="h-xl">{$h( $H['book'] )}</h2><p class="lead">{$e( $H['book']['p'] )}</p>
      <div class="cb-acts"><a class="cb-row" href="$line">{$ic( 'brand:line' )}<span><b>Chat on LINE</b><small>{$e( $s['line_id'] )}</small></span></a>
        <a class="cb-row" href="$tel">{$ic( 'phone' )}<span><b>Call the clinic</b><small>{$e( $s['phone'] )}</small></span></a></div></div>
    <form class="cg-form" id="book-form">
      <label>Your name<input name="name" autocomplete="name" placeholder="Ploy Srisuk" required></label>
      <label>Phone<input name="phone" type="tel" autocomplete="tel" placeholder="081 234 5678"></label>
      <label>Treatment<select name="treatment">$book_opts</select></label>
      <label>{$e( $B['branch'] )}<select name="branch">$branch_opts</select></label>
      <label>Preferred day<input name="day" type="date"></label>
      <label class="hp" aria-hidden="true">Website<input name="website" tabindex="-1" autocomplete="off"></label>
      <label class="consent"><input type="checkbox" name="consent" required><span>{$e( $H['book']['consent'] )} <a href="privacy.html">{$e( $H['book']['privacy'] )}</a></span></label>
      <button class="btn btn-light" type="submit">{$ic( 'brand:line' )}Send on LINE</button>
      <p class="note">{$e( $H['book']['fine'] )}</p>
    </form>
  </div>
  <div class="cg-branches rv" id="branches">
    <div class="br-head"><div><h3>{$e( $B['find'] )}</h3><p>{$e( $B['find_p'] )}</p></div>
      <div class="br-tools"><div class="chips" role="group" aria-label="{$e( $B['find'] )}">$branch_tabs</div>
        <label class="br-search"><span class="sr">{$e( $B['find'] )}</span><input type="search" placeholder="{$e( $B['search'] )}" autocomplete="off"></label>
        <button type="button" class="btn btn-ghost btn-sm br-near">{$ic( 'map-pin' )}{$e( $B['near'] )}</button></div></div>
    <ul class="br-list">$branch_list</ul>
  </div></div>
</section>
</main>
HTML
	. "\n" . apex_footer( $S ) . "\n" . '<script>window.CG_ZONES = ' . apex_pyjson( apex_zones( $S ) ) . '; window.CG_LINE = ' . apex_pyjson( $s['line_id'] ) . ';</script>' . "\n" . apex_scripts( $S ) . "\n" . apex_tail( $S );
}

/** JSON written the way Python's json.dumps writes it (", " and ": " separators, non-ASCII escaped). */
function apex_pyjson( $v ): string {
	$j = json_encode( $v, JSON_UNESCAPED_SLASHES | JSON_PRESERVE_ZERO_FRACTION );
	// re-space outside strings
	$out = ''; $in = false; $esc = false;
	for ( $i = 0, $n = strlen( $j ); $i < $n; $i++ ) {
		$c = $j[ $i ];
		$out .= $c;
		if ( $in ) { if ( $esc ) $esc = false; elseif ( $c === '\\' ) $esc = true; elseif ( $c === '"' ) $in = false; continue; }
		if ( $c === '"' ) $in = true;
		elseif ( $c === ',' || $c === ':' ) $out .= ' ';
	}
	return $out;
}

/* ---------- a treatment page: tools/build_tx.py ---------- */
function apex_consult_band( array $S ): string {
	$s = $S['settings'];
	return '<section class="section night" id="book"><div class="wrap"><div class="consult-band rv">' . "\n"
		. '  <div class="cb-copy"><p class="eyebrow on-night">Consult</p><h2 class="h-xl">Book a consultation</h2><p class="lead">Send your details on LINE or call, and Apex sets a day with you.</p></div>' . "\n"
		. '  <div class="cb-acts"><a class="cb-big" href="index.html#book">' . apex_ic( 'message-circle' ) . '<span><b>Book a consultation</b><small>Pick a treatment and a day</small></span>' . apex_ic( 'arrow-right' ) . '</a>' . "\n"
		. '    <a class="cb-row" href="' . apex_line_url( $S ) . '">' . apex_ic( 'brand:line' ) . '<span><b>Chat on LINE</b><small>' . apex_e( $s['line_id'] ) . '</small></span></a>' . "\n"
		. '    <a class="cb-row" href="' . apex_tel( $S ) . '">' . apex_ic( 'phone' ) . '<span><b>Call the clinic</b><small>' . apex_e( $s['phone'] ) . '</small></span></a></div>' . "\n"
		. '</div></div></section>';
}
function apex_tx_results( array $S, string $slug ): string {
	$t = $S['tx'][ $slug ]; $R = $t['results']; $cases = apex_cases( $S, $slug );
	if ( ! $cases || ! in_array( $R['mode'] ?? '', [ 'slider', 'gallery' ], true ) ) return '';
	$e = 'apex_e'; $ic = 'apex_ic'; $img = fn( $x ) => apex_e( apex_img( $x ) );
	if ( $R['mode'] === 'slider' ) {
		[ $lb, $la ] = apex_labels( $t );
		$thumbs = '';
		if ( count( $cases ) > 1 ) foreach ( $cases as $i => $c )
			$thumbs .= '<button type="button" class="' . ( $i === 0 ? 'on' : '' ) . '" data-b="' . $img( $c['before'] ) . '" data-a="' . $img( $c['after'] ) . '" data-l="' . apex_e( $lb ) . ' | ' . apex_e( $la ) . '"><img src="' . $img( $c['after'] ) . '" alt="' . apex_e( $c['alt'] ) . '" loading="lazy"></button>';
		$ar = ( $R['ar'] ?? '' ) !== '' ? $R['ar'] : '540/680';
		$cap = ( $R['caption'] ?? '' ) !== '' ? $R['caption'] : $t['name'] . ' at Apex. Drag the line across the photo to compare.';
		$c = $cases[0];
		return <<<HTML
<section class="section washed" id="results"><div class="wrap">
  <div class="shead"><div><p class="eyebrow rv">Results</p><h2 class="h-xl rv">Before and after</h2></div></div>
  <div class="cg-res rv">
    <div class="cg-ba-card"><div class="ba" id="ba" style="aspect-ratio:{$e( $ar )}">
      <img class="after" src="{$img( $c['after'] )}" alt="After {$e( $t['name'] )}">
      <img class="before" src="{$img( $c['before'] )}" alt="Before {$e( $t['name'] )}">
      <span class="line" aria-hidden="true"></span><span class="knob" aria-hidden="true">{$ic( 'move-horizontal' )}</span>
      <span class="tag tb">{$e( $lb )}</span><span class="tag ta">{$e( $la )}</span>
      <input class="range" type="range" min="0" max="100" value="50" aria-label="Move the line between before and after">
    </div></div>
    <div class="cg-res-side">
      <p class="lead">{$e( $cap )}</p>
      <div class="thumbs" id="thumbs">$thumbs</div>
      <div class="tools"><button type="button" class="btn btn-plum btn-sm" data-ba="play">{$ic( 'play' )}Play again</button></div>
      <p class="note">Individual results vary.</p>
    </div>
  </div>
</div></section>
HTML;
	}
	$imgs = '';
	foreach ( $cases as $c ) $imgs .= '<button type="button" class="gal-item rv" data-full="' . $img( $c['after'] ) . '"><img src="' . $img( $c['after'] ) . '" alt="' . apex_e( $c['alt'] ) . '" loading="lazy"></button>';
	$cap = ( $R['caption'] ?? '' ) !== '' ? $R['caption'] : $t['name'] . ' at Apex. Tap a photo to see it large.';
	return <<<HTML
<section class="section washed" id="results"><div class="wrap">
  <div class="shead"><div><p class="eyebrow rv">Results</p><h2 class="h-xl rv">Before and after</h2></div><p class="note rv">{$e( $cap )}</p></div>
  <div class="cg-gallery">$imgs</div><p class="note">Individual results vary.</p>
</div></section>
HTML;
}
function apex_render_tx( array $S, string $slug ): string {
	$t = $S['tx'][ $slug ]; $H = $S['home'];
	$docs = ''; foreach ( apex_doctors_for( $S, $slug ) as $d ) $docs .= apex_doc_card( $S, $d, ' rv' );
	$lname = []; foreach ( $H['layers']['layers'] as [ $k, $n ] ) $lname[ $k ] = $n;
	$e = 'apex_e'; $ic = 'apex_ic';
	$facts = ''; foreach ( $t['facts'] as [ $a, $b ] ) $facts .= '<div><dt>' . apex_e( $a ) . '</dt><dd>' . apex_e( $b ) . '</dd></div>';
	$frm = $t['price_from'] !== '' ? '<p class="el-from"><span>From</span><b>' . apex_e( $t['price_from'] ) . '</b><small>' . apex_e( $t['price_note'] ) . '</small></p>'
		: '<p class="el-from"><small>' . apex_e( $t['price_note'] ) . '</small></p>';
	$lay = ''; foreach ( $t['layers'] ?? [] as $k ) if ( isset( $lname[ $k ] ) ) $lay .= '<a class="chip" href="index.html#layers">' . apex_e( $lname[ $k ] ) . '</a>';
	$hook = ''; foreach ( $t['hook'] as $i => $x ) $hook .= '<p class="' . ( $i === 0 ? 'lead ' : '' ) . 'sh-p rv">' . apex_e( $x ) . '</p>';
	$how = ''; foreach ( $t['how'] as $i => [ $k, $hh, $p ] ) $how .= '<li class="rv" data-d="' . ( $i * 70 ) . '"><span class="vs-n">' . ( $i + 1 ) . '</span><b>' . apex_e( $hh ) . '</b><p>' . apex_e( $p ) . '</p></li>';
	$alts = ''; foreach ( $t['not_for'] as [ $a, $b, $c, $d ] ) $alts .= '<li><b>' . apex_e( $a ) . '</b><span>' . apex_e( $b ) . '</span>' . ( $c !== '' ? '<a class="link-arrow" href="' . $c . '">' . apex_e( $d ) . ' ' . apex_ic( 'arrow-right' ) . '</a>' : '' ) . '</li>';
	$cards = function ( array $items ) { $o = ''; foreach ( $items as $r ) $o .= '<li class="rv"><b>' . apex_e( $r[0] ?? '' ) . '</b><span>' . apex_e( $r[1] ?? '' ) . '</span>' . ( ( $r[2] ?? '' ) !== '' ? '<em>' . apex_e( $r[2] ) . '</em>' : '' ) . '</li>'; return $o; };
	$areas = ( $t['body'] ? '<h3 class="cg-gh"><b>Face</b></h3>' : '' ) . '<ul class="cg-areas">' . $cards( $t['face'] ) . '</ul>';
	if ( $t['body'] ) $areas .= '<h3 class="cg-gh"><b>Body</b></h3><ul class="cg-areas">' . $cards( $t['body'] ) . '</ul>';
	$visit = ''; foreach ( $t['fitting'] as $k => [ $a, $b ] ) $visit .= '<li><span class="vs-n">' . ( $k + 1 ) . '</span><div><b>' . apex_e( $a ) . '</b><p>' . apex_e( $b ) . '</p></div></li>';
	$tl = ''; foreach ( $t['timeline'] as [ $a, $b ] ) $tl .= '<li><b>' . apex_e( $a ) . '</b><span>' . apex_e( $b ) . '</span></li>';
	$pr = $t['prices'];
	$rows = '';
	foreach ( $pr['rows'] as $r ) { $rows .= '<tr>'; foreach ( $r as $c ) $rows .= strpos( $c, 'baht' ) !== false ? '<td class="num">' . apex_e( $c ) . '</td>' : '<td>' . apex_e( $c ) . '</td>'; $rows .= '</tr>'; }
	$heads = ''; foreach ( $pr['head'] as $hh ) $heads .= '<th>' . apex_e( $hh ) . '</th>';
	$table = $pr['rows'] ? '<div class="cg-price rv"><table><thead><tr>' . $heads . '</tr></thead><tbody>' . $rows . '</tbody></table></div>' : '';
	$pkgs = ''; foreach ( $pr['invitations'] as [ $a, $b ] ) $pkgs .= '<div class="cg-pkg rv"><p class="eyebrow">Package</p><b>' . apex_e( $a ) . '</b><span>' . apex_e( $b ) . '</span></div>';
	$prices = '<div class="cg-prices' . ( $pkgs && $table ? '' : ' solo' ) . '">' . $table . ( $pkgs ? '<div class="cg-pkgs">' . $pkgs . '</div>' : '' ) . '</div>';
	$before = ''; foreach ( $t['care']['before'] as [ $k, $hh, $p ] ) $before .= '<li>' . apex_icon( $k, 'i' ) . '<div><b>' . apex_e( $hh ) . '</b><span>' . apex_e( $p ) . '</span></div></li>';
	$after = '';
	foreach ( $t['care']['after'] as [ $w, $items ] ) {
		$after .= '<p class="cg-when">' . apex_e( $w ) . '</p><ul>';
		foreach ( $items as [ $k, $x ] ) $after .= '<li>' . apex_icon( $k, 'i' ) . '<div><span>' . apex_e( $x ) . '</span></div></li>';
		$after .= '</ul>';
	}
	$urgent = ( $t['care']['urgent'] ?? '' ) !== '' ? '<p class="cg-urgent">' . apex_ic( 'heart-pulse' ) . '<span>' . apex_e( $t['care']['urgent'] ) . '</span></p>' : '';
	$faq = ''; foreach ( $t['faq'] as [ $q, $a ] ) $faq .= '<details><summary>' . apex_e( $q ) . '<span class="pm">' . apex_ic( 'chevron-down' ) . '</span></summary><div class="ans"><p>' . apex_e( $a ) . '</p></div></details>';
	$src = ''; foreach ( $t['sources'] as $x ) $src .= '<li>' . apex_e( $x ) . '</li>';
	$no = sprintf( '%02d', (int) $t['no'] );
	$curve = apex_art()['curve']; $results = apex_tx_results( $S, $slug ); $band = apex_consult_band( $S );
	$line = apex_line_url( $S ); $lid = apex_e( $S['settings']['line_id'] );
	$title = $t['seo_title'] !== '' ? $t['seo_title'] : $t['name'] . ' at Apex | Apex Contour and Glow';
	$desc = $t['seo_desc'] !== '' ? $t['seo_desc'] : ( $t['hook'][0] ?? '' );
	return apex_head( $title, $desc ) . "\n" . '<body class="tx-page">' . "\n" . apex_header( $S ) . "\n" . <<<HTML
<main id="main">
<section class="svc-head has-curve cg-tx-head" data-tone="night">
  <div class="phead-lines" aria-hidden="true"></div>
  <div class="wrap">
    <nav class="crumbs" aria-label="Breadcrumb"><a href="index.html">Home</a>{$ic( 'chevron-down', 'cr' )}<a href="index.html#treatments">Treatments</a>{$ic( 'chevron-down', 'cr' )}<span aria-current="page">{$e( $t['name'] )}</span></nav>
    <div class="sh-grid">
      <div class="sh-copy">
        <p class="eyebrow on-night rv">{$e( $t['half'] )} · {$e( $t['material'] )}</p>
        <h1 class="display-s rv" data-d="60">{$e( $t['name'] )}</h1>
        $hook
        <div class="sh-acts rv" data-d="180"><a class="btn btn-light" href="#book">{$ic( 'message-circle' )}Consultation</a><a class="btn btn-ghost btn-sm" href="compare.html?a=$slug">{$ic( 'sliders-horizontal' )}Compare with another</a></div>
      </div>
      <aside class="cg-el rv" data-d="120">
        <div class="el-tile"><span class="el-no">$no</span><b class="el-sym">{$e( $t['sym'] )}</b><span class="el-name">{$e( $t['name'] )}</span><span class="el-mat">{$e( $t['material'] )}</span></div>
        <div class="el-side"><dl class="el-facts">$facts</dl>$frm<div class="el-lay"><span>Works in</span>$lay</div></div>
      </aside>
    </div>
  </div>
  <div class="sx sx-c" aria-hidden="true">$curve</div>
</section>

<section class="section"><div class="wrap">
  <div class="shead"><div><p class="eyebrow rv">{$e( $t['name'] )}</p><h2 class="h-xl rv">How it works</h2></div></div>
  <div class="cg-how-wrap">
    <ol class="cg-how">$how</ol>
    <aside class="cg-not rv"><p class="eyebrow">Not suited for</p><ul>$alts</ul></aside>
  </div>
</div></section>

<section class="section washed"><div class="wrap">
  <div class="shead"><div><p class="eyebrow rv">Where it goes</p><h2 class="h-xl rv">Treatment areas</h2></div><p class="note rv">{$e( $t['areas_note'] )}</p></div>
  $areas
</div></section>

<section class="section"><div class="wrap cg-visit">
  <div><p class="eyebrow rv">Your visit</p><h2 class="h-xl rv">On the day</h2>
    <aside class="recov cg-tl rv"><p class="eyebrow">When you see results</p><ol class="recov-line">$tl</ol><p class="note">Individual results vary.</p></aside></div>
  <ol class="cg-steps rv">$visit</ol>
</div>
<div class="wrap tx-docs"><div class="shead"><div><p class="eyebrow rv">Your doctor</p><h3 class="h-l rv">Apex doctors</h3></div><a class="link-arrow rv" href="index.html#doctors">See all doctors {$ic( 'arrow-right' )}</a></div>
  <div class="dr-grid">$docs</div></div>
</section>

$results

<section class="section" id="prices"><div class="wrap">
  <div class="shead"><div><p class="eyebrow rv">Prices</p><h2 class="h-xl rv">{$e( $t['name'] )} prices</h2></div><p class="note rv">{$e( $pr['note'] )}</p></div>
  $prices
</div></section>

<section class="section washed"><div class="wrap">
  <div class="shead"><div><p class="eyebrow rv">Care</p><h2 class="h-xl rv">Before and after your visit</h2></div></div>
  <div class="cg-care">
    <div class="rv"><h3>Before you come</h3><ul>$before</ul></div>
    <div class="rv" data-d="80"><h3>After you leave</h3>$after$urgent</div>
  </div>
</div></section>

<section class="section faq-s"><div class="wrap">
  <h2 class="h-l faq-h rv">Questions about {$e( $t['name'] )}</h2>
  <div class="faq-grid2"><div class="faq">$faq</div>
    <aside class="faq-cta washed rv"><span class="fc-ic">{$ic( 'brand:line' )}</span><b class="h-s">Ask on LINE</b><p>Send a photo of the area and Apex replies with what suits it.</p>
      <a class="btn btn-plum" href="$line">{$ic( 'brand:line' )}LINE $lid</a></aside></div>
  <div class="cg-src"><p class="eyebrow">Sources</p><ol>$src</ol></div>
</div></section>

$band
</main>
HTML
		. "\n" . apex_footer( $S ) . "\n" . apex_scripts( $S ) . "\n" . apex_tail( $S );
}

/* ---------- compare: tools/build_compare.py ---------- */
function apex_render_compare( array $S ): string {
	$T = $S['tx']; $ic = 'apex_ic';
	$data = [];
	foreach ( $S['order'] as $k ) $data[ $k ] = [ 'name' => $T[ $k ]['name'], 'half' => $T[ $k ]['half'] ] + $T[ $k ]['summary'] + [ 'sym' => $T[ $k ]['sym'], 'mat' => $T[ $k ]['material'] ];
	$pick = function ( string $name, string $sel ) use ( $S, $T ) {
		$o = '<select name="' . $name . '" id="pick-' . $name . '">';
		foreach ( $S['order'] as $k ) $o .= '<option value="' . $k . '"' . ( $k === $sel ? ' selected' : '' ) . '>' . apex_e( $T[ $k ]['name'] ) . '</option>';
		return $o . '</select>';
	};
	$rows = ''; foreach ( $S['compare']['rows'] as [ $key, $lab ] ) $rows .= '<tr><th scope="row">' . apex_e( $lab ) . '</th><td data-s="a" data-f="' . $key . '"></td><td data-s="b" data-f="' . $key . '"></td></tr>';
	$chips = ''; $P = [];
	foreach ( $S['compare']['pairs'] as $p ) {
		if ( ! isset( $T[ $p['a'] ], $T[ $p['b'] ] ) ) continue;
		$chips .= '<a class="chip" href="compare.html?a=' . $p['a'] . '&amp;b=' . $p['b'] . '">' . apex_e( $T[ $p['a'] ]['name'] ) . ' and ' . apex_e( $T[ $p['b'] ]['name'] ) . '</a>';
		$P[ $p['a'] . '|' . $p['b'] ] = $p['note'];
	}
	$col = fn( string $s ) => '<th><span class="cm-tile"><b data-s="' . $s . '" data-f="sym"></b></span><span class="cm-name" data-s="' . $s . '" data-f="name"></span><span class="cm-mat" data-s="' . $s . '" data-f="mat"></span></th>';
	$ca = $col( 'a' ); $cb = $col( 'b' );
	$A = $S['home']['compare']['a'] ?: 'botox'; $B = $S['home']['compare']['b'] ?: 'filler';
	$pa = $pick( 'a', $A ); $pb = $pick( 'b', $B );
	$line = apex_e( $S['settings']['line_id'] );
	$js = '<script>' . "\n" . '(() => {' . "\n"
		. '  const D = ' . apex_pyjson( $data ) . ', P = ' . apex_pyjson( (object) $P ) . ', ASK = ' . apex_pyjson( APEX_ASK ) . ';' . "\n"
		. <<<'JS'
  const q = new URLSearchParams(location.search), A = document.getElementById('pick-a'), B = document.getElementById('pick-b');
  if (D[q.get('a')]) A.value = q.get('a'); if (D[q.get('b')]) B.value = q.get('b');
  const draw = () => {
    const pick = { a: A.value, b: B.value };
    for (const s of ['a', 'b']) {
      const t = D[pick[s]];
      document.querySelectorAll('[data-s="' + s + '"]').forEach(el => {
        const f = el.dataset.f;
        if (f === 'link') { el.href = (window.CG_URLS || {})[pick[s]] || pick[s] + '.html'; el.textContent = 'Read about ' + t.name; }
        else el.textContent = t[f];
      });
    }
    const note = document.getElementById('pair-note'), key = [pick.a, pick.b].sort().join('|');
    note.hidden = !P[key]; note.textContent = P[key] || '';
    history.replaceState(null, '', '?a=' + pick.a + '&b=' + pick.b);
  };
  [A, B].forEach(s => s.addEventListener('change', () => { draw(); (window.dataLayer = window.dataLayer || []).push({ event: 'apex_compare', apex: { a: A.value, b: B.value } }); }));
  draw();
})();
</script>
JS;
	return apex_head( 'Compare two treatments | Apex Contour and Glow', 'Compare two injectable treatments at Apex side by side: what each one is, what it suits, when it shows, how long it lasts and what it costs.' )
		. "\n" . '<body class="cmp-page">' . "\n" . apex_header( $S ) . "\n" . <<<HTML
<main id="main">
<section class="phead cg-cmpage" data-tone="night"><div class="phead-lines" aria-hidden="true"></div><div class="wrap cg-cmp-grid">
  <div class="cg-cmp-side">
    <nav class="crumbs" aria-label="Breadcrumb"><a href="index.html">Home</a>{$ic( 'chevron-down', 'cr' )}<span aria-current="page">Compare</span></nav>
    <h1 class="display-s">Compare two treatments</h1>
    <p class="lead">Pick any two and read them side by side.</p>
    <form class="cg-pair" action="compare.html" id="pair">
      <label>First$pa</label><label>Second$pb</label>
    </form>
    <p class="eyebrow on-night">Often compared</p>
    <div class="chips cg-pchips">$chips</div>
  </div>
  <div class="cg-cmp-card">
  <table class="cg-cmp-table">
    <thead><tr><th></th>$ca$cb</tr></thead>
    <tbody>$rows<tr class="go"><th scope="row"></th><td><a class="link-arrow" data-s="a" data-f="link"></a></td><td><a class="link-arrow" data-s="b" data-f="link"></a></td></tr></tbody>
  </table>
  <p class="cg-cmp-note" id="pair-note" hidden></p>
  <p class="note">Starting prices. Promotions change, so check the latest on LINE $line.</p>
  </div>
</div></section>
</main>
HTML
		. "\n" . apex_footer( $S ) . "\n" . $js . "\n" . apex_scripts( $S ) . "\n" . apex_tail( $S );
}

/* ---------- privacy policy: tools/build_privacy.py ---------- */
/** Escapes text, then turns **bold** and [text](link) into markup, the same as inl() in tools/layout.py. */
function apex_inl( $s ): string {
	$h = apex_e( $s );
	$h = preg_replace( '#\[([^\]\n]+)\]\(((?:https?://|mailto:|tel:|/|\#)[^\s()]*)\)#u', '<a href="$2">$1</a>', $h );
	return preg_replace( '#\*\*([^*\n]+?)\*\*#u', '<strong>$1</strong>', $h );
}
function apex_render_privacy( array $S ): string {
	$P = $S['privacy'];
	$body = [];
	foreach ( $P['blocks'] as [ $t, $x ] ) {
		if ( $t === 'list' ) { $li = ''; foreach ( explode( "\n", $x ) as $i ) if ( trim( $i ) !== '' ) $li .= '<li>' . apex_inl( $i ) . '</li>'; $body[] = '<ul>' . $li . '</ul>'; }
		elseif ( $t === 'h2' || $t === 'h3' ) $body[] = "<$t>" . apex_inl( $x ) . "</$t>";
		else $body[] = '<p>' . apex_inl( $x ) . '</p>';
	}
	return apex_head( $P['seo_title'], $P['seo_desc'] ) . "\n" . '<body class="legal-page">' . "\n" . apex_header( $S ) . "\n" . '<main id="main">' . "\n"
		. '<section class="phead has-curve" data-tone="night"><div class="phead-lines" aria-hidden="true"></div><div class="wrap">' . "\n"
		. '  <nav class="crumbs" aria-label="Breadcrumb"><a href="index.html">Home</a>' . apex_ic( 'chevron-down', 'cr' ) . '<span aria-current="page">Privacy policy</span></nav>' . "\n"
		. '  <h1 class="display-s">' . apex_e( $P['h1'] ) . '</h1></div>' . "\n"
		. '  <div class="sx sx-c" aria-hidden="true">' . apex_art()['curve'] . '</div></section>' . "\n"
		. '<section class="section"><div class="wrap"><div class="prose cg-legal">' . "\n" . implode( "\n", $body ) . "\n" . '</div></div></section>' . "\n" . '</main>'
		. "\n" . apex_footer( $S ) . "\n" . apex_scripts( $S ) . "\n" . apex_tail( $S );
}
