<?php
/**
 * Apex Contour and Glow theme.
 *
 * Every public page is drawn by PHP from the same content the static design was built from
 * (tools/tx_content.py, tools/site_content.py and tools/layout.py, packed by wordpress/tools/export_content.py),
 * with the same markup, so the design's styles and scripts run on it unchanged.
 *
 * inc/helpers.php   language, escaping, theme files and links
 * inc/schema.php    the fields of every content type, shared by the admin, the importer and the data layer
 * inc/types.php     content types, Polylang registration, one slug in both languages
 * inc/data.php      content as the design's data structure
 * inc/render.php    the page templates, a PHP copy of the Python builders
 * inc/fields.php    the admin forms and Apex settings, built from the schema
 * inc/forms.php     the booking form: saved enquiries, the alert email, the keep period, privacy tools
 * inc/seo.php       canonical, Open Graph and structured data; works beside Rank Math
 * inc/redirects.php the preview site's .html addresses to their WordPress pages
 * inc/tracking.php  Google Tag Manager with Consent Mode v2, the cookie banner, custom code
 * inc/media.php     uploads saved as WebP
 * inc/security.php  hardening
 * inc/audit.php     access log: who opened enquiries or changed settings and roles
 * inc/admin.php     admin menus and the dashboard note
 * inc/cli.php       wp apex import | export | check
 */
defined( 'ABSPATH' ) || exit;

define( 'APEX_VERSION', '0.1.0' );   // keep in step with Version in style.css
add_filter( 'update_footer', fn( $t ) => 'Apex Contour and Glow theme ' . APEX_VERSION . ' · ' . $t, 20 );
define( 'APEX_DIR', __DIR__ );
define( 'APEX_URI', get_template_directory_uri() );
const APEX_LANGS = [ 'en', 'th' ];
function apex_default_lang(): string { return 'en'; }

foreach ( [ 'helpers', 'schema', 'types', 'data', 'render', 'fields', 'forms', 'seo', 'redirects', 'tracking', 'media', 'security', 'audit', 'admin' ] as $f ) {
	require_once APEX_DIR . "/inc/$f.php";
}
if ( defined( 'WP_CLI' ) && WP_CLI ) require_once APEX_DIR . '/inc/cli.php';
