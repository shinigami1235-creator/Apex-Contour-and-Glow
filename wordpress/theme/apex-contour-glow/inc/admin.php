<?php
/**
 * The admin as Apex staff see it: only the menus this site uses, and a note on the dashboard.
 */
defined( 'ABSPATH' ) || exit;

/* the site has no blog: Posts leaves the menu and the "New" bar */
add_action( 'admin_menu', function () { remove_menu_page( 'edit.php' ); }, 99 );
add_action( 'admin_bar_menu', function ( $bar ) { $bar->remove_node( 'new-post' ); }, 100 );

add_action( 'wp_dashboard_setup', function () {
	wp_add_dashboard_widget( 'apex_help', __( 'Apex Contour and Glow', 'apex' ), function () {
		$l = fn( $u, $x ) => '<a href="' . esc_url( admin_url( $u ) ) . '">' . esc_html( $x ) . '</a>';
		echo '<ul style="list-style:disc;padding-left:18px">'
			. '<li>' . $l( 'edit.php?post_type=apex_tx', __( 'Treatments', 'apex' ) ) . ': ' . esc_html__( 'each treatment page, its prices, areas and questions.', 'apex' ) . '</li>'
			. '<li>' . $l( 'edit.php?post_type=apex_case', __( 'Before and after', 'apex' ) ) . ': ' . esc_html__( 'the photos on each treatment page and in the home page mirror.', 'apex' ) . '</li>'
			. '<li>' . $l( 'admin.php?page=apex-settings', __( 'Apex settings', 'apex' ) ) . ': ' . esc_html__( 'LINE, phone, footer, the home page text, Compare, the face planner names and the privacy policy.', 'apex' ) . '</li>'
			. '<li>' . $l( 'edit.php?post_type=apex_lead', __( 'Enquiries', 'apex' ) ) . ': ' . esc_html__( 'booking requests from the site.', 'apex' ) . '</li>'
			. '</ul><p>' . esc_html__( 'The Thai version of each item is under the flag in its Languages box.', 'apex' ) . '</p>';
	} );
} );
