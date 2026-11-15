<?php
/**
 * Search and sharing: canonical address, Open Graph, and structured data (the clinic on the home page,
 * each treatment as a medical procedure with its questions). Polylang adds the hreflang links between
 * English and Thai. With Rank Math active, Rank Math prints the title, description, canonical and Open Graph,
 * and the theme fills any of them an editor left empty in Rank Math.
 */
defined( 'ABSPATH' ) || exit;

function apex_rank_math(): bool { return defined( 'RANK_MATH_VERSION' ); }
add_action( 'after_setup_theme', function () { if ( apex_rank_math() ) add_theme_support( 'title-tag' ); } );

/** The title and description the theme would use for this request. */
function apex_seo_now(): array {
	$S = apex_site();
	$o = get_queried_object();
	if ( is_singular( 'apex_tx' ) && $o ) {
		$t = $S['tx'][ (string) get_post_meta( $o->ID, '_apex_key', true ) ] ?? null;
		if ( $t ) return [ $t['seo_title'] ?: $t['name'] . ' at Apex | Apex Contour and Glow', $t['seo_desc'] ?: ( $t['hook'][0] ?? '' ) ];
	}
	if ( $o instanceof WP_Post && get_post_meta( $o->ID, '_apex_page', true ) === 'privacy' ) return [ $S['privacy']['seo_title'], $S['privacy']['seo_desc'] ];
	if ( $o instanceof WP_Post && get_post_meta( $o->ID, '_apex_page', true ) === 'compare' ) return [ 'Compare two treatments | Apex Contour and Glow', 'Compare two injectable treatments at Apex side by side: what each one is, what it suits, when it shows, how long it lasts and what it costs.' ];
	return [ $S['home']['seo_title'], $S['home']['seo_desc'] ];
}
add_filter( 'rank_math/frontend/title', fn( $t ) => $t !== '' ? $t : apex_seo_now()[0] );
add_filter( 'rank_math/frontend/description', fn( $d ) => $d !== '' ? $d : apex_seo_now()[1] );

/** Whether apex_head() prints its own title and description: not when Rank Math does. */
function apex_own_meta(): bool { return ! apex_rank_math(); }

add_action( 'wp_head', function () {
	if ( is_admin() || is_404() ) return;
	$url = is_front_page() || is_home() ? apex_home_url() : ( is_singular() ? get_permalink() : '' );
	[ $title, $desc ] = apex_seo_now();
	if ( apex_own_meta() && $url ) {
		echo '<link rel="canonical" href="' . esc_url( $url ) . '">' . "\n";
		echo '<meta property="og:type" content="website"><meta property="og:title" content="' . esc_attr( $title ) . '"><meta property="og:description" content="' . esc_attr( $desc ) . '"><meta property="og:url" content="' . esc_url( $url ) . '"><meta property="og:image" content="' . esc_url( apex_asset( 'img/mirror-gold.webp' ) ) . '"><meta property="og:locale" content="' . ( apex_lang() === 'th' ? 'th_TH' : 'en_US' ) . '">' . "\n";
	}
	$S = apex_site();
	$clinic = [ '@type' => 'MedicalClinic', 'name' => $S['settings']['brand'], 'telephone' => $S['settings']['phone'], 'url' => apex_home_url(), 'address' => [ '@type' => 'PostalAddress', 'addressLocality' => 'Bangkok', 'addressCountry' => 'TH' ], 'parentOrganization' => [ '@type' => 'Organization', 'name' => 'Apex Hospital & Clinics' ] ];
	$ld = null;
	if ( is_front_page() || is_home() ) {
		$ld = [ '@context' => 'https://schema.org' ] + $clinic + [ 'availableService' => array_map( fn( $k ) => [ '@type' => 'MedicalProcedure', 'name' => $S['tx'][ $k ]['name'], 'url' => apex_link( "$k.html" ) ], $S['order'] ) ];
	} elseif ( is_singular( 'apex_tx' ) ) {
		$t = $S['tx'][ (string) get_post_meta( get_queried_object_id(), '_apex_key', true ) ] ?? null;
		if ( $t ) $ld = [ '@context' => 'https://schema.org', '@graph' => [
			[ '@type' => 'MedicalProcedure', 'name' => $t['name'], 'description' => $t['hook'][0] ?? '', 'url' => get_permalink(), 'procedureType' => 'https://schema.org/NoninvasiveProcedure', 'howPerformed' => $t['lead'], 'provider' => $clinic ],
			[ '@type' => 'FAQPage', 'mainEntity' => array_map( fn( $q ) => [ '@type' => 'Question', 'name' => $q[0], 'acceptedAnswer' => [ '@type' => 'Answer', 'text' => $q[1] ] ], $t['faq'] ) ],
		] ];
	}
	if ( $ld ) echo '<script type="application/ld+json">' . wp_json_encode( $ld, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES ) . "</script>\n";
}, 5 );
