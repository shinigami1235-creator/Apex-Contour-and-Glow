<?php
/**
 * Apex Contour and Glow theme.
 *
 * Every public page is drawn by PHP from the same content the static design was built from
 * (tools/tx_content.py, tools/site_content.py and tools/layout.py, packed by wordpress/tools/export_content.py),
 * with the same markup, so the design's styles and scripts run on it unchanged.
 *
 * inc/schema.php    the fields of every content type, shared by the admin, the importer and the data layer
 * inc/types.php     content types, Polylang registration, one slug in both languages
 */
defined( 'ABSPATH' ) || exit;

define( 'APEX_VERSION', '0.1.0' );   // keep in step with Version in style.css
add_filter( 'update_footer', fn( $t ) => 'Apex Contour and Glow theme ' . APEX_VERSION . ' · ' . $t, 20 );
define( 'APEX_DIR', __DIR__ );
define( 'APEX_URI', get_template_directory_uri() );
const APEX_LANGS = [ 'en', 'th' ];
function apex_default_lang(): string { return 'en'; }

foreach ( [ 'schema', 'types' ] as $f ) {
	require_once APEX_DIR . "/inc/$f.php";
}
