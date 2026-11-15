<?php
/**
 * The page templates: a PHP copy of tools/layout.py (head, header, footer), tools/build_home.py,
 * tools/build_tx.py and tools/build_compare.py. Each function returns the same markup the Python builder
 * writes, with the design's page names; apex_links() then turns those into WordPress addresses.
 * tests/wordpress/ssr.py compares every page with the static build, so a change here goes in the builder too.
 */
defined( 'ABSPATH' ) || exit;

const APEX_ASK = 'Ask your doctor';
const APEX_ROMAN = [ 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII' ];

function apex_planner_fixed(): array {
	static $P = null;
	if ( $P === null ) $P = json_decode( (string) file_get_contents( APEX_DIR . '/data/planner.json' ), true ) ?: [];
	return $P;
}
function apex_divider(): string { return '<img class="orn-div" src="assets/img/orn/divider.svg" alt="">'; }
function apex_h2( array $d, string $a = 'h2', string $b = 'h2_em' ): string { return apex_e( $d[ $a ] ?? '' ) . ' <em>' . apex_e( $d[ $b ] ?? '' ) . '</em>'; }
function apex_line_url( array $S ): string { return 'https://line.me/R/ti/p/' . ( $S['settings']['line_id'] ?? '' ); }
function apex_tel( array $S ): string { return 'tel:' . str_replace( '-', '', $S['settings']['phone'] ?? '' ); }
/** "36,000 baht for two syringes" -> "36,000 baht", the way the Python builders shorten a price. */
function apex_short_price( string $p ): string {
	if ( strpos( $p, 'baht' ) === false ) return $p;
	$x = preg_replace( '/,/', '#', $p, 1 );
	$x = str_replace( '#', ',', explode( ',', $x )[0] );
	return implode( ' ', array_slice( preg_split( '/\s+/', trim( $x ) ), 0, 2 ) );
}
function apex_icon( string $k, string $cls = 'ico' ): string {
	static $I = null;
	if ( $I === null ) $I = json_decode( (string) file_get_contents( APEX_DIR . '/data/icons.json' ), true ) ?: [];
	return '<svg class="' . $cls . '" viewBox="0 0 24 24" aria-hidden="true">' . ( $I[ $k ] ?? '' ) . '</svg>';
}

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
		. ( $own ? '<title>' . apex_e( $title ) . "</title>\n<meta name=\"description\" content=\"" . apex_e( $desc ) . "\">\n" : '' ) . "<meta name=\"theme-color\" content=\"#4a2563\">\n"
		. '<link rel="preload" href="assets/fonts/bodoni-moda-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>' . "\n"
		. '<link rel="preload" href="assets/fonts/jost-latin-300-normal.woff2" as="font" type="font/woff2" crossorigin>' . "\n"
		. '<link rel="stylesheet" href="assets/css/lux.css?v=' . APEX_VERSION . '">' . "\n" . $wp . '</head>';
}
function apex_header( bool $home = false ): string {
	$p = $home ? '' : 'index.html';
	return '<header class="topbar"><div class="wrap">' . "\n"
		. '  <a class="mark" href="' . ( $p ?: '#top' ) . '">Apex <span>Contour and Glow</span></a>' . "\n"
		. '  <nav aria-label="Main"><a href="' . $p . '#planner">Face planner</a><a href="' . $p . '#treatments">Treatments</a><a href="' . $p . '#results">Results</a><a href="compare.html">Compare</a><a href="' . $p . '#book">Contact</a></nav>' . "\n"
		. '  <a class="btn lt" href="' . $p . '#book">Book</a>' . "\n" . '</div></header>';
}
function apex_footer( array $S ): string {
	$s = $S['settings'];
	return '<footer class="foot">' . "\n"
		. '  <img class="orn-div" src="assets/img/orn/divider.svg" alt="">' . "\n"
		. '  <p class="mark">Apex <span>Contour and Glow</span></p>' . "\n"
		. '  <p>' . apex_e( $s['clinic'] ) . '</p>' . "\n"
		. '  <p>LINE <a href="' . apex_line_url( $S ) . '">' . $s['line_id'] . '</a> · <a href="' . apex_tel( $S ) . '">' . $s['phone'] . '</a></p>'
		. ( $s['permit'] !== '' ? "\n" . '  <p class="fine">' . apex_e( $s['permit'] ) . '</p>' : '' ) . "\n"
		. '  <p class="fine">' . apex_e( $s['footer_note'] ) . '</p>' . "\n"
		. '  <p class="fine"><a href="privacy.html">' . apex_e( $S['home']['book']['privacy'] ) . '</a></p>' . "\n" . '</footer>';
}
function apex_scripts( array $S ): string {
	return '<script src="assets/js/lux.js?v=' . APEX_VERSION . '"></script>';
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
			[ $lab, $note ] = [ $row[0] ?? '', $row[1] ?? '' ];
			$a = $P['area_of'][ $lab ] ?? null;
			if ( ! $a || in_array( $slug, array_column( $z[ $a ], 'slug' ), true ) ) continue;
			$isnum = $note !== '' && ctype_digit( $note[0] );
			$z[ $a ][] = [ 'slug' => $slug, 'name' => $t['name'],
				'note' => $isnum ? $note . ( $slug === 'botox' && strpos( $note, 'unit' ) === false ? ' units' : '' ) : '',
				'price' => apex_short_price( $t['summary']['from'] ) ];
		}
	}
	$names = [];
	foreach ( array_keys( $P['verts'] ) as $k ) $names[ $k ] = $labels[ $k ] ?? $k;
	$names['skin'] = $S['home']['hero']['whole'];
	return [ 'zones' => $z, 'names' => $names, 'verts' => $P['verts'], 'pts' => $P['pts'], 'fill' => $P['fill'], 'info' => $P['info'] ];
}

/* ---------- home: tools/build_home.py ---------- */
function apex_render_home( array $S ): string {
	$H = $S['home']; $T = $S['tx']; $P = apex_planner_fixed();
	$item = function ( string $k ) use ( $T ) {
		$t = $T[ $k ]; $price = $t['summary']['from'];
		$p = apex_short_price( $price );
		if ( strpos( $price, 'typical' ) !== false ) $p = 'About ' . $p;
		$lasts = $t['summary']['lasts'];
		$w = apex_e( $t['summary']['for'] ) . ( ! in_array( $lasts, [ APEX_ASK, 'Your doctor plans it' ], true ) && $lasts !== '' ? ' · lasts <i>' . apex_e( mb_strtolower( mb_substr( $lasts, 0, 1 ) ) . mb_substr( $lasts, 1 ) ) . '</i>' : '' );
		return '<li><a href="' . $k . '.html"><b>' . apex_e( $t['name'] ) . '</b><em class="p">' . apex_e( $p ) . '</em><span class="w">' . $w . '</span></a></li>';
	};
	$menu = '';
	foreach ( $H['treatments']['halves'] as [ $half, $sub ] ) {
		$menu .= '<div><h3>' . $half . ' <span>' . $sub . '</span></h3><ul>';
		foreach ( $S['order'] as $k ) if ( $T[ $k ]['half'] === $half ) $menu .= $item( $k );
		$menu .= '</ul></div>';
	}
	$col = function ( string $side ) use ( $S, $P ) {
		$o = '';
		foreach ( $S['planner']['zones'] as $z ) if ( ( $P['sides'][ $z['key'] ] ?? '' ) === $side ) $o .= '<button type="button" class="fz" data-z="' . $z['key'] . '">' . apex_e( $z['label'] ) . '</button>';
		return $o;
	};
	$sicon = [ 'talk' => '<path d="M4 5h16v10H9l-5 4z"/><path d="M8 9h8M8 12h5"/>', 'tube' => '<path d="M9 3h6v3H9z"/><path d="M8 6h8l-1 14H9z"/><path d="M10 11h4"/>',
		'needle' => '<path d="M14 4l6 6M17 7L8 16l-2 0 0-2 9-9M6 18l-2 2M11 9l2 2M9 11l2 2"/>', 'ice' => '<path d="M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9"/><path d="M10 4.5l2 1.5 2-1.5M10 19.5l2-1.5 2 1.5"/>',
		'cal' => '<rect x="4" y="5" width="16" height="15" rx="1"/><path d="M4 9h16M8 3v4M16 3v4M9 14l2 2 4-4"/>' ];
	$steps = '';
	foreach ( $H['visit']['steps'] as $i => [ $ic, $a, $b, $t ] ) {
		$steps .= '<li class="gilt sm"><span class="med"><svg viewBox="0 0 24 24" aria-hidden="true">' . ( $sicon[ $ic ] ?? '' ) . '</svg></span><span class="n">' . APEX_ROMAN[ $i ] . '</span>'
			. '<h3>' . apex_e( $a ) . '</h3><p>' . apex_e( $b ) . '</p><span class="time">' . apex_e( $t ) . '</span></li>';
	}
	$pick = function ( string $name, string $sel ) use ( $S, $T ) {
		$o = '<select name="' . $name . '">';
		foreach ( $S['order'] as $k ) $o .= '<option value="' . $k . '"' . ( $k === $sel ? ' selected' : '' ) . '>' . apex_e( $T[ $k ]['name'] ) . '</option>';
		return $o . '</select>';
	};
	$book_opts = '<option>Not sure yet</option>';
	foreach ( $S['order'] as $k ) $book_opts .= '<option>' . apex_e( $T[ $k ]['name'] ) . '</option>';
	$RS = $H['results']['set']; $R = $T[ $RS ]['results']; $cases = $S['cases'][ $RS ] ?? [];
	$thumbs = '';
	foreach ( $cases as $i => $c ) $thumbs .= '<button type="button" data-i="' . ( $i + 1 ) . '" class="' . ( $i === 0 ? 'on' : '' ) . '"><img src="' . apex_e( $c['after'] ) . '" alt="' . apex_e( $c['alt'] ) . '" loading="lazy"></button>';
	$c1 = $cases[0] ?? [ 'before' => '', 'after' => '' ];
	$labels = $R['labels'] ?: [ 'Before', 'After' ];
	$stats = '';
	foreach ( $H['results']['stats'] as [ $a, $b ] ) $stats .= '<div><dt>' . apex_e( $a ) . '</dt><dd>' . apex_e( $b ) . '</dd></div>';
	$s = $S['settings']; $hero = $H['hero'];
	$e = 'apex_e'; $h2 = 'apex_h2'; $div = apex_divider(); $n = fn( $x ) => $x; $line = apex_line_url( $S ); $tel = apex_tel( $S );
	$refs = '<p class="refs">Filler areas follow the MD Codes (<a href="https://doi.org/10.1007/s00266-020-01762-7">de Maio, Aesthetic Plastic Surgery 2021</a>). Botox points follow published injection guides (<a href="https://doi.org/10.1097/01.PRS.0000144795.76040.D3">Carruthers, Plastic and Reconstructive Surgery 2004</a>; <a href="https://doi.org/10.3390/toxins15020082">Toxins 2023</a>; <a href="https://doi.org/10.5115/acb.22.258">Anatomy and Cell Biology 2023</a>). Simulation only. Your doctor decides the points and amounts.</p>';
	return apex_head( $H['seo_title'], $H['seo_desc'] ) . "\n" . '<body class="home">' . "\n" . apex_header( true ) . "\n" . '<main id="top">' . <<<HTML

<section class="hero" id="planner">
  <div class="wrap">
    <div class="hero-head">
      <p class="kicker">{$e( $hero['kicker'] )}</p>
      <h1>{$e( $hero['h1'] )} <em>{$e( $hero['h1_em'] )}</em></h1>
      <p class="sub">{$e( $hero['sub'] )}</p>
    </div>
    <div class="planner" data-panel="map">
      <canvas class="leads" aria-hidden="true"></canvas>
      <div class="zcol l">{$col( 'l' )}</div>
      <div class="mirror"><div class="glass"><div class="head" id="planner-head"></div></div></div>
      <div class="zcol r">{$col( 'r' )}</div>
    </div>
    <div class="hctl">
      <div class="seg" role="group" aria-label="Face"><button type="button" data-sex="female" aria-pressed="true">Women</button><button type="button" data-sex="male" aria-pressed="false">Men</button></div>
      <div class="seg" role="group" aria-label="Filler"><button type="button" data-ba="before" aria-pressed="false">Before</button><button type="button" data-ba="after" aria-pressed="true">After</button></div>
    </div>
    <div class="picks" data-panel="map" aria-live="polite">
      <p class="empty">{$e( $hero['empty'] )}</p>
      <div class="list" hidden><p class="area"></p><ul class="basis"></ul><ul class="txc"></ul></div>
      <button type="button" class="fz fz-skin" data-z="skin">{$e( $hero['whole'] )}</button>
      $refs
    </div>
  </div>
</section>

<section class="sec" id="treatments">
  <div class="wrap">
    <div class="sec-head"><h2>{$h2( $H['treatments'] )}</h2>{$div}
      <p>{$e( $H['treatments']['p'] )}</p></div>
    <div class="menu-card gilt"><div class="menu">$menu</div></div>
    <p class="menu-foot"><a class="btn" href="compare.html">Compare two treatments</a></p>
  </div>
</section>

<section class="sec lav" id="visit">
  <div class="wrap">
    <div class="sec-head"><h2>{$h2( $H['visit'] )}</h2>{$div}</div>
    <ol class="steps">$steps</ol>
    <p class="steps-foot">{$e( $H['visit']['foot'] )}</p>
  </div>
</section>

<section class="sec lav-2" id="results">
  <div class="wrap res gilt">
    <div>
      <div class="ba-stage"><div class="mirror"><div class="glass ba" id="ba" data-set="$RS">
        <img src="{$e( $c1['after'] )}" alt="After {$e( $T[ $RS ]['name'] )}, {$e( mb_strtolower( mb_substr( $labels[1], 6 ) ) )}" class="after">
        <img src="{$e( $c1['before'] )}" alt="Before {$e( $T[ $RS ]['name'] )}" class="before">
        <span class="sheen" aria-hidden="true"></span><span class="line" aria-hidden="true"></span>
        <input class="range" type="range" min="0" max="100" value="50" aria-label="Move the line between before and after">
      </div></div>
      <div class="plaques"><span class="pl-b">{$e( $labels[0] )}</span><span class="pl-a">{$e( $labels[1] )}</span></div></div>
    </div>
    <div>
      <h2>{$h2( $H['results'] )}</h2>
      <p>{$e( $H['results']['p'] )}</p>
      <div class="thumbs" id="thumbs" style="--tc:{$n( count( $cases ) )}">$thumbs</div>
      <dl class="stats">$stats</dl>
      <div class="tools"><button type="button" class="btn" data-ba="play">Play again</button><a class="btn" href="$RS.html">Read about {$e( $T[ $RS ]['name'] )}</a></div>
      <p class="fine">{$e( $H['results']['fine'] )}</p>
    </div>
  </div>
</section>

<section class="sec plum" id="compare">
  <div class="wrap">
    <div class="sec-head"><h2>{$h2( $H['compare'] )}</h2><img class="orn-div" src="assets/img/orn/divider.svg" alt=""></div>
    <form class="pair" action="compare.html">
      <label>First{$pick( 'a', $H['compare']['a'] )}</label><span class="and">&amp;</span><label>Second{$pick( 'b', $H['compare']['b'] )}</label>
      <button class="btn lt" type="submit">Compare</button>
    </form>
  </div>
</section>

<section class="sec lav" id="book">
  <div class="wrap book">
    <div>
      <h2>{$h2( $H['book'] )}</h2>
      <p>{$e( $H['book']['p'] )}</p>
      <ul class="ways"><li><b>LINE</b><a href="{$line}">{$s['line_id']}</a></li><li><b>Phone</b><a href="{$tel}">{$s['phone']}</a></li></ul>
    </div>
    <form class="form gilt" id="book-form">
      <label>Your name<input name="name" autocomplete="name" placeholder="Ploy Srisuk" required></label>
      <label>Phone<input name="phone" type="tel" autocomplete="tel" placeholder="081 234 5678"></label>
      <label>Treatment<select name="treatment">$book_opts</select></label>
      <label>Preferred day<input name="day" type="date"></label>
      <label class="hp" aria-hidden="true">Website<input name="website" tabindex="-1" autocomplete="off"></label>
      <label class="consent"><input type="checkbox" name="consent" required><span>{$e( $H['book']['consent'] )} <a href="privacy.html">{$e( $H['book']['privacy'] )}</a></span></label>
      <button class="btn solid" type="submit"><span class="line-dot"></span>Send on LINE</button>
      <p class="fine">{$e( $H['book']['fine'] )}</p>
    </form>
  </div>
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
function apex_cols( int $n ): int {
	foreach ( [ 4, 3, 5 ] as $c ) if ( $n % $c === 0 ) return min( $c, $n );
	if ( $n <= 2 ) return $n;
	$best = 4; $score = -1;
	foreach ( [ 4, 3, 5 ] as $c ) { $s = ( $n % $c ) / $c; if ( $s > $score ) { $score = $s; $best = $c; } }
	return $best;
}
function apex_render_tx( array $S, string $slug ): string {
	$t = $S['tx'][ $slug ];
	$e = 'apex_e'; $div = apex_divider();
	$facts = ''; foreach ( $t['facts'] as [ $a, $b ] ) $facts .= '<div><dt>' . apex_e( $a ) . '</dt><dd>' . apex_e( $b ) . '</dd></div>';
	$how = ''; foreach ( $t['how'] as $i => [ $k, $h, $p ] ) $how .= '<li class="gilt sm"><span class="n">' . APEX_ROMAN[ $i ] . '</span><p>' . apex_e( $p ) . '</p></li>';
	$alts = ''; foreach ( $t['not_for'] as [ $a, $b, $c, $d ] ) $alts .= '<li><b>' . apex_e( $a ) . '</b><span>' . apex_e( $b ) . '</span>' . ( $c !== '' ? '<a href="' . $c . '">' . apex_e( $d ) . '</a>' : '' ) . '</li>';
	$cards = function ( array $items ) { $o = ''; foreach ( $items as [ $a, $u ] ) $o .= '<li><b>' . apex_e( $a ) . '</b><em>' . apex_e( $u ) . '</em></li>'; return $o; };
	$body_html = $t['body'] ? '<h3 class="grp">Body</h3><ul class="where-grid">' . $cards( $t['body'] ) . '</ul>' : '';
	$face_h = $t['body'] ? '<h3 class="grp">Face</h3>' : '';
	$before = ''; foreach ( $t['care']['before'] as [ $k, $h, $p ] ) $before .= '<li>' . apex_icon( $k ) . '<div><b>' . apex_e( $h ) . '</b><span>' . apex_e( $p ) . '</span></div></li>';
	$after = '';
	foreach ( $t['care']['after'] as [ $w, $items ] ) {
		$after .= '<span class="when">' . apex_e( $w ) . '</span><ul>';
		foreach ( $items as [ $k, $x ] ) $after .= '<li>' . apex_icon( $k ) . '<div><span>' . apex_e( $x ) . '</span></div></li>';
		$after .= '</ul>';
	}
	$urgent = ( $t['care']['urgent'] ?? '' ) !== '' ? '<p class="urgent">' . apex_e( $t['care']['urgent'] ) . '</p>' : '';
	$visit = ''; foreach ( $t['fitting'] as $k => [ $a, $b ] ) $visit .= '<li class="gilt sm"><span class="n">' . APEX_ROMAN[ $k ] . '</span><h3>' . apex_e( $a ) . '</h3><p>' . apex_e( $b ) . '</p></li>';
	$tl = ''; foreach ( $t['timeline'] as [ $a, $b ] ) $tl .= '<li><b>' . apex_e( $a ) . '</b><span>' . apex_e( $b ) . '</span></li>';
	$pr = $t['prices'];
	$rows = '';
	foreach ( $pr['rows'] as $r ) { $rows .= '<tr>'; foreach ( $r as $c ) $rows .= strpos( $c, 'baht' ) !== false ? '<td class="num">' . apex_e( $c ) . '</td>' : '<td>' . apex_e( $c ) . '</td>'; $rows .= '</tr>'; }
	$heads = ''; foreach ( $pr['head'] as $h ) $heads .= '<th>' . apex_e( $h ) . '</th>';
	$table = $pr['rows'] ? '<table class="price-table"><thead><tr>' . $heads . '</tr></thead><tbody>' . $rows . '</tbody></table>' : '';
	$pkgs = ''; foreach ( $pr['invitations'] as [ $a, $b ] ) $pkgs .= '<div class="pkg gilt sm"><p class="kicker">Package</p><h3>' . apex_e( $a ) . '</h3><p class="amt">' . apex_e( $b ) . '</p></div>';
	$faq = ''; foreach ( $t['faq'] as [ $q, $a ] ) $faq .= '<details><summary>' . apex_e( $q ) . '</summary><p>' . apex_e( $a ) . '</p></details>';
	$frm = $t['price_from'] !== '' ? '<p class="from">From ' . apex_e( $t['price_from'] ) . '<small>' . apex_e( $t['price_note'] ) . '</small></p>'
		: '<p class="from"><small>' . apex_e( $t['price_note'] ) . '</small></p>';
	$R = $t['results']; $cases = $S['cases'][ $slug ] ?? []; $results = '';
	if ( $R['mode'] === 'slider' && $cases ) {
		$lb = $R['labels'][0] ?? 'Before'; $la = $R['labels'][1] ?? 'After';
		$n = count( $cases ); $thumbs = '';
		if ( $n > 1 ) foreach ( $cases as $i => $c ) $thumbs .= '<button type="button" data-i="' . ( $i + 1 ) . '" class="' . ( $i === 0 ? 'on' : '' ) . '"><img src="' . apex_e( $c['after'] ) . '" alt="' . apex_e( $c['alt'] ) . '" loading="lazy"></button>';
		$cap = $R['caption'] !== '' ? $R['caption'] : $t['name'] . ' at Apex. Drag the line across the photo to compare.';
		$results = '<section class="sec lav-2" id="results"><div class="wrap res gilt">' . "\n"
			. '  <div class="ba-stage"><div class="mirror"><div class="glass ba" id="ba" data-set="' . $slug . '">' . "\n"
			. '    <img src="' . apex_e( $cases[0]['after'] ) . '" alt="After ' . apex_e( $t['name'] ) . '" class="after">' . "\n"
			. '    <img src="' . apex_e( $cases[0]['before'] ) . '" alt="Before ' . apex_e( $t['name'] ) . '" class="before">' . "\n"
			. '    <span class="sheen" aria-hidden="true"></span><span class="line" aria-hidden="true"></span>' . "\n"
			. '    <input class="range" type="range" min="0" max="100" value="50" aria-label="Move the line between before and after">' . "\n"
			. '  </div></div><div class="plaques"><span class="pl-b">' . apex_e( $lb ) . '</span><span class="pl-a">' . apex_e( $la ) . '</span></div></div>' . "\n"
			. '  <div><h2>Before <em>and after</em></h2>' . "\n"
			. '    <p>' . apex_e( $cap ) . '</p>' . "\n"
			. '    <div class="thumbs" id="thumbs" style="--tc:' . $n . '">' . $thumbs . '</div>' . "\n"
			. '    <div class="tools"><button type="button" class="btn" data-ba="play">Play again</button></div>' . "\n"
			. '    <p class="fine">Individual results vary.</p></div>' . "\n" . '</div></section>';
	} elseif ( $R['mode'] === 'gallery' && $cases ) {
		$imgs = '';
		foreach ( $cases as $c ) $imgs .= '<button type="button" class="gal-item" data-full="' . apex_e( $c['after'] ) . '"><img src="' . apex_e( $c['after'] ) . '" alt="' . apex_e( $c['alt'] ) . '" loading="lazy"></button>';
		$cap = $R['caption'] !== '' ? $R['caption'] : $t['name'] . ' at Apex. Tap a photo to see it large.';
		$results = '<section class="sec" id="results"><div class="wrap">' . "\n"
			. '  <div class="sec-head"><h2>Before <em>and after</em></h2>' . $div . "\n"
			. '  <p>' . apex_e( $cap ) . '</p></div>' . "\n"
			. '  <div class="gallery" style="--cols:' . apex_cols( count( $cases ) ) . '">' . $imgs . '</div><p class="fine center">Individual results vary.</p>' . "\n" . '</div></section>';
	}
	$src = ''; foreach ( $t['sources'] as $x ) $src .= '<li>' . apex_e( $x ) . '</li>';
	$hook = ''; foreach ( $t['hook'] as $x ) $hook .= '<p>' . apex_e( $x ) . '</p>';
	$solo = $pkgs && $table ? '' : ' solo';
	$ntl = count( $t['timeline'] );
	$title = $t['seo_title'] !== '' ? $t['seo_title'] : $t['name'] . ' at Apex | Apex Contour and Glow';
	$desc = $t['seo_desc'] !== '' ? $t['seo_desc'] : ( $t['hook'][0] ?? '' );
	return apex_head( $title, $desc ) . "\n" . '<body class="tx-page">' . "\n" . apex_header() . "\n" . <<<HTML
<main>
<section class="tx-hero"><div class="wrap">
  <div>
    <p class="crumb"><a href="index.html#treatments">Treatments</a> · {$e( $t['half'] )}</p>
    <h1>{$e( $t['name'] )}</h1>
    $hook
  </div>
  <aside class="facts gilt">
    <dl>$facts</dl>
    $frm
    <a class="btn solid" href="index.html#book">Book a consultation</a>
    <a class="cmp" href="compare.html?a=$slug">Compare with another treatment</a>
  </aside>
</div></section>
<section class="sec lav-2"><div class="wrap">
  <div class="sec-head"><h2>How it <em>works</em></h2>$div</div>
  <ol class="how">$how</ol>
  <div class="alt gilt sm"><h3>Not suited for</h3><ul>$alts</ul></div>
</div></section>
<section class="sec where"><div class="wrap">
  <div class="sec-head"><h2>Treatment <em>areas</em></h2>$div</div>
  {$face_h}<ul class="where-grid">{$cards( $t['face'] )}</ul>$body_html
  <p class="note center">{$e( $t['areas_note'] )}</p>
</div></section>
<section class="sec lav"><div class="wrap">
  <div class="sec-head"><h2>Your <em>visit</em></h2>$div</div>
  <ol class="visit">$visit</ol>
</div></section>
<section class="sec"><div class="wrap">
  <div class="sec-head"><h2>When you <em>see results</em></h2>$div</div>
  <ol class="tl" style="--n:$ntl">$tl</ol>
</div></section>
$results
<section class="sec lav-2" id="prices"><div class="wrap">
  <div class="sec-head"><h2>{$e( $t['name'] )} <em>prices</em></h2>$div</div>
  <div class="price-wrap$solo">$table<div class="pkgs">$pkgs</div></div>
  <p class="note center">{$e( $pr['note'] )}</p>
</div></section>
<section class="sec lav"><div class="wrap">
  <div class="sec-head"><h2>Before and after <em>your visit</em></h2>$div</div>
  <div class="care"><div class="gilt sm"><h3>Before you come</h3><ul>$before</ul></div><div class="gilt sm"><h3>After you leave</h3>$after$urgent</div></div>
</div></section>
<section class="sec"><div class="wrap">
  <div class="sec-head"><h2>Questions</h2>$div</div>
  <div class="faq-list">$faq</div>
  <p class="center cta"><a class="btn solid" href="index.html#book">Book a consultation</a></p>
</div></section>
<section class="sources"><div class="wrap"><h3>Sources</h3><ol>$src</ol></div></section>
</main>
HTML
	. "\n" . apex_footer( $S ) . "\n" . apex_scripts( $S ) . "\n" . apex_tail( $S );
}

/* ---------- compare: tools/build_compare.py ---------- */
function apex_render_compare( array $S ): string {
	$T = $S['tx']; $e = 'apex_e'; $div = apex_divider();
	$data = [];
	foreach ( $S['order'] as $k ) $data[ $k ] = [ 'name' => $T[ $k ]['name'], 'half' => $T[ $k ]['half'] ] + $T[ $k ]['summary'];
	$pick = function ( string $name, string $sel ) use ( $S, $T ) {
		$o = '<select name="' . $name . '" id="pick-' . $name . '">';
		foreach ( $S['order'] as $k ) $o .= '<option value="' . $k . '"' . ( $k === $sel ? ' selected' : '' ) . '>' . apex_e( $T[ $k ]['name'] ) . '</option>';
		return $o . '</select>';
	};
	$rows = ''; foreach ( $S['compare']['rows'] as [ $key, $lab ] ) $rows .= '<tr><th scope="row">' . apex_e( $lab ) . '</th><td data-s="a" data-f="' . $key . '"></td><td data-s="b" data-f="' . $key . '"></td></tr>';
	$chips = ''; $P = [];
	foreach ( $S['compare']['pairs'] as $p ) {
		if ( ! isset( $T[ $p['a'] ], $T[ $p['b'] ] ) ) continue;
		$chips .= '<a href="compare.html?a=' . $p['a'] . '&amp;b=' . $p['b'] . '">' . apex_e( $T[ $p['a'] ]['name'] ) . ' and ' . apex_e( $T[ $p['b'] ]['name'] ) . '</a>';
		$P[ $p['a'] . '|' . $p['b'] ] = $p['note'];
	}
	$A = $S['home']['compare']['a'] ?: 'botox'; $B = $S['home']['compare']['b'] ?: 'filler';
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
		. "\n" . '<body class="cmp-page">' . "\n" . apex_header() . "\n" . <<<HTML
<main>
<section class="cmp-screen"><div class="wrap cmp-grid">
  <div class="cmp-side">
    <h1>Compare <em>two treatments</em></h1>$div
    <form class="pair stack" action="compare.html" id="pair">
      <label>First{$pick( 'a', $A )}</label><span class="and">&amp;</span><label>Second{$pick( 'b', $B )}</label>
    </form>
    <p class="kicker">Often compared</p>
    <div class="pchips">$chips</div>
    <a class="btn solid" href="index.html#book">Book a consultation</a>
  </div>
  <div class="gilt cmp-card">
  <table class="cmp-table">
    <thead><tr><th></th><th><span class="half" data-s="a" data-f="half"></span><span data-s="a" data-f="name"></span></th><th><span class="half" data-s="b" data-f="half"></span><span data-s="b" data-f="name"></span></th></tr></thead>
    <tbody>$rows<tr class="go"><th scope="row"></th><td><a class="btn" data-s="a" data-f="link"></a></td><td><a class="btn" data-s="b" data-f="link"></a></td></tr></tbody>
  </table>
  <p class="cmp-note" id="pair-note" hidden></p>
  <p class="note center">Starting prices. Promotions change, so check the latest on LINE $line.</p>
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
	return apex_head( $P['seo_title'], $P['seo_desc'] ) . "\n" . '<body class="legal-page">' . "\n" . apex_header() . "\n" . '<main>' . "\n"
		. '<section class="sec legal"><div class="wrap">' . "\n"
		. '  <div class="sec-head"><h1>' . apex_e( $P['h1'] ) . '</h1>' . apex_divider() . '</div>' . "\n"
		. '  <div class="legal-body gilt">' . "\n" . implode( "\n", $body ) . "\n" . '  </div>' . "\n" . '</div></section>' . "\n" . '</main>'
		. "\n" . apex_footer( $S ) . "\n" . apex_scripts( $S ) . "\n" . apex_tail( $S );
}
