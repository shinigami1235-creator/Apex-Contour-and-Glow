<?php
/**
 * The admin forms, built from inc/schema.php: a "Details" box on every treatment and before and after case,
 * and Apex settings (site settings, home page, Compare, face planner, doctors and branches, privacy policy), each in English and Thai.
 */
defined( 'ABSPATH' ) || exit;

function apex_schema_for( WP_Post $p ): string {
	return in_array( $p->post_type, [ 'apex_tx', 'apex_case' ], true ) ? $p->post_type : '';
}
/** A select whose choices are the treatments ('o' => 'treatments') gets them here, in the form's language. */
function apex_options( array $f, string $lang ): array {
	if ( ( $f['o'] ?? null ) !== 'treatments' ) return $f['o'] ?? [];
	$o = [ '' => '—' ];
	$S = apex_build_site( $lang );
	foreach ( $S['order'] as $k ) $o[ $k ] = $S['tx'][ $k ]['name'];
	if ( count( $o ) === 1 && $lang !== apex_default_lang() ) return apex_options( $f, apex_default_lang() );
	return $o;
}

/* treatments and cases have no body text: their content is the form */
add_filter( 'use_block_editor_for_post_type', fn( $use, $type ) => in_array( $type, [ 'apex_tx', 'apex_case' ], true ) ? false : $use, 10, 2 );

add_action( 'add_meta_boxes', function ( $type, $post ) {
	if ( ! $post instanceof WP_Post || ! apex_schema_for( $post ) ) return;
	add_meta_box( 'apex-fields', __( 'Details', 'apex' ), 'apex_fields_box', null, 'normal', 'high', [ 'schema' => apex_schema_for( $post ) ] );
}, 10, 2 );

function apex_fields_box( WP_Post $post, array $box ): void {
	$schema = $box['args']['schema'];
	$lang = apex_post_lang( $post->ID );
	$stored = [];
	foreach ( apex_schema( $schema ) as $f ) if ( empty( $f['src'] ) ) $stored[ $f['k'] ] = apex_norm( $f, get_post_meta( $post->ID, apex_meta_key( $f['k'] ), true ) );
	wp_nonce_field( 'apex_fields_' . $post->ID, 'apex_fields_nonce' );
	echo '<div class="apex-fields" data-lang="' . esc_attr( $lang ) . '">';
	if ( $schema === 'apex_tx' ) echo '<p class="apex-note">' . esc_html__( 'Every part of this treatment\'s page. The layout is fixed; the name is the title above, and the order on the site is under Page attributes.', 'apex' ) . '</p>';
	foreach ( apex_schema( $schema ) as $f ) {
		if ( ! empty( $f['src'] ) ) continue;
		apex_field_html( $f, $stored[ $f['k'] ] ?? null, 'apex[' . $f['k'] . ']', $lang );
	}
	echo '</div>';
}

/* ---------- one field ---------- */
function apex_field_html( array $f, $v, string $name, string $lang ): void {
	$id = 'apx-' . substr( md5( $name ), 0, 10 );
	$help = ! empty( $f['h'] ) ? '<p class="description">' . esc_html( $f['h'] ) . '</p>' : '';
	$label = '<label for="' . $id . '">' . esc_html( $f['l'] ) . '</label>';
	$t = $f['t'];
	$ro = ! empty( $f['keep'] ) && (string) $v !== '' ? ' readonly' : '';
	echo '<div class="apex-field apex-t-' . esc_attr( $t ) . '">';
	switch ( $t ) {
		case 'text': case 'url':
			echo $label . '<input type="text" class="widefat" id="' . $id . '" name="' . esc_attr( $name ) . '" value="' . esc_attr( (string) $v ) . '"' . $ro . ( $t === 'url' ? ' inputmode="url" spellcheck="false"' : '' ) . '>' . $help;
			break;
		case 'number':
			echo $label . '<input type="number" step="any" class="small-text" id="' . $id . '" name="' . esc_attr( $name ) . '" value="' . esc_attr( $v === null ? '' : (string) $v ) . '">' . $help;
			break;
		case 'textarea':
			echo $label . '<textarea class="widefat" rows="3" id="' . $id . '" name="' . esc_attr( $name ) . '">' . esc_textarea( (string) $v ) . '</textarea>' . $help;
			break;
		case 'lines':
			echo $label . '<textarea class="widefat" rows="' . max( 3, min( 14, count( (array) $v ) + 1 ) ) . '" id="' . $id . '" name="' . esc_attr( $name ) . '">' . esc_textarea( implode( "\n", (array) $v ) ) . '</textarea>' . $help;
			break;
		case 'image':
			$src = apex_img( (string) $v );
			echo $label . '<div class="apex-image"><span class="apex-thumb">' . ( $src ? '<img src="' . esc_url( $src ) . '" alt="">' : '' ) . '</span><input type="text" class="widefat" id="' . $id . '" name="' . esc_attr( $name ) . '" value="' . esc_attr( (string) $v ) . '" spellcheck="false"><button type="button" class="button apex-media" data-for="' . $id . '">' . esc_html__( 'Choose', 'apex' ) . '</button></div>' . $help;
			break;
		case 'select':
			$o = apex_options( $f, $lang );
			echo $label . '<select id="' . $id . '" name="' . esc_attr( $name ) . '">';
			if ( (string) $v !== '' && ! array_key_exists( (string) $v, $o ) ) echo '<option value="' . esc_attr( (string) $v ) . '" selected>' . esc_html( (string) $v ) . '</option>';
			foreach ( $o as $k => $x ) echo '<option value="' . esc_attr( $k ) . '"' . selected( (string) $v, (string) $k, false ) . '>' . esc_html( $x ) . '</option>';
			echo '</select>' . $help;
			break;
		case 'group':
			echo '<fieldset class="apex-group"><legend>' . esc_html( $f['l'] ) . '</legend>' . $help;
			foreach ( $f['f'] as $sf ) apex_field_html( $sf, is_array( $v ) ? ( $v[ $sf['k'] ] ?? null ) : null, $name . '[' . $sf['k'] . ']', $lang );
			echo '</fieldset>';
			break;
		case 'repeater':
			$rows = is_array( $v ) ? array_values( $v ) : [];
			$fixed = ! empty( $f['fixed'] ) ? ' apex-fixed' : '';
			echo '<fieldset class="apex-group apex-repeater' . $fixed . '" data-name="' . esc_attr( $name ) . '" data-tpl="' . esc_attr( $name ) . '"><legend>' . esc_html( $f['l'] ) . '</legend>' . $help . '<ol class="apex-rows">';
			foreach ( $rows as $i => $row ) apex_row_html( $f, $row, $name . '[' . $i . ']', $lang );
			echo '</ol><template class="apex-row-tpl">';
			apex_row_html( $f, [], $name . '[__i__]', $lang );
			echo '</template><p><button type="button" class="button apex-add">' . esc_html__( 'Add', 'apex' ) . '</button></p></fieldset>';
			break;
	}
	echo '</div>';
}
function apex_row_html( array $f, $row, string $name, string $lang ): void {
	echo '<li class="apex-row"><div class="apex-row-tools"><button type="button" class="button-link apex-up" aria-label="' . esc_attr__( 'Move up', 'apex' ) . '">↑</button><button type="button" class="button-link apex-down" aria-label="' . esc_attr__( 'Move down', 'apex' ) . '">↓</button><button type="button" class="button-link apex-del">' . esc_html__( 'Remove', 'apex' ) . '</button></div>';
	foreach ( $f['f'] as $sf ) apex_field_html( $sf, is_array( $row ) ? ( $row[ $sf['k'] ] ?? null ) : null, $name . '[' . $sf['k'] . ']', $lang );
	echo '</li>';
}

/* ---------- cleaning what the form sends; the result is in the stored shape ---------- */
function apex_clean_link( string $s ): string {
	$s = trim( $s );
	if ( $s === '' ) return '';
	if ( str_starts_with( $s, '~/' ) ) return '~/' . ltrim( preg_replace( '#[^\w\-./%~]#u', '', substr( $s, 2 ) ), '/' );
	if ( str_starts_with( $s, 'assets/' ) ) return preg_replace( '#[^\w\-./]#', '', $s );   // a file that ships with the theme
	return esc_url_raw( $s, [ 'http', 'https', 'tel', 'mailto' ] );
}
/** Plain text with tags removed, where a "<" or "&" the editor typed stays the character itself. */
function apex_plain( string $v, bool $multi = false ): string {
	$v = $multi ? sanitize_textarea_field( $v ) : sanitize_text_field( $v );
	return html_entity_decode( $v, ENT_QUOTES | ENT_HTML5, 'UTF-8' );
}
function apex_clean( array $f, $v, string $lang ) {
	switch ( $f['t'] ) {
		case 'text': return apex_plain( (string) $v );
		case 'textarea': return str_replace( [ "\r\n", "\r" ], "\n", apex_plain( (string) $v, true ) );
		case 'url': return apex_clean_link( (string) $v );
		case 'image': return apex_img_store( apex_clean_link( (string) $v ) );
		case 'number': $v = trim( (string) $v ); return is_numeric( $v ) ? $v + 0 : '';
		case 'select': return array_key_exists( (string) $v, apex_options( $f, $lang ) ) ? (string) $v : '';
		case 'lines': return array_values( array_filter( array_map( 'apex_plain', preg_split( '/\r\n|\r|\n/', (string) $v ) ), 'strlen' ) );
		case 'group':
			$o = [];
			foreach ( $f['f'] as $sf ) $o[ $sf['k'] ] = apex_clean( $sf, is_array( $v ) ? ( $v[ $sf['k'] ] ?? '' ) : '', $lang );
			return $o;
		case 'repeater':
			$rows = [];
			foreach ( is_array( $v ) ? $v : [] as $k => $row ) {
				if ( $k === '__i__' || ! is_array( $row ) ) continue;
				$r = apex_clean( [ 't' => 'group', 'f' => $f['f'] ], $row, $lang );
				if ( array_filter( $r, fn( $x ) => $x !== '' && $x !== [] ) ) $rows[] = $r;
			}
			return $rows;
	}
	return '';
}

add_action( 'save_post', function ( $id, $post ) {
	if ( ! isset( $_POST['apex_fields_nonce'] ) || ! wp_verify_nonce( sanitize_key( $_POST['apex_fields_nonce'] ), 'apex_fields_' . $id ) ) return;
	if ( wp_is_post_autosave( $id ) || wp_is_post_revision( $id ) || ! current_user_can( 'edit_post', $id ) ) return;
	$schema = apex_schema_for( $post );
	if ( ! $schema ) return;
	$lang = apex_post_lang( $id );
	$in = isset( $_POST['apex'] ) && is_array( $_POST['apex'] ) ? wp_unslash( $_POST['apex'] ) : [];
	foreach ( apex_schema( $schema ) as $f ) {
		if ( ! empty( $f['src'] ) ) continue;
		if ( ! array_key_exists( $f['k'], $in ) && $f['t'] !== 'repeater' ) continue;
		$v = apex_clean( $f, $in[ $f['k'] ] ?? [], $lang );
		if ( $f['k'] === 'key' ) {
			$v = sanitize_title( (string) $v );
			if ( $v === '' ) continue;   // a key is never cleared from the form
		}
		apex_store_meta( $id, $f, apex_norm( $f, $v ) );
	}
	apex_data_bump();
}, 20, 2 );

/* ---------- Apex settings: one page per option, in English and Thai ---------- */
function apex_settings_pages(): array {
	return [
		'settings' => [ __( 'Site settings', 'apex' ), __( 'The site name, LINE, phone and footer on every page.', 'apex' ) ],
		'home'     => [ __( 'Home page', 'apex' ), __( 'The headings and text of each part of the home page. The treatments, prices and photos come from Treatments and Before and after.', 'apex' ) ],
		'compare'  => [ __( 'Compare', 'apex' ), __( 'The row names of the comparison table and the pairs shown under Often compared. Each treatment\'s values are in its Summary.', 'apex' ) ],
		'clinic'   => [ __( 'Doctors and branches', 'apex' ), __( 'The doctor cards on the home page and treatment pages, and the branches in the branch finder and the booking form.', 'apex' ) ],
		'privacy'  => [ __( 'Privacy policy', 'apex' ), __( 'The privacy policy page. Apex\'s DPO should approve any change.', 'apex' ) ],
		'planner'  => [ __( 'Face planner', 'apex' ), __( 'The names on the area buttons beside the 3D face. Which treatments show for an area comes from each treatment\'s Face areas.', 'apex' ) ],
	];
}
add_action( 'admin_menu', function () {
	$first = true;
	foreach ( apex_settings_pages() as $k => [ $title ] ) {
		$slug = 'apex-' . $k;
		$cb = fn() => apex_settings_page( $k );
		if ( $first ) { add_menu_page( __( 'Apex settings', 'apex' ), __( 'Apex settings', 'apex' ), 'edit_pages', $slug, $cb, 'dashicons-admin-site-alt3', 2 ); $first = false; }
		add_submenu_page( 'apex-settings', $title, $title, 'edit_pages', $slug, $cb );
	}
} );
function apex_lang_tabs( string $page, string $cur ): string {
	$o = '<nav class="nav-tab-wrapper">';
	foreach ( [ 'en' => 'English', 'th' => 'ไทย' ] as $l => $x ) $o .= '<a class="nav-tab' . ( $l === $cur ? ' nav-tab-active' : '' ) . '" href="' . esc_url( admin_url( 'admin.php?page=' . $page . '&lang=' . $l ) ) . '">' . esc_html( $x ) . '</a>';
	return $o . '</nav>';
}
function apex_admin_lang(): string {
	$l = isset( $_GET['lang'] ) ? sanitize_key( $_GET['lang'] ) : 'en';
	return in_array( $l, APEX_LANGS, true ) ? $l : 'en';
}
function apex_settings_page( string $name ): void {
	if ( ! current_user_can( 'edit_pages' ) ) return;
	$lang = apex_admin_lang();
	[ $title, $intro ] = apex_settings_pages()[ $name ];
	if ( isset( $_POST['apex_settings_nonce'] ) && wp_verify_nonce( sanitize_key( $_POST['apex_settings_nonce'] ), "apex_{$name}_{$lang}" ) ) {
		$in = isset( $_POST['apex'] ) && is_array( $_POST['apex'] ) ? wp_unslash( $_POST['apex'] ) : [];
		$vals = [];
		foreach ( apex_schema( $name ) as $f ) $vals[ $f['k'] ] = apex_clean( $f, $in[ $f['k'] ] ?? ( $f['t'] === 'repeater' ? [] : '' ), $lang );
		apex_write_opt( $name, $lang, $vals );
		if ( function_exists( 'apex_audit' ) ) apex_audit( 'settings', 0, "$title ($lang)" );
		echo '<div class="notice notice-success is-dismissible"><p>' . esc_html__( 'Saved.', 'apex' ) . '</p></div>';
	}
	$v = get_option( "apex_{$name}_{$lang}" );
	$v = is_array( $v ) ? $v : [];
	echo '<div class="wrap apex-settings"><h1>' . esc_html( $title ) . '</h1><p>' . esc_html( $intro ) . '</p>' . apex_lang_tabs( 'apex-' . $name, $lang );
	echo '<form method="post" class="apex-fields">';
	wp_nonce_field( "apex_{$name}_{$lang}", 'apex_settings_nonce' );
	foreach ( apex_schema( $name ) as $f ) apex_field_html( $f, apex_norm( $f, $v[ $f['k'] ] ?? null ), 'apex[' . $f['k'] . ']', $lang );
	submit_button();
	echo '</form></div>';
}

add_action( 'admin_enqueue_scripts', function ( $hook ) {
	if ( ! in_array( $hook, [ 'post.php', 'post-new.php' ], true ) && ! str_contains( (string) $hook, 'apex-' ) ) return;
	wp_enqueue_media();
	wp_enqueue_style( 'apex-admin', APEX_URI . '/admin/admin.css', [], APEX_VERSION );
	wp_enqueue_script( 'apex-admin', APEX_URI . '/admin/admin.js', [ 'jquery' ], APEX_VERSION, true );
	wp_localize_script( 'apex-admin', 'APEX_ADMIN', [ 'media' => trailingslashit( get_option( 'home' ) ), 'home' => trailingslashit( home_url() ), 'choose' => __( 'Use this', 'apex' ) ] );
} );
