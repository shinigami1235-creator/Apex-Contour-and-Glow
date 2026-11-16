<?php
/**
 * Which template draws the request: the home page, a treatment, Compare, the privacy page, or not found.
 */
defined( 'ABSPATH' ) || exit;

$S = apex_site();
$o = get_queried_object();
$page = $o instanceof WP_Post && $o->post_type === 'page' ? (string) get_post_meta( $o->ID, '_apex_page', true ) : '';
if ( is_front_page() || is_home() ) $html = apex_render_home( $S );
elseif ( is_singular( 'apex_tx' ) && isset( $S['tx'][ (string) get_post_meta( $o->ID, '_apex_key', true ) ] ) ) $html = apex_render_tx( $S, (string) get_post_meta( $o->ID, '_apex_key', true ) );
elseif ( $page === 'compare' ) $html = apex_render_compare( $S );
elseif ( $page === 'privacy' ) $html = apex_render_privacy( $S );
else {
	status_header( 404 );
	nocache_headers();
	$html = apex_head( 'Page not found | Apex Contour and Glow', '' ) . "\n<body>\n" . apex_header( $S ) . "\n<main id=\"main\"><section class=\"phead\" data-tone=\"night\"><div class=\"phead-lines\" aria-hidden=\"true\"></div><div class=\"wrap\"><h1 class=\"display-s\">Page not found</h1><p class=\"lead\">This address has no page. The treatments and the face planner are on the home page.</p><p class=\"sh-acts\"><a class=\"btn btn-light\" href=\"index.html\">Go to the home page</a></p></div></section></main>\n" . apex_footer( $S ) . "\n" . apex_scripts( $S ) . "\n" . apex_tail( $S );
}
echo apex_links( $html );
