<?php
/**
 * The booking form.
 *
 * POST /wp-json/apex/v1/book   name, phone, treatment, branch, preferred day and consent. Saved as a private Enquiry,
 *                              and the team is emailed a link to it (never the person's details). The page then
 *                              opens LINE with the same message, as the static site does.
 * Enquiries › Settings         who gets the emails and how long enquiries are kept.
 */
defined( 'ABSPATH' ) || exit;

function apex_forms_opt( string $k, $def = '' ) {
	$o = get_option( 'apex_forms' );
	return is_array( $o ) && isset( $o[ $k ] ) && $o[ $k ] !== '' ? $o[ $k ] : $def;
}
/** The visitor's address. Behind Cloudflare or a load balancer every request comes from the proxy, so
 *  wp-config.php can name the header that carries the real one: define( 'APEX_IP_HEADER', 'HTTP_CF_CONNECTING_IP' ).
 *  Only set it when the server cannot be reached except through that proxy, or anyone could send the header. */
function apex_client_ip(): string {
	if ( defined( 'APEX_IP_HEADER' ) && ! empty( $_SERVER[ APEX_IP_HEADER ] ) ) {
		$ip = trim( explode( ',', (string) $_SERVER[ APEX_IP_HEADER ] )[0] );
		if ( filter_var( $ip, FILTER_VALIDATE_IP ) ) return $ip;
	}
	return (string) ( $_SERVER['REMOTE_ADDR'] ?? '' );
}
/** A one-way fingerprint of the visitor's address for the rate limit and the consent record. */
function apex_ip_hash(): string { return substr( hash_hmac( 'sha256', apex_client_ip(), wp_salt( 'nonce' ) ), 0, 16 ); }
function apex_str( $v ): string { return is_scalar( $v ) ? (string) $v : ''; }
function apex_rate_ok( string $what, int $max, int $window ): bool {
	$k = 'apex_rl_' . $what . '_' . apex_ip_hash();
	$n = (int) get_transient( $k );
	if ( $n >= $max ) return false;
	set_transient( $k, $n + 1, $window );
	return true;
}

add_action( 'rest_api_init', function () {
	register_rest_route( 'apex/v1', '/book', [ 'methods' => 'POST', 'callback' => 'apex_book_submit', 'permission_callback' => '__return_true' ] );
} );

function apex_book_submit( WP_REST_Request $req ) {
	$f = $req->get_json_params();
	if ( ! is_array( $f ) ) return new WP_Error( 'apex_bad', 'Bad request', [ 'status' => 400 ] );
	// a field people cannot see: anything typed into it came from a bot
	if ( trim( apex_str( $f['website'] ?? '' ) ) !== '' ) return [ 'ok' => true ];
	if ( ! apex_rate_ok( 'book', 6, HOUR_IN_SECONDS ) ) return new WP_Error( 'apex_rate', 'Too many requests from this connection. Please send your details on LINE.', [ 'status' => 429 ] );
	$s = fn( $k, $n = 200 ) => mb_substr( sanitize_text_field( apex_str( $f[ $k ] ?? '' ) ), 0, $n );
	$names = array_map( fn( $t ) => $t['name'], apex_site( apex_default_lang() )['tx'] );
	$branches = array_column( apex_site( apex_default_lang() )['clinic']['branches'] ?? [], 0 );
	$v = [
		'name' => $s( 'name', 100 ),
		'phone' => $s( 'phone', 40 ),
		'treatment' => in_array( $s( 'treatment', 80 ), $names, true ) ? $s( 'treatment', 80 ) : 'Not sure yet',
		'branch' => in_array( $s( 'branch', 120 ), $branches, true ) ? $s( 'branch', 120 ) : '',
		'day' => preg_match( '/^\d{4}-\d{2}-\d{2}$/', apex_str( $f['day'] ?? '' ) ) ? $f['day'] : '',
		'lang' => ( $f['lang'] ?? '' ) === 'th' ? 'th' : 'en',
	];
	$missing = [];
	if ( mb_strlen( $v['name'] ) < 2 ) $missing[] = 'name';
	if ( empty( $f['consent'] ) ) $missing[] = 'consent';
	if ( $missing ) return new WP_Error( 'apex_fields', 'Missing: ' . implode( ', ', $missing ), [ 'status' => 422, 'fields' => $missing ] );

	$id = wp_insert_post( [ 'post_type' => 'apex_lead', 'post_status' => 'private', 'post_title' => 'Enquiry' ], true );
	if ( is_wp_error( $id ) ) return new WP_Error( 'apex_save', 'Could not save the request', [ 'status' => 500 ] );
	wp_update_post( [ 'ID' => $id, 'post_title' => 'Enquiry C' . $id ] );
	update_post_meta( $id, 'apex_fields', wp_slash( $v ) );
	update_post_meta( $id, 'apex_status', 'new' );
	update_post_meta( $id, 'apex_consent', [ 'at' => gmdate( 'c' ), 'text' => apex_site( $v['lang'] )['home']['book']['consent'] ?? 'consent box ticked', 'ip' => apex_ip_hash(), 'page' => esc_url_raw( (string) $req->get_header( 'referer' ) ) ] );

	$to = array_filter( array_map( 'trim', explode( ',', (string) apex_forms_opt( 'recipients', get_option( 'admin_email' ) ) ) ), 'is_email' );
	if ( $to ) {
		// no name or phone number in the email: they stay behind the staff login
		$lines = [ 'A booking request arrived on the Apex Contour and Glow website.', '', 'Reference: C' . $id, 'Treatment: ' . $v['treatment'], 'Branch: ' . ( $v['branch'] ?: 'the one Apex suggests' ), 'Preferred day: ' . ( $v['day'] ?: 'not given' ), '', 'Open it (staff login needed): ' . admin_url( 'post.php?post=' . $id . '&action=edit' ) ];
		wp_mail( $to, '[Apex Contour and Glow] Booking request C' . $id, implode( "\n", $lines ) );
	}
	return [ 'ok' => true, 'ref' => 'C' . $id ];
}

/* ---------- Enquiries in the admin ---------- */
function apex_lead_statuses(): array { return [ 'new' => __( 'New', 'apex' ), 'replied' => __( 'Replied', 'apex' ), 'booked' => __( 'Booked', 'apex' ), 'closed' => __( 'Closed', 'apex' ) ]; }
add_filter( 'manage_apex_lead_posts_columns', fn() => [ 'cb' => '<input type="checkbox">', 'title' => __( 'Enquiry', 'apex' ), 'apex_name' => __( 'Name', 'apex' ), 'apex_phone' => __( 'Phone', 'apex' ), 'apex_tx' => __( 'Treatment', 'apex' ), 'apex_branch' => __( 'Branch', 'apex' ), 'apex_day' => __( 'Preferred day', 'apex' ), 'apex_status' => __( 'Status', 'apex' ), 'date' => __( 'Received', 'apex' ) ] );
add_action( 'manage_apex_lead_posts_custom_column', function ( $col, $id ) {
	$v = (array) get_post_meta( $id, 'apex_fields', true );
	if ( $col === 'apex_name' ) echo esc_html( $v['name'] ?? '' );
	if ( $col === 'apex_phone' ) echo esc_html( $v['phone'] ?? '' );
	if ( $col === 'apex_tx' ) echo esc_html( $v['treatment'] ?? '' );
	if ( $col === 'apex_branch' ) echo esc_html( $v['branch'] ?? '' );
	if ( $col === 'apex_day' ) echo esc_html( $v['day'] ?? '' );
	if ( $col === 'apex_status' ) echo esc_html( apex_lead_statuses()[ get_post_meta( $id, 'apex_status', true ) ?: 'new' ] ?? '' );
}, 10, 2 );
add_action( 'add_meta_boxes_apex_lead', function () {
	remove_meta_box( 'submitdiv', 'apex_lead', 'side' );
	add_meta_box( 'apex-lead', __( 'Booking request', 'apex' ), 'apex_lead_box', 'apex_lead', 'normal', 'high' );
	add_meta_box( 'apex-lead-status', __( 'Follow-up', 'apex' ), 'apex_lead_status_box', 'apex_lead', 'side', 'high' );
} );
add_action( 'load-post.php', function () {
	$id = absint( $_GET['post'] ?? 0 );
	if ( $id && get_post_type( $id ) === 'apex_lead' && current_user_can( 'edit_post', $id ) ) apex_audit( 'lead_open', $id );
} );
function apex_lead_box( WP_Post $p ): void {
	$v = (array) get_post_meta( $p->ID, 'apex_fields', true );
	$c = (array) get_post_meta( $p->ID, 'apex_consent', true );
	$rows = [ __( 'Name', 'apex' ) => $v['name'] ?? '', __( 'Phone', 'apex' ) => $v['phone'] ?? '', __( 'Treatment', 'apex' ) => $v['treatment'] ?? '', __( 'Branch', 'apex' ) => $v['branch'] ?? '', __( 'Preferred day', 'apex' ) => $v['day'] ?? '', __( 'Page language', 'apex' ) => $v['lang'] ?? '', __( 'Consent', 'apex' ) => ( $c['at'] ?? '' ) . ' · ' . ( $c['text'] ?? '' ) ];
	echo '<table class="widefat striped"><tbody>';
	foreach ( $rows as $k => $x ) echo '<tr><th style="width:160px">' . esc_html( $k ) . '</th><td>' . esc_html( (string) $x ) . '</td></tr>';
	echo '</tbody></table><p class="description">' . esc_html__( 'The same message also opened in LINE on the person\'s phone, so it may be in the LINE chat too.', 'apex' ) . '</p>';
}
function apex_lead_status_box( WP_Post $p ): void {
	wp_nonce_field( 'apex_lead_' . $p->ID, 'apex_lead_nonce' );
	$cur = get_post_meta( $p->ID, 'apex_status', true ) ?: 'new';
	echo '<p><select name="apex_status" style="width:100%">';
	foreach ( apex_lead_statuses() as $k => $x ) echo '<option value="' . esc_attr( $k ) . '"' . selected( $cur, $k, false ) . '>' . esc_html( $x ) . '</option>';
	echo '</select></p><p><label for="apex-notes">' . esc_html__( 'Staff notes', 'apex' ) . '</label><textarea id="apex-notes" name="apex_notes" rows="5" style="width:100%">' . esc_textarea( (string) get_post_meta( $p->ID, 'apex_notes', true ) ) . '</textarea></p>';
	echo '<p><button type="submit" class="button button-primary">' . esc_html__( 'Save', 'apex' ) . '</button> <a class="submitdelete" style="color:#b32d2e;margin-left:8px" href="' . esc_url( get_delete_post_link( $p->ID, '', true ) ) . '" onclick="return confirm(\'' . esc_js( __( 'Delete this enquiry for good?', 'apex' ) ) . '\')">' . esc_html__( 'Delete', 'apex' ) . '</a></p>';
	echo '<input type="hidden" name="post_status" value="private"><input type="hidden" name="visibility" value="private">';
}
add_action( 'save_post_apex_lead', function ( $id ) {
	if ( ! isset( $_POST['apex_lead_nonce'] ) || ! wp_verify_nonce( sanitize_key( $_POST['apex_lead_nonce'] ), 'apex_lead_' . $id ) || ! current_user_can( 'edit_post', $id ) ) return;
	$s = sanitize_key( $_POST['apex_status'] ?? 'new' );
	update_post_meta( $id, 'apex_status', array_key_exists( $s, apex_lead_statuses() ) ? $s : 'new' );
	update_post_meta( $id, 'apex_notes', sanitize_textarea_field( wp_unslash( $_POST['apex_notes'] ?? '' ) ) );
	apex_audit( 'lead_save', (int) $id, 'status: ' . get_post_meta( $id, 'apex_status', true ) );
} );
/* searching enquiries looks in the name, phone and treatment */
add_action( 'pre_get_posts', function ( $q ) {
	if ( ! is_admin() || ! $q->is_main_query() || $q->get( 'post_type' ) !== 'apex_lead' || ! $q->get( 's' ) ) return;
	$q->set( 'meta_query', [ [ 'key' => 'apex_fields', 'value' => $q->get( 's' ), 'compare' => 'LIKE' ] ] );
	$q->set( 's', '' );
} );
add_action( 'before_delete_post', function ( $id ) {
	if ( get_post_type( $id ) === 'apex_lead' ) apex_audit( get_current_user_id() ? 'lead_delete' : 'lead_expire', (int) $id );
} );
/* enquiries skip the bin: trashing one deletes it */
add_filter( 'pre_trash_post', function ( $skip, $post ) {
	if ( $post && $post->post_type === 'apex_lead' ) { wp_delete_post( $post->ID, true ); return true; }
	return $skip;
}, 10, 2 );
add_filter( 'bulk_post_updated_messages', function ( $m, $counts ) {
	$m['apex_lead']['trashed'] = _n( '%s enquiry deleted.', '%s enquiries deleted.', $counts['trashed'], 'apex' );
	return $m;
}, 10, 2 );
add_filter( 'wp_redirect', function ( $to ) {
	if ( is_admin() && str_contains( (string) $to, 'post_type=apex_lead' ) && str_contains( (string) $to, 'trashed=' ) ) $to = remove_query_arg( 'ids', $to );
	return $to;
} );
/* enquiries older than the keep period (Enquiries › Settings, 365 days unless changed) are deleted daily */
add_action( 'apex_daily', function () {
	$days = (int) apex_forms_opt( 'keep_days', 365 );
	if ( $days <= 0 ) return;
	$old = get_posts( [ 'post_type' => 'apex_lead', 'post_status' => 'any', 'posts_per_page' => 200, 'fields' => 'ids', 'date_query' => [ [ 'before' => gmdate( 'Y-m-d', time() - $days * DAY_IN_SECONDS ) ] ] ] );
	foreach ( $old as $id ) wp_delete_post( $id, true );
} );
add_action( 'init', function () { if ( ! wp_next_scheduled( 'apex_daily' ) ) wp_schedule_event( time() + HOUR_IN_SECONDS, 'daily', 'apex_daily' ); } );

/* WordPress's privacy tools (Tools › Export / Erase Personal Data) find enquiries by phone number */
function apex_mask( string $who ): string { return str_repeat( '*', max( 0, mb_strlen( $who ) - 4 ) ) . mb_substr( $who, -4 ); }
function apex_leads_by_phone( string $who ): array {
	$digits = preg_replace( '/\D/', '', $who );
	if ( strlen( $digits ) < 8 ) return [];
	$out = [];
	foreach ( get_posts( [ 'post_type' => 'apex_lead', 'post_status' => 'any', 'posts_per_page' => -1, 'fields' => 'ids' ] ) as $id ) {
		$v = (array) get_post_meta( $id, 'apex_fields', true );
		if ( preg_replace( '/\D/', '', (string) ( $v['phone'] ?? '' ) ) === $digits ) $out[] = $id;
	}
	return $out;
}
add_filter( 'wp_privacy_personal_data_exporters', function ( $ex ) {
	$ex['apex-leads'] = [ 'exporter_friendly_name' => 'Apex booking requests', 'callback' => function ( $who ) {
		$ids = apex_leads_by_phone( $who );
		apex_audit( 'export', 0, count( $ids ) . ' enquiries for ' . apex_mask( $who ) );
		$items = [];
		foreach ( $ids as $id ) {
			$data = [];
			foreach ( (array) get_post_meta( $id, 'apex_fields', true ) as $k => $x ) $data[] = [ 'name' => $k, 'value' => (string) $x ];
			$c = (array) get_post_meta( $id, 'apex_consent', true );
			$data[] = [ 'name' => 'received', 'value' => get_the_date( 'c', $id ) ];
			$data[] = [ 'name' => 'consent', 'value' => trim( ( $c['at'] ?? '' ) . ' ' . ( $c['text'] ?? '' ) ) ];
			$items[] = [ 'group_id' => 'apex-leads', 'group_label' => 'Booking requests', 'item_id' => 'lead-' . $id, 'data' => $data ];
		}
		return [ 'data' => $items, 'done' => true ];
	} ];
	return $ex;
} );
add_filter( 'wp_privacy_personal_data_erasers', function ( $er ) {
	$er['apex-leads'] = [ 'eraser_friendly_name' => 'Apex booking requests', 'callback' => function ( $who ) {
		$n = 0;
		foreach ( apex_leads_by_phone( $who ) as $id ) { wp_delete_post( $id, true ); $n++; }
		apex_audit( 'erase', 0, $n . ' enquiries for ' . apex_mask( $who ) );
		return [ 'items_removed' => $n, 'items_retained' => false, 'messages' => [], 'done' => true ];
	} ];
	return $er;
} );

/* Enquiries › Settings */
add_action( 'admin_menu', function () {
	add_submenu_page( 'edit.php?post_type=apex_lead', __( 'Settings', 'apex' ), __( 'Settings', 'apex' ), 'manage_options', 'apex-forms', 'apex_forms_page' );
} );
function apex_forms_page(): void {
	if ( ! current_user_can( 'manage_options' ) ) return;
	if ( isset( $_POST['apex_forms_nonce'] ) && wp_verify_nonce( sanitize_key( $_POST['apex_forms_nonce'] ), 'apex_forms' ) ) {
		$in = wp_unslash( $_POST['f'] ?? [] );
		$emails = implode( ', ', array_filter( array_map( 'sanitize_email', explode( ',', (string) ( $in['recipients'] ?? '' ) ) ), 'is_email' ) );
		update_option( 'apex_forms', [ 'recipients' => $emails, 'keep_days' => max( 0, (int) ( $in['keep_days'] ?? 365 ) ) ], false );
		apex_audit( 'settings', 0, 'Enquiry settings' );
		echo '<div class="notice notice-success"><p>' . esc_html__( 'Saved.', 'apex' ) . '</p></div>';
	}
	$o = (array) get_option( 'apex_forms' );
	if ( ! empty( $_SERVER['HTTP_CF_CONNECTING_IP'] ) && ! defined( 'APEX_IP_HEADER' ) ) echo '<div class="notice notice-warning"><p>' . esc_html__( 'This site is behind Cloudflare and APEX_IP_HEADER is not set in wp-config.php, so the limit of 6 requests an hour applies to all visitors together. Add define( \'APEX_IP_HEADER\', \'HTTP_CF_CONNECTING_IP\' ); as the handover says.', 'apex' ) . '</p></div>';
	echo '<div class="wrap"><h1>' . esc_html__( 'Enquiry settings', 'apex' ) . '</h1><form method="post"><table class="form-table">';
	wp_nonce_field( 'apex_forms', 'apex_forms_nonce' );
	echo '<tr><th><label for="f-r">' . esc_html__( 'Send booking requests to', 'apex' ) . '</label></th><td><input id="f-r" class="regular-text" name="f[recipients]" value="' . esc_attr( (string) ( $o['recipients'] ?? '' ) ) . '"><p class="description">' . esc_html__( 'Email addresses, separated by commas. Empty sends them to the site admin address. The email carries the treatment, branch and day only; the name and phone number stay behind the staff login.', 'apex' ) . '</p></td></tr>';
	echo '<tr><th><label for="f-k">' . esc_html__( 'Keep enquiries for (days)', 'apex' ) . '</label></th><td><input id="f-k" type="number" min="0" class="small-text" name="f[keep_days]" value="' . esc_attr( (string) ( $o['keep_days'] ?? 365 ) ) . '"><p class="description">' . esc_html__( 'Older enquiries are deleted automatically. 0 keeps them until someone deletes them. The privacy policy says 365, so change it there too.', 'apex' ) . '</p></td></tr>';
	echo '</table>';
	submit_button();
	echo '</form></div>';
}
