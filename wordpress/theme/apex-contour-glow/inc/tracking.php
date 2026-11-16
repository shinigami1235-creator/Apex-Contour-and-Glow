<?php
/**
 * Google Tag Manager with Google Consent Mode v2, and the cookie banner Thai PDPA asks for.
 * Nothing that stores analytics or advertising cookies runs until the visitor accepts; Tag Manager loads
 * straight away with everything denied, so tags that respect consent (GA4, Google Ads) wait for the choice.
 * The site's own events (apex_* in dataLayer, see assets/js/cg.js) go to the same dataLayer.
 * Apex settings › Tracking sets the container ID; empty turns tracking off.
 * The same page holds custom code: boxes printed as typed in the head, after <body>, before </body>, plus
 * custom CSS and JavaScript. Only someone allowed to post raw HTML (an administrator) can change them.
 */
defined( 'ABSPATH' ) || exit;

function apex_gtm_id(): string {
	$v = get_option( 'apex_gtm', '' );
	return preg_match( '/^GTM-[A-Z0-9]{4,12}$/', (string) $v ) ? $v : '';
}

/* consent defaults and the container, first thing in the head */
add_action( 'wp_head', function () {
	if ( is_admin() ) return;
	$id = apex_gtm_id();
	?>
<script>
window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}
(function(){var c=null;try{c=JSON.parse(localStorage.getItem('apex_consent')||'null');}catch(e){}
var g=c&&c.v===1?c:null,a=g&&g.analytics?'granted':'denied',m=g&&g.ads?'granted':'denied';
gtag('consent','default',{ad_storage:m,ad_user_data:m,ad_personalization:m,analytics_storage:a,functionality_storage:'granted',security_storage:'granted',wait_for_update:500});
gtag('set','ads_data_redaction',m==='denied');gtag('set','url_passthrough',true);})();
</script>
<?php if ( $id ) : ?>
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','<?php echo esc_js( $id ); ?>');</script>
<?php endif;
}, 1 );
add_action( 'wp_body_open', function () {
	$id = apex_gtm_id();
	if ( $id ) echo '<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=' . esc_attr( $id ) . '" height="0" width="0" style="display:none;visibility:hidden" title="Google Tag Manager"></iframe></noscript>';
} );

/* the banner: shown until the visitor chooses; "Cookie settings" in the footer brings it back */
add_action( 'wp_footer', function () {
	if ( is_admin() ) return;
	$th = apex_lang() === 'th';
	$t = $th ? [
		'h' => 'คุกกี้บนเว็บไซต์นี้',
		'p' => 'เราใช้คุกกี้ที่จำเป็นเพื่อให้เว็บไซต์ทำงาน และขออนุญาตใช้คุกกี้วิเคราะห์การใช้งานและคุกกี้โฆษณาเพื่อปรับปรุงเว็บไซต์และวัดผลโฆษณา คุณเปลี่ยนใจได้ทุกเมื่อที่ "ตั้งค่าคุกกี้" ท้ายหน้า',
		'all' => 'ยอมรับทั้งหมด', 'none' => 'ใช้เฉพาะที่จำเป็น', 'set' => 'เลือกเอง', 'save' => 'บันทึก',
		'an' => 'คุกกี้วิเคราะห์การใช้งาน', 'anP' => 'นับจำนวนผู้เข้าชมและหน้าที่ถูกเปิด',
		'ad' => 'คุกกี้โฆษณา', 'adP' => 'วัดผลโฆษณาบน Google และ Facebook',
		'link' => 'ตั้งค่าคุกกี้',
	] : [
		'h' => 'Cookies on this site',
		'p' => 'We use the cookies the site needs to work. With your permission we also use analytics cookies to improve the site and advertising cookies to measure our ads. You can change your mind any time under "Cookie settings" at the foot of the page.',
		'all' => 'Accept all', 'none' => 'Only necessary', 'set' => 'Choose', 'save' => 'Save',
		'an' => 'Analytics cookies', 'anP' => 'Count visits and the pages people open',
		'ad' => 'Advertising cookies', 'adP' => 'Measure our ads on Google and Facebook',
		'link' => 'Cookie settings',
	];
	?>
<div class="ck" id="apex-ck" role="dialog" aria-modal="false" aria-labelledby="apex-ck-h" hidden>
  <div class="ck-in"><p class="ck-h" id="apex-ck-h"><?php echo esc_html( $t['h'] ); ?></p><p class="ck-p"><?php echo esc_html( $t['p'] ); ?></p>
  <div class="ck-opts" hidden><label><input type="checkbox" name="analytics"> <b><?php echo esc_html( $t['an'] ); ?></b><small><?php echo esc_html( $t['anP'] ); ?></small></label><label><input type="checkbox" name="ads"> <b><?php echo esc_html( $t['ad'] ); ?></b><small><?php echo esc_html( $t['adP'] ); ?></small></label></div>
  <div class="ck-acts"><button type="button" class="btn btn-plum btn-sm" data-ck="all"><?php echo esc_html( $t['all'] ); ?></button><button type="button" class="btn btn-ghost btn-sm" data-ck="none"><?php echo esc_html( $t['none'] ); ?></button><button type="button" class="ck-set" data-ck="set"><?php echo esc_html( $t['set'] ); ?></button><button type="button" class="btn btn-plum btn-sm" data-ck="save" hidden><?php echo esc_html( $t['save'] ); ?></button></div></div>
</div>
<style>
.ck{position:fixed;z-index:120;left:16px;right:16px;bottom:16px;max-width:560px;background:#fff;color:var(--ink,#2a1838);border-radius:var(--r-l,24px);box-shadow:0 0 0 1px rgba(106,56,140,.12),0 18px 60px rgba(31,10,48,.28)}
.ck [hidden]{display:none!important}
.ck-in{padding:22px 24px}.ck-h{font-size:21px;line-height:1.2;margin:0 0 8px;color:var(--plum,#6A388C)}.ck-p{font-size:14.5px;line-height:1.6;margin:0 0 16px}
.ck-acts{display:flex;flex-wrap:wrap;gap:10px;align-items:center}.ck-set{background:none;border:0;padding:8px 4px;font:inherit;font-size:14px;color:var(--plum,#6A388C);text-decoration:underline;cursor:pointer}
.ck-opts{display:grid;gap:10px;margin:0 0 14px}.ck-opts label{display:grid;grid-template-columns:22px 1fr;column-gap:8px;font-size:14px;cursor:pointer}.ck-opts small{grid-column:2;opacity:.8}
.ck-opts input{width:18px;height:18px;margin:2px 0 0;accent-color:var(--plum,#6A388C)}
.ck-link{background:none;border:0;padding:0;font:inherit;color:inherit;text-decoration:underline;cursor:pointer}
@media (max-width:520px){.ck{left:10px;right:10px;bottom:10px}.ck-acts .btn{flex:1 1 auto;text-align:center}}
</style>
<script>
(function(){
  var box=document.getElementById('apex-ck'); if(!box) return;
  var K='apex_consent', opts=box.querySelector('.ck-opts'), save=box.querySelector('[data-ck=save]'), set=box.querySelector('[data-ck=set]');
  function read(){try{var c=JSON.parse(localStorage.getItem(K)||'null');return c&&c.v===1?c:null;}catch(e){return null;}}
  function write(a,m){var c={v:1,analytics:!!a,ads:!!m,at:Date.now()};try{localStorage.setItem(K,JSON.stringify(c));}catch(e){}
    document.cookie='apex_consent='+(a?'a':'')+(m?'m':'')+'-;path=/;max-age=15552000;SameSite=Lax';
    gtag('consent','update',{analytics_storage:a?'granted':'denied',ad_storage:m?'granted':'denied',ad_user_data:m?'granted':'denied',ad_personalization:m?'granted':'denied'});
    gtag('set','ads_data_redaction',!m);
    window.dataLayer.push({event:'apex_consent',apex:{analytics:!!a,ads:!!m}});
    try{window.dispatchEvent(new CustomEvent('apex:consent',{detail:c}));}catch(e){}
    box.hidden=true;}
  function open(){var c=read();box.hidden=false;opts.hidden=true;save.hidden=true;set.hidden=false;
    box.querySelector('[name=analytics]').checked=!!(c&&c.analytics);box.querySelector('[name=ads]').checked=!!(c&&c.ads);}
  box.addEventListener('click',function(e){var b=e.target.closest('[data-ck]');if(!b)return;var k=b.getAttribute('data-ck');
    if(k==='all')write(1,1);else if(k==='none')write(0,0);
    else if(k==='set'){opts.hidden=false;save.hidden=false;set.hidden=true;box.querySelector('[name=analytics]').focus();}
    else if(k==='save')write(box.querySelector('[name=analytics]').checked,box.querySelector('[name=ads]').checked);});
  if(!read())setTimeout(open,600);
  function link(){var f=document.querySelector('footer.foot');if(!f||document.querySelector('.ck-link'))return;
    var w=document.createElement('p'),a=document.createElement('button');w.className='fine';a.type='button';a.className='ck-link';a.textContent=<?php echo wp_json_encode( $t['link'], JSON_UNESCAPED_UNICODE ); ?>;a.addEventListener('click',open);w.append(a);f.append(w);}
  document.addEventListener('apex:ready',link);if(document.readyState!=='loading')link();else document.addEventListener('DOMContentLoaded',link);
})();
</script>
<?php
}, 50 );

/* ---------- custom code ---------- */
const APEX_CODE = [ 'head', 'body', 'footer', 'css', 'js' ];
function apex_code( string $k ): string { $v = get_option( 'apex_code_' . $k, '' ); return is_string( $v ) ? $v : ''; }
add_action( 'wp_head', function () {
	if ( is_admin() ) return;
	if ( ( $c = apex_code( 'css' ) ) !== '' ) echo "<style id=\"apex-custom-css\">\n" . str_ireplace( '</style', '<\\/style', $c ) . "\n</style>\n";
	if ( ( $c = apex_code( 'head' ) ) !== '' ) echo $c . "\n";
}, 99 );
add_action( 'wp_body_open', function () { if ( ( $c = apex_code( 'body' ) ) !== '' ) echo $c . "\n"; }, 20 );
add_action( 'wp_footer', function () {
	if ( is_admin() ) return;
	if ( ( $c = apex_code( 'footer' ) ) !== '' ) echo $c . "\n";
	if ( ( $c = apex_code( 'js' ) ) !== '' ) echo "<script id=\"apex-custom-js\">\n" . str_ireplace( '</script', '<\\/script', $c ) . "\n</script>\n";
}, 99 );

/* Apex settings › Tracking */
add_action( 'admin_menu', function () {
	add_submenu_page( 'apex-settings', __( 'Tracking and code', 'apex' ), __( 'Tracking and code', 'apex' ), 'manage_options', 'apex-tracking', function () {
		if ( ! current_user_can( 'manage_options' ) ) return;
		if ( isset( $_POST['apex_gtm_nonce'] ) && wp_verify_nonce( sanitize_key( $_POST['apex_gtm_nonce'] ), 'apex_gtm' ) ) {
			$v = strtoupper( sanitize_text_field( wp_unslash( $_POST['apex_gtm'] ?? '' ) ) );
			update_option( 'apex_gtm', preg_match( '/^GTM-[A-Z0-9]{4,12}$/', $v ) ? $v : '', true );
			$changed = [];
			if ( current_user_can( 'unfiltered_html' ) ) foreach ( APEX_CODE as $k ) {
				$new = (string) wp_unslash( $_POST[ 'apex_code_' . $k ] ?? '' );
				if ( $new !== apex_code( $k ) ) $changed[] = $k;
				update_option( 'apex_code_' . $k, $new, true );
			}
			apex_audit( 'settings', 0, 'Tracking and code' . ( $changed ? ' (custom code: ' . implode( ', ', $changed ) . ')' : '' ) );
			echo '<div class="notice notice-success"><p>' . esc_html__( 'Saved.', 'apex' ) . '</p></div>';
		}
		echo '<div class="wrap"><h1>' . esc_html__( 'Tracking and code', 'apex' ) . '</h1><form method="post"><table class="form-table"><tr><th><label for="apex-gtm">' . esc_html__( 'Google Tag Manager container', 'apex' ) . '</label></th><td><input id="apex-gtm" name="apex_gtm" class="regular-text" value="' . esc_attr( apex_gtm_id() ) . '" placeholder="GTM-XXXXXXX"><p class="description">' . esc_html__( 'Empty turns Tag Manager off. Analytics and ads tags in the container must use Consent Mode: they only store cookies after the visitor accepts in the cookie banner.', 'apex' ) . '</p></td></tr></table>';
		$boxes = [
			'head' => [ __( 'Code in the head', 'apex' ), __( 'Printed as typed before </head> on every page: verification meta tags, a font, a script a vendor gives you.', 'apex' ) ],
			'body' => [ __( 'Code after <body>', 'apex' ), __( 'Printed right after the <body> tag. Some vendors ask for a noscript tag here.', 'apex' ) ],
			'footer' => [ __( 'Code before </body>', 'apex' ), __( 'Printed at the end of every page: chat widgets and other scripts that can load last.', 'apex' ) ],
			'css' => [ __( 'Custom CSS', 'apex' ), __( 'Plain CSS without the <style> tag. It loads after the theme\'s styles, so it wins.', 'apex' ) ],
			'js' => [ __( 'Custom JavaScript', 'apex' ), __( 'Plain JavaScript without the <script> tag. Runs at the end of every page.', 'apex' ) ],
		];
		$can = current_user_can( 'unfiltered_html' );
		echo '<h2>' . esc_html__( 'Custom code', 'apex' ) . '</h2><p>' . esc_html__( 'Code here runs on every page of the site without asking for cookie consent. Put analytics and ad pixels in Tag Manager instead, so the cookie banner controls them. A mistake here can break the site: test on staging first.', 'apex' ) . '</p>';
		if ( ! $can ) echo '<p><b>' . esc_html__( 'Only an administrator who may post raw HTML can change these boxes.', 'apex' ) . '</b></p>';
		echo '<table class="form-table">';
		foreach ( $boxes as $k => [ $label, $help ] ) echo '<tr><th><label for="apex-code-' . $k . '">' . esc_html( $label ) . '</label></th><td><textarea id="apex-code-' . $k . '" name="apex_code_' . $k . '" class="large-text code" rows="6" spellcheck="false"' . ( $can ? '' : ' readonly' ) . '>' . esc_textarea( apex_code( $k ) ) . '</textarea><p class="description">' . esc_html( $help ) . '</p></td></tr>';
		echo '</table>';
		wp_nonce_field( 'apex_gtm', 'apex_gtm_nonce' );
		submit_button();
		echo '<h2>' . esc_html__( 'Events the site sends', 'apex' ) . '</h2><p>' . esc_html__( 'The site pushes an event named apex_… to the dataLayer, apex_area_pick when someone picks a face area, apex_compare when they compare two treatments, apex_book_submit when they send the booking form, and apex_contact_click on a LINE or phone link. Use them as triggers in Tag Manager.', 'apex' ) . '</p></form></div>';
	} );
} );
