<?php
/**
 * Access log: who opened, changed or deleted an enquiry, exported or erased
 * personal data, changed a setting, or got a new role. Enquiries › Access log shows it to administrators.
 *
 * The log keeps the newest 3,000 entries and drops anything older than 400 days. It sits in the option
 * apex_audit, which nobody can edit from the admin screens. A full activity log plugin (WP Activity Log or
 * Simple History) can run beside it for everything else.
 */
defined( 'ABSPATH' ) || exit;

const APEX_AUDIT_MAX = 3000;
const APEX_AUDIT_DAYS = 400;

/** Adds one entry. $what is one of the keys of apex_audit_labels(). */
function apex_audit( string $what, int $item = 0, string $note = '' ): void {
	$log = get_option( 'apex_audit' );
	$log = is_array( $log ) ? $log : [];
	$u = wp_get_current_user();
	$log[] = [
		'at' => time(),
		'user' => (int) $u->ID,
		'name' => $u->ID ? (string) $u->user_login : '',
		'what' => $what,
		'item' => $item,
		'note' => mb_substr( $note, 0, 200 ),
		'ip' => function_exists( 'apex_ip_hash' ) ? apex_ip_hash() : '',
	];
	$cut = time() - APEX_AUDIT_DAYS * DAY_IN_SECONDS;
	$log = array_values( array_filter( $log, fn( $e ) => (int) ( $e['at'] ?? 0 ) >= $cut ) );
	if ( count( $log ) > APEX_AUDIT_MAX ) $log = array_slice( $log, -APEX_AUDIT_MAX );
	update_option( 'apex_audit', $log, false );
}
function apex_audit_labels(): array {
	return [
		'lead_open' => __( 'Opened an enquiry', 'apex' ),
		'lead_save' => __( 'Changed an enquiry', 'apex' ),
		'lead_delete' => __( 'Deleted an enquiry', 'apex' ),
		'lead_expire' => __( 'Enquiry deleted after the keep period', 'apex' ),
		'export' => __( 'Exported personal data', 'apex' ),
		'erase' => __( 'Erased personal data', 'apex' ),
		'settings' => __( 'Changed settings', 'apex' ),
		'role' => __( 'Changed a user\'s role', 'apex' ),
		'login' => __( 'Logged in', 'apex' ),
	];
}

/* staff with access to enquiries: their logins */
add_action( 'wp_login', function ( $login, $user ) {
	if ( ! $user instanceof WP_User || ! user_can( $user, 'edit_apex_leads' ) ) return;
	wp_set_current_user( $user->ID );
	apex_audit( 'login' );
}, 10, 2 );

/* role changes */
add_action( 'set_user_role', function ( $id, $role, $old ) {
	$u = get_userdata( $id );
	apex_audit( 'role', (int) $id, ( $u ? $u->user_login : '#' . $id ) . ': ' . implode( ', ', (array) $old ) . ' → ' . $role );
}, 10, 3 );
add_action( 'user_register', function ( $id ) {
	$u = get_userdata( $id );
	if ( $u && array_intersect( (array) $u->roles, [ 'administrator', 'apex_staff' ] ) ) apex_audit( 'role', (int) $id, $u->user_login . ': new account, ' . implode( ', ', $u->roles ) );
} );

/* Enquiries › Access log */
add_action( 'admin_menu', function () {
	add_submenu_page( 'edit.php?post_type=apex_lead', __( 'Access log', 'apex' ), __( 'Access log', 'apex' ), 'manage_options', 'apex-audit', 'apex_audit_page' );
} );
function apex_audit_page(): void {
	if ( ! current_user_can( 'manage_options' ) ) return;
	$log = get_option( 'apex_audit' );
	$log = array_reverse( is_array( $log ) ? $log : [] );
	$who = isset( $_GET['who'] ) ? sanitize_user( wp_unslash( $_GET['who'] ) ) : '';
	if ( $who !== '' ) $log = array_values( array_filter( $log, fn( $e ) => ( $e['name'] ?? '' ) === $who ) );
	$L = apex_audit_labels();
	echo '<div class="wrap"><h1>' . esc_html__( 'Access log', 'apex' ) . '</h1><p>' . esc_html( sprintf( __( 'Who opened enquiries, and who changed settings or roles. The newest %1$s entries from the last %2$s days are kept.', 'apex' ), number_format_i18n( APEX_AUDIT_MAX ), APEX_AUDIT_DAYS ) ) . '</p>';
	echo '<form method="get"><input type="hidden" name="post_type" value="apex_lead"><input type="hidden" name="page" value="apex-audit"><input name="who" class="regular-text" placeholder="' . esc_attr__( 'User name', 'apex' ) . '" value="' . esc_attr( $who ) . '"> ';
	submit_button( __( 'Show only this user', 'apex' ), 'secondary', '', false );
	echo '</form><table class="widefat striped" style="margin-top:12px"><thead><tr><th>' . esc_html__( 'When', 'apex' ) . '</th><th>' . esc_html__( 'Who', 'apex' ) . '</th><th>' . esc_html__( 'What', 'apex' ) . '</th><th>' . esc_html__( 'Item', 'apex' ) . '</th><th>' . esc_html__( 'Details', 'apex' ) . '</th></tr></thead><tbody>';
	if ( ! $log ) echo '<tr><td colspan="5">' . esc_html__( 'Nothing logged yet.', 'apex' ) . '</td></tr>';
	foreach ( array_slice( $log, 0, 500 ) as $e ) {
		$item = (int) ( $e['item'] ?? 0 );
		$it = '';
		if ( $item && in_array( $e['what'], [ 'lead_open', 'lead_save', 'lead_delete', 'lead_expire' ], true ) ) $it = 'A' . $item;
		echo '<tr><td>' . esc_html( wp_date( 'j M Y H:i', (int) $e['at'] ) ) . '</td><td>' . esc_html( ( $e['name'] ?? '' ) !== '' ? $e['name'] : __( 'The site', 'apex' ) ) . '</td><td>' . esc_html( $L[ $e['what'] ] ?? $e['what'] ) . '</td><td>' . esc_html( $it ) . '</td><td>' . esc_html( (string) ( $e['note'] ?? '' ) ) . '</td></tr>';
	}
	echo '</tbody></table></div>';
}
