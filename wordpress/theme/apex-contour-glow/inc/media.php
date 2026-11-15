<?php
/**
 * Photos turn into WebP as they are uploaded. A JPEG or PNG is saved again as WebP at quality 82 and the
 * WebP copy replaces it, when the copy is smaller; the sizes WordPress cuts from it are WebP too.
 * Settings › Media › "Save uploaded photos as WebP" turns this off. GIFs, PDFs and video are left alone.
 */
defined( 'ABSPATH' ) || exit;

function apex_webp_on(): bool { return (bool) get_option( 'apex_webp', 1 ); }

/** A narrower WebP copy of a photo, made with GD directly so the result is always lossy at quality $q. */
function apex_webp_width( string $from, string $to, int $w, int $q = 78 ): bool {
	if ( ! function_exists( 'imagewebp' ) ) return false;
	$im = @imagecreatefromstring( (string) file_get_contents( $from ) );
	if ( ! $im ) return false;
	if ( ! imageistruecolor( $im ) ) imagepalettetotruecolor( $im );
	$small = imagescale( $im, $w, -1, IMG_BICUBIC );
	imagedestroy( $im );
	if ( ! $small ) return false;
	imagealphablending( $small, false );
	imagesavealpha( $small, true );
	$ok = @imagewebp( $small, $to, $q );
	imagedestroy( $small );
	clearstatcache( true, $to );
	if ( $ok && is_file( $to ) && filesize( $to ) > 0 && filesize( $to ) < filesize( $from ) && @getimagesize( $to ) ) return true;
	if ( is_file( $to ) ) wp_delete_file( $to );
	return false;
}
/** Saves a JPEG or PNG as WebP. True only when the WebP file is a readable image and lighter than the original. */
function apex_to_webp( string $from, string $to, int $q = 82 ): bool {
	$size = @filesize( $from );
	$info = @getimagesize( $from );
	if ( ! $size || ! $info ) return false;
	if ( $info[2] === IMAGETYPE_PNG && function_exists( 'imagewebp' ) ) {
		// GD cannot write a palette PNG (most screenshots and graphics) as WebP until it holds full colour
		$im = @imagecreatefrompng( $from );
		if ( ! $im ) return false;
		if ( ! imageistruecolor( $im ) ) imagepalettetotruecolor( $im );
		imagealphablending( $im, false );
		imagesavealpha( $im, true );
		$ok = @imagewebp( $im, $to, $q );
		imagedestroy( $im );
	} else {
		$ed = wp_get_image_editor( $from );
		if ( is_wp_error( $ed ) ) return false;
		if ( method_exists( $ed, 'maybe_exif_rotate' ) ) $ed->maybe_exif_rotate();   // phone photos keep the right way up
		$ed->set_quality( $q );
		$ok = ! is_wp_error( $ed->save( $to, 'image/webp' ) );
	}
	clearstatcache( true, $to );
	if ( $ok && is_file( $to ) && filesize( $to ) > 0 && filesize( $to ) < $size && @getimagesize( $to ) ) return true;
	if ( is_file( $to ) ) wp_delete_file( $to );
	return false;
}

add_filter( 'wp_handle_upload', function ( array $u, string $ctx ) {
	if ( ! apex_webp_on() || ! empty( $u['error'] ) || ! in_array( $u['type'] ?? '', [ 'image/jpeg', 'image/png' ], true ) ) return $u;
	if ( ! wp_image_editor_supports( [ 'mime_type' => 'image/webp' ] ) ) return $u;
	$info = pathinfo( $u['file'] );
	$name = $info['filename'] . '.webp';   // photo.jpg becomes photo.webp unless that name is taken
	if ( file_exists( $info['dirname'] . '/' . $name ) ) $name = wp_unique_filename( $info['dirname'], $name );
	$to = $info['dirname'] . '/' . $name;
	if ( ! apex_to_webp( $u['file'], $to ) ) return $u;
	wp_delete_file( $u['file'] );
	return [ 'file' => $to, 'url' => dirname( $u['url'] ) . '/' . $name, 'type' => 'image/webp' ] + $u;
}, 10, 2 );

/* Settings › Media */
add_action( 'admin_init', function () {
	register_setting( 'media', 'apex_webp', [ 'type' => 'integer', 'default' => 1, 'sanitize_callback' => fn( $v ) => $v ? 1 : 0 ] );
	add_settings_field( 'apex_webp', __( 'Save uploaded photos as WebP', 'apex' ), function () {
		echo '<label><input type="checkbox" name="apex_webp" value="1"' . checked( apex_webp_on(), true, false ) . '> ' . esc_html__( 'JPEG and PNG uploads are saved as WebP, which loads faster. The original is not kept.', 'apex' ) . '</label>';
	}, 'media', 'default' );
} );

/* ---------- photos already in the content ----------
   `wp apex webp` (and the end of `wp apex import`, and a daily run) saves a WebP copy of each JPEG and PNG the content
   shows and points the content at it, and makes phone-size copies (photo-w800.webp, photo-w1200.webp) of wide photos,
   which the templates offer in srcset. Originals stay in the uploads folder. */
const APEX_PHOTO_RE = '#((?:~|https?://[^"\'\s()<>]+?)/wp-content/uploads/)([^"\'\s()<>?\#]+?)\.(jpe?g|png)(?=["\'\s()<>?\#]|$)#i';
function apex_photo_pass( bool $dry, int $min_kb = 40, ?callable $say = null ): array {
	global $wpdb;
	$base = trailingslashit( wp_upload_dir( null, false )['basedir'] );
	$ids = $wpdb->get_col( "SELECT ID FROM $wpdb->posts WHERE post_type NOT IN ('revision','apex_lead') AND post_status NOT IN ('auto-draft','trash')" );
	$opts = array_map( fn( $l ) => 'apex_shared_' . $l, APEX_LANGS );
	// 1. every photo address the content uses
	$found = []; $all = [];
	$scan = function ( $v ) use ( &$scan, &$found, &$all ) {
		if ( is_array( $v ) ) { foreach ( $v as $x ) $scan( $x ); return; }
		if ( ! is_string( $v ) ) return;
		if ( preg_match_all( APEX_PHOTO_RE, $v, $m, PREG_SET_ORDER ) ) foreach ( $m as $x ) $found[ rawurldecode( $x[2] ) . '.' . $x[3] ] = true;
		if ( preg_match_all( str_replace( 'jpe?g|png', 'jpe?g|png|webp', APEX_PHOTO_RE ), $v, $m, PREG_SET_ORDER ) ) foreach ( $m as $x ) $all[ rawurldecode( $x[2] ) . '.' . $x[3] ] = true;
	};
	foreach ( $ids as $id ) { $scan( get_post_field( 'post_content', $id ) ); $scan( get_post_meta( (int) $id ) ); }
	foreach ( $opts as $o ) $scan( get_option( $o ) );
	// 2. a WebP copy next to each one, kept only when it is lighter
	$done = []; $kb = 0; $missing = 0;
	foreach ( array_keys( $found ) as $rel ) {
		$file = $base . $rel;
		if ( ! is_file( $file ) ) { $missing++; continue; }
		$to = preg_replace( '/\.(jpe?g|png)$/i', '.webp', $file );
		if ( is_file( $to ) && filesize( $to ) > 0 && @getimagesize( $to ) ) { $done[ $rel ] = true; continue; }   // made on an earlier run
		$size = filesize( $file );
		if ( $size < $min_kb * 1024 ) continue;
		if ( $dry ) { $done[ $rel ] = true; $kb += (int) round( $size * .7 / 1024 ); if ( $say ) $say( "  $rel  " . round( $size / 1024 ) . ' KB' ); continue; }
		if ( ! apex_to_webp( $file, $to ) ) continue;
		$kb += (int) round( ( $size - filesize( $to ) ) / 1024 );
		if ( $say ) $say( "  $rel  " . round( $size / 1024 ) . ' KB -> ' . round( filesize( $to ) / 1024 ) . ' KB' );
		$done[ $rel ] = true;
	}
	// 3. phone-size copies of wide photos (photo-w800.webp, photo-w1200.webp), listed for the templates' srcset
	if ( ! $dry ) {
		$sizes = [];
		foreach ( array_keys( $all ) as $rel ) {
			if ( preg_match( '/-w(800|1200)\.webp$/', $rel ) ) continue;
			$cur = isset( $done[ $rel ] ) ? preg_replace( '/\.(jpe?g|png)$/i', '.webp', $rel ) : $rel;
			$file = $base . $cur;
			$info = is_file( $file ) ? @getimagesize( $file ) : false;
			if ( ! $info || $info[0] < 1000 ) continue;
			$v = [];
			foreach ( [ 800, 1200 ] as $w ) {
				if ( $w > $info[0] - 150 ) continue;   // a copy almost as wide as the photo saves little
				$out = preg_replace( '/\.(webp|jpe?g|png)$/i', '', $file ) . "-w$w.webp";
				if ( ! ( is_file( $out ) && filesize( $out ) > 0 && @getimagesize( $out ) ) && ! apex_webp_width( $file, $out, $w ) ) continue;
				$v[ $w ] = substr( $out, strlen( $base ) );
			}
			if ( $v ) $sizes[ $cur ] = [ 'w' => $info[0], 'v' => $v ];
		}
		update_option( 'apex_photo_sizes', $sizes, true );
	}
	// 4. point the content at the copies
	if ( ! $dry && $done ) {
		$fix = function ( $v ) use ( &$fix, $done ) {
			if ( is_array( $v ) ) { foreach ( $v as $k => $x ) $v[ $k ] = $fix( $x ); return $v; }
			if ( ! is_string( $v ) ) return $v;
			return preg_replace_callback( APEX_PHOTO_RE, fn( $m ) => isset( $done[ rawurldecode( $m[2] ) . '.' . $m[3] ] ) ? $m[1] . $m[2] . '.webp' : $m[0], $v );
		};
		foreach ( $ids as $id ) {
			$id = (int) $id;
			$c = get_post_field( 'post_content', $id );
			$n = $fix( $c );
			if ( $n !== $c ) { $wpdb->update( $wpdb->posts, [ 'post_content' => $n ], [ 'ID' => $id ] ); clean_post_cache( $id ); }
			foreach ( get_post_meta( $id ) as $k => $vals ) {
				if ( count( $vals ) !== 1 ) continue;
				$v = get_post_meta( $id, $k, true );
				$n = $fix( $v );
				if ( $n !== $v ) update_post_meta( $id, $k, wp_slash( $n ) );
			}
		}
		foreach ( $opts as $o ) { $v = get_option( $o ); $n = $fix( $v ); if ( $n !== $v ) update_option( $o, $n, true ); }
	}
	return [ 'done' => count( $done ), 'kb' => $kb, 'missing' => $missing ];
}
add_action( 'apex_photo_pass', function () { if ( apex_webp_on() ) { apex_photo_pass( false, 40 ); apex_data_bump(); } } );
add_action( 'init', function () { if ( ! wp_next_scheduled( 'apex_photo_pass' ) ) wp_schedule_event( time() + HOUR_IN_SECONDS, 'daily', 'apex_photo_pass' ); } );
