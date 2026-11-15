<?php
/**
 * wp apex import   load import/content-<lang>.json (written by wordpress/tools/export_content.py) into WordPress
 * wp apex export   write what WordPress holds now back out in the same format, to wp-content/apex-export/
 * wp apex check    compare WordPress with the packaged content and list every difference
 *
 * Import finds each item by its key and language and updates it in place, so it can be run again at any time.
 * It writes over anything an editor changed in those items, which is why a package that changes content
 * says so in the Versions table of HANDOVER.md.
 */
defined( 'ABSPATH' ) || exit;

class Apex_CLI {
	private function pack( string $lang ): ?array {
		$f = APEX_DIR . "/import/content-$lang.json";
		if ( ! is_readable( $f ) ) return null;
		$d = json_decode( (string) file_get_contents( $f ), true );
		if ( ! is_array( $d ) ) WP_CLI::error( "$f is not valid JSON" );
		return $d;
	}

	/** The packaged content as the design object WordPress should hold, after the same cleaning a save does. */
	private function expected( array $d ): array {
		$S = [];
		$opt = [ 'settings' => $d['settings'], 'home' => $d['home'], 'compare' => $d['compare'],
			'planner' => [ 'zones' => array_map( fn( $z ) => [ 'key' => $z['key'], 'label' => $z['label'] ], $d['planner']['zones'] ) ] ];
		foreach ( $opt as $name => $vals ) {
			$S[ $name ] = [];
			foreach ( apex_schema( $name ) as $f ) $S[ $name ][ $f['k'] ] = apex_to_design( $f, apex_norm( $f, apex_from_design( $f, $vals[ $f['k'] ] ?? null ) ) );
		}
		foreach ( $d['treatments'] as $t ) {
			$o = [];
			foreach ( apex_schema( 'apex_tx' ) as $f ) {
				$src = $f['src'] ?? '';
				$v = $t[ $f['k'] ] ?? null;
				$o[ $f['k'] ] = $src === 'title' ? (string) $v : ( $src === 'order' ? (int) $v : apex_to_design( $f, apex_norm( $f, apex_from_design( $f, $v ) ) ) );
			}
			$S['tx'][ $t['key'] ] = $o;
		}
		return $S;
	}

	/** Before and after cases for a treatment, from the design's numbered photo files. */
	private function cases_of( array $t ): array {
		$R = $t['results'] ?? null;
		if ( ! $R ) return [];
		$out = [];
		for ( $i = 1; $i <= (int) $R['n']; $i++ ) {
			$out[] = $R['mode'] === 'slider'
				? [ 'title' => "{$t['name']} case $i", 'tx' => $t['key'], 'order' => $i, 'before' => "assets/img/{$R['set']}-$i-before.webp", 'after' => "assets/img/{$R['set']}-$i-after.webp", 'alt' => "{$t['name']} case $i" ]
				: [ 'title' => "{$t['name']} result $i", 'tx' => $t['key'], 'order' => $i, 'before' => '', 'after' => "assets/img/{$R['set']}-g$i.webp", 'alt' => "{$t['name']} result $i" ];
		}
		return $out;
	}

	private function find( string $type, string $key, string $lang ): int {
		$ids = get_posts( [ 'post_type' => $type, 'post_status' => 'any', 'posts_per_page' => -1, 'meta_key' => '_apex_key', 'meta_value' => $key, 'lang' => '', 'suppress_filters' => true, 'fields' => 'ids' ] );
		foreach ( $ids as $id ) if ( apex_post_lang( $id ) === $lang ) return (int) $id;
		return 0;
	}
	private function upsert( string $type, string $key, string $lang, string $title, string $slug = '' ): int {
		$id = $this->find( $type, $key, $lang );
		$arr = [ 'post_type' => $type, 'post_status' => 'publish', 'post_title' => $title ];
		if ( $slug !== '' ) $arr['post_name'] = $slug;
		if ( $id ) { $arr['ID'] = $id; wp_update_post( wp_slash( $arr ) ); }
		else $id = (int) wp_insert_post( wp_slash( $arr ) );
		if ( function_exists( 'pll_set_post_language' ) ) pll_set_post_language( $id, $lang );
		update_post_meta( $id, '_apex_key', $key );
		return $id;
	}
	/** The pages the theme draws by key: compare and privacy. */
	private function page( string $key, string $lang, string $title ): int {
		$id = apex_page_id( $key, $lang );
		if ( ! $id ) {
			$id = (int) wp_insert_post( [ 'post_type' => 'page', 'post_status' => 'publish', 'post_title' => $title, 'post_name' => $key ] );
			update_post_meta( $id, '_apex_page', $key );
			if ( function_exists( 'pll_set_post_language' ) ) pll_set_post_language( $id, $lang );
		}
		return $id;
	}

	/**
	 * Load the packaged content.
	 *
	 * ## OPTIONS
	 * [--lang=<lang>]
	 * : Only this language (en or th). Default: every language with a content file.
	 */
	public function import( $args, $assoc ) {
		$langs = isset( $assoc['lang'] ) ? [ $assoc['lang'] ] : APEX_LANGS;
		$done = 0;
		foreach ( $langs as $lang ) {
			$d = $this->pack( $lang );
			if ( ! $d ) { WP_CLI::log( "No content-$lang.json, skipped $lang" ); continue; }
			apex_with_lang( $lang, function () use ( $d, $lang, &$done ) {
				foreach ( [ 'settings', 'home', 'compare' ] as $o ) apex_write_opt( $o, $lang, $d[ $o ], true );
				apex_write_opt( 'planner', $lang, [ 'zones' => array_map( fn( $z ) => [ 'key' => $z['key'], 'label' => $z['label'] ], $d['planner']['zones'] ) ], true );
				$keep = [];
				foreach ( $d['treatments'] as $t ) {
					$id = $this->upsert( 'apex_tx', $t['key'], $lang, $t['name'], $t['key'] );
					apex_write_post( $id, 'apex_tx', $t );
					$keep[] = $id; $done++;
					foreach ( $this->cases_of( $t ) as $c ) {
						$cid = $this->upsert( 'apex_case', "{$t['key']}-{$c['order']}", $lang, $c['title'] );
						apex_write_post( $cid, 'apex_case', $c );
					}
				}
				$this->page( 'compare', $lang, $lang === 'th' ? 'เปรียบเทียบ' : 'Compare' );
				$this->page( 'privacy', $lang, $lang === 'th' ? 'นโยบายความเป็นส่วนตัว' : 'Privacy policy' );
				if ( $lang === apex_default_lang() ) { update_option( 'show_on_front', 'posts' ); update_option( 'blogname', $d['settings']['brand'] ?? 'Apex Contour and Glow' ); }
			} );
			WP_CLI::log( "Imported $lang: " . count( $d['treatments'] ) . ' treatments' );
		}
		// link each treatment to its other-language copy
		if ( function_exists( 'pll_save_post_translations' ) ) {
			$en = $this->pack( 'en' );
			foreach ( $en['treatments'] ?? [] as $t ) {
				$tr = [];
				foreach ( APEX_LANGS as $l ) if ( $id = $this->find( 'apex_tx', $t['key'], $l ) ) $tr[ $l ] = $id;
				if ( count( $tr ) > 1 ) pll_save_post_translations( $tr );
			}
			foreach ( [ 'compare', 'privacy' ] as $k ) {
				$tr = [];
				foreach ( APEX_LANGS as $l ) if ( $id = apex_page_id( $k, $l ) ) $tr[ $l ] = $id;
				if ( count( $tr ) > 1 ) pll_save_post_translations( $tr );
			}
		}
		apex_data_bump();
		flush_rewrite_rules( false );
		WP_CLI::success( "Imported $done treatments" );
	}

	/** Write the content WordPress holds now to wp-content/apex-export/content-<lang>.json. */
	public function export( $args, $assoc ) {
		$dir = WP_CONTENT_DIR . '/apex-export';
		wp_mkdir_p( $dir );
		foreach ( APEX_LANGS as $lang ) {
			$S = apex_build_site( $lang );
			if ( ! $S['tx'] ) continue;
			$out = [ 'format' => 1, 'lang' => $lang, 'settings' => $S['settings'], 'home' => $S['home'], 'treatments' => array_values( $S['tx'] ), 'compare' => $S['compare'], 'planner' => $S['planner'], 'cases' => $S['cases'] ];
			file_put_contents( "$dir/content-$lang.json", wp_json_encode( $out, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES ) );
			WP_CLI::log( "Wrote $dir/content-$lang.json" );
		}
		WP_CLI::success( 'Exported' );
	}

	/** Compare WordPress with the packaged content. */
	public function check( $args, $assoc ) {
		$diffs = []; $n = 0;
		foreach ( APEX_LANGS as $lang ) {
			$d = $this->pack( $lang );
			if ( ! $d ) continue;
			$want = $this->expected( $d );
			$have = apex_with_lang( $lang, fn() => apex_build_site( $lang ) );
			foreach ( [ 'settings', 'home', 'compare', 'planner' ] as $o ) { $n++; if ( $want[ $o ] != $have[ $o ] ) $diffs[] = "$lang $o: " . $this->first_diff( $want[ $o ], $have[ $o ] ); }
			foreach ( $want['tx'] as $k => $t ) {
				$n++;
				if ( ! isset( $have['tx'][ $k ] ) ) { $diffs[] = "$lang treatment $k: missing"; continue; }
				if ( $t != $have['tx'][ $k ] ) $diffs[] = "$lang treatment $k: " . $this->first_diff( $t, $have['tx'][ $k ] );
				$cases = $this->cases_of( $d['treatments'][ array_search( $k, array_column( $d['treatments'], 'key' ) ) ] );
				$n++;
				if ( count( $cases ) !== count( $have['cases'][ $k ] ?? [] ) ) $diffs[] = "$lang treatment $k: " . count( $have['cases'][ $k ] ?? [] ) . ' cases, the package has ' . count( $cases );
			}
		}
		foreach ( $diffs as $x ) WP_CLI::log( $x );
		if ( $diffs ) WP_CLI::error( count( $diffs ) . " of $n content objects differ from the package" );
		WP_CLI::success( "All $n content objects match the package" );
	}
	private function first_diff( $a, $b, string $path = '' ): string {
		if ( is_array( $a ) && is_array( $b ) ) {
			foreach ( array_unique( array_merge( array_keys( $a ), array_keys( $b ) ) ) as $k ) {
				if ( ( $a[ $k ] ?? null ) != ( $b[ $k ] ?? null ) ) return $this->first_diff( $a[ $k ] ?? null, $b[ $k ] ?? null, "$path.$k" );
			}
		}
		return ltrim( $path, '.' ) . ' is ' . wp_json_encode( $b, JSON_UNESCAPED_UNICODE ) . ', the package has ' . wp_json_encode( $a, JSON_UNESCAPED_UNICODE );
	}
}
WP_CLI::add_command( 'apex', 'Apex_CLI' );
