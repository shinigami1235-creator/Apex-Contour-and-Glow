<?php
/**
 * The fields of every content type. The keys are the design's own data keys (tools/tx_content.py,
 * tools/site_content.py, tools/layout.py), so the admin forms, the importer and the data layer read one list.
 *
 * Field: [ 'k' => key, 't' => type, 'l' => label, 'h' => help, 'f' => sub-fields, 'o' => choices, 'src' => storage ]
 * Types: text, textarea, url, image, number, select, lines (one item per line), group, repeater.
 * A repeater marked 'list' holds rows the design keeps as plain lists ([label, value]). They are stored as
 * objects with the sub-field keys, and inc/data.php turns them back into lists in the sub-field order.
 * src: 'title' keeps the value in the post title, 'order' in the menu order.
 */
defined( 'ABSPATH' ) || exit;

function apex_f( string $k, string $t, string $l, array $more = [] ): array { return [ 'k' => $k, 't' => $t, 'l' => $l ] + $more; }
function apex_pair( string $k, string $l, string $a, string $b, array $more = [] ): array {
	return apex_f( $k, 'repeater', $l, $more + [ 'list' => true, 'f' => [ apex_f( 'a', 'text', $a ), apex_f( 'b', 'textarea', $b ) ] ] );
}
function apex_h2_f( string $k, string $l ): array {
	return apex_f( $k, 'group', $l, [ 'f' => [ apex_f( 'h2', 'text', 'Heading' ), apex_f( 'h2_em', 'text', 'Heading, second part', [ 'h' => 'The words after the heading' ] ) ] ] );
}
/** The icons the design can draw next to a care point (tools/tx_art.py). */
function apex_icons(): array {
	return [ 'talk' => 'Talk', 'glass' => 'Glass', 'noglass' => 'No alcohol', 'pill' => 'Pill', 'calendar' => 'Calendar', 'wash' => 'Wash', 'lips' => 'Lips', 'bowl' => 'Bowl', 'dumbbell' => 'Exercise', 'bed' => 'Bed', 'hand' => 'Hand', 'clock' => 'Clock' ];
}

function apex_schema( string $type ): array {
	static $S = null;
	if ( $S !== null ) return $S[ $type ] ?? [];
	$S = [];

	/* ---------- settings shared by every page, one copy per language ---------- */
	$S['settings'] = [
		apex_f( 'brand', 'text', 'Site name' ),
		apex_f( 'clinic', 'text', 'Clinic line', [ 'h' => 'Under the name in the footer, for example Apex Hospital & Clinics, Bangkok' ] ),
		apex_f( 'line_id', 'text', 'LINE ID', [ 'h' => 'With the @, for example @apexbeauty. The booking form opens a LINE chat with this account.' ] ),
		apex_f( 'phone', 'text', 'Phone', [ 'h' => 'As it should be shown, for example 080-500-0123' ] ),
		apex_f( 'permit', 'text', 'Advertising permit number', [ 'h' => 'From the สบส. approval. Shown in the footer once filled in.' ] ),
		apex_f( 'address', 'textarea', 'Address', [ 'h' => 'The head office address in the footer' ] ),
		apex_f( 'founded', 'text', 'Since line', [ 'h' => 'In the footer, for example Apex has looked after skin and faces since 1995.' ] ),
		apex_f( 'socials', 'repeater', 'Social accounts', [ 'list' => true, 'h' => 'Shown as icons in the footer, in this order', 'f' => [
			apex_f( 'k', 'select', 'Network', [ 'o' => [ 'facebook' => 'Facebook', 'instagram' => 'Instagram', 'tiktok' => 'TikTok', 'youtube' => 'YouTube', 'whatsapp' => 'WhatsApp', 'x' => 'X', 'line' => 'LINE' ] ] ),
			apex_f( 'n', 'text', 'Account name' ), apex_f( 'u', 'url', 'Link' ) ] ] ),
		apex_f( 'footer_note', 'textarea', 'Footer note' ),
	];

	/* ---------- home page, one copy per language ---------- */
	$S['home'] = [
		apex_f( 'seo_title', 'text', 'SEO title' ),
		apex_f( 'seo_desc', 'textarea', 'SEO description' ),
		apex_f( 'hero', 'group', 'Face planner', [ 'f' => [
			apex_f( 'kicker', 'text', 'Small line above the heading' ), apex_f( 'h1', 'text', 'Heading' ), apex_f( 'h1_em', 'text', 'Heading, second part' ),
			apex_f( 'sub', 'text', 'Line under the heading' ), apex_f( 'empty', 'text', 'Hint before an area is picked' ), apex_f( 'whole', 'text', 'Whole face button' ) ] ] ),
		apex_f( 'treatments', 'group', 'Treatments and prices', [ 'f' => [
			apex_f( 'h2', 'text', 'Heading' ), apex_f( 'h2_em', 'text', 'Heading, second part' ), apex_f( 'p', 'text', 'Line under the heading' ),
			apex_pair( 'halves', 'Column headings', 'Name', 'Second line', [ 'h' => 'Contour first, then Glow. Each treatment says which column it sits in.', 'fixed' => 2 ] ) ] ] ),
		apex_f( 'visit', 'group', 'Your visit', [ 'f' => [
			apex_f( 'h2', 'text', 'Heading' ), apex_f( 'h2_em', 'text', 'Heading, second part' ), apex_f( 'foot', 'text', 'Line under the steps' ),
			apex_f( 'steps', 'repeater', 'Steps', [ 'list' => true, 'h' => 'Five steps fill the row best', 'f' => [
				apex_f( 'icon', 'select', 'Icon', [ 'o' => [ 'talk' => 'Talk', 'tube' => 'Cream', 'needle' => 'Needle', 'ice' => 'Ice', 'cal' => 'Calendar' ] ] ),
				apex_f( 'h', 'text', 'Step' ), apex_f( 'p', 'textarea', 'Text' ), apex_f( 't', 'text', 'How long' ) ] ] ) ] ] ),
		apex_f( 'layers', 'group', 'Skin layers', [ 'f' => [
			apex_f( 'eyebrow', 'text', 'Small line above the heading' ), apex_f( 'h2', 'text', 'Heading' ), apex_f( 'h2_em', 'text', 'Heading, second part' ), apex_f( 'p', 'textarea', 'Line under the heading' ),
			apex_f( 'layers', 'repeater', 'Layers', [ 'list' => true, 'fixed' => 5, 'h' => 'Top to bottom. Each treatment says which layers it works in.', 'f' => [
				apex_f( 'k', 'text', 'Key', [ 'keep' => true ] ), apex_f( 'n', 'text', 'Name' ), apex_f( 'p', 'textarea', 'Text' ) ] ] ) ] ] ),
		apex_f( 'results', 'group', 'Before and after', [ 'f' => [
			apex_f( 'h2', 'text', 'Heading' ), apex_f( 'h2_em', 'text', 'Heading, second part' ),
			apex_f( 'set', 'select', 'Treatment shown', [ 'o' => 'treatments', 'h' => 'Its before and after cases go in the photo with the line' ] ),
			apex_f( 'p', 'textarea', 'Text' ), apex_pair( 'stats', 'Facts under the photos', 'Label', 'Value' ), apex_f( 'fine', 'text', 'Small print' ) ] ] ),
		apex_f( 'doctors', 'group', 'Doctors', [ 'h' => 'The doctors themselves are in Doctors and branches', 'f' => [
			apex_f( 'eyebrow', 'text', 'Small line above the heading' ), apex_f( 'h2', 'text', 'Heading' ), apex_f( 'h2_em', 'text', 'Heading, second part' ), apex_f( 'p', 'textarea', 'Line under the heading' ),
			apex_f( 'check', 'text', 'Licence check link text' ), apex_f( 'check_url', 'url', 'Licence check link', [ 'h' => 'The Medical Council search, https://checkmd.tmc.or.th/' ] ) ] ] ),
		apex_f( 'compare', 'group', 'Compare', [ 'f' => [
			apex_f( 'h2', 'text', 'Heading' ), apex_f( 'h2_em', 'text', 'Heading, second part' ),
			apex_f( 'a', 'select', 'First treatment picked', [ 'o' => 'treatments' ] ), apex_f( 'b', 'select', 'Second treatment picked', [ 'o' => 'treatments' ] ) ] ] ),
		apex_f( 'book', 'group', 'Book a consultation', [ 'f' => [
			apex_f( 'h2', 'text', 'Heading' ), apex_f( 'h2_em', 'text', 'Heading, second part' ), apex_f( 'p', 'textarea', 'Text' ), apex_f( 'fine', 'text', 'Small print under the button' ),
			apex_f( 'consent', 'text', 'Consent box', [ 'h' => 'The sentence beside the tick box people must tick before sending' ] ), apex_f( 'privacy', 'text', 'Privacy policy link', [ 'h' => 'Also used in the footer' ] ),
			apex_f( 'branch', 'text', 'Branch box label' ), apex_f( 'branch_any', 'text', 'Branch box, first choice', [ 'h' => 'For people who leave the branch to Apex' ] ),
			apex_f( 'find', 'text', 'Branch finder heading' ), apex_f( 'find_p', 'textarea', 'Branch finder text' ),
			apex_f( 'near', 'text', 'Nearest branch button' ), apex_f( 'search', 'text', 'Search box example', [ 'h' => 'A branch name shown in the empty box, for example Central Rama 9' ] ),
			apex_f( 'groups', 'repeater', 'Branch groups', [ 'list' => true, 'fixed' => 3, 'h' => 'The tabs above the branch list', 'f' => [ apex_f( 'g', 'text', 'Key', [ 'keep' => true ] ), apex_f( 'l', 'text', 'Tab' ) ] ] ) ] ] ),
	];

	/* ---------- treatments ---------- */
	$S['apex_tx'] = [
		apex_f( 'name', 'text', 'Name', [ 'src' => 'title' ] ),
		apex_f( 'key', 'text', 'Key', [ 'keep' => true, 'h' => 'Links the page to its before and after cases, the face planner and Compare. Set once by the import; do not change it.' ] ),
		apex_f( 'order', 'number', 'Order on the site', [ 'src' => 'order' ] ),
		apex_f( 'no', 'number', 'Number on the page' ),
		apex_f( 'half', 'select', 'Column', [ 'o' => [ 'Contour' => 'Contour (shape and lift)', 'Glow' => 'Glow (skin quality)' ] ] ),
		apex_f( 'sym', 'text', 'Symbol', [ 'h' => 'Two letters for the tile, for example Bt for Botox' ] ),
		apex_f( 'material', 'text', 'What it is made of', [ 'h' => 'Under the name on the tile, for example Botulinum toxin' ] ),
		apex_f( 'layers', 'lines', 'Skin layers it works in', [ 'h' => 'One per line, from: surface, dermis, fat, muscle, bone' ] ),
		apex_f( 'seo_title', 'text', 'SEO title' ), apex_f( 'seo_desc', 'textarea', 'SEO description' ),
		apex_f( 'hook', 'lines', 'Opening paragraphs', [ 'h' => 'One paragraph per line' ] ),
		apex_pair( 'facts', 'Facts beside the opening', 'Label', 'Value', [ 'h' => 'Four fill the box best' ] ),
		apex_f( 'price_from', 'text', 'Starting price', [ 'h' => 'For example 25,000 baht. Leave empty when the price is on request.' ] ),
		apex_f( 'price_note', 'text', 'Note under the price', [ 'h' => 'For example Apex promotion' ] ),
		apex_f( 'summary', 'group', 'Summary (home page, Compare, face planner)', [ 'f' => [
			apex_f( 'is', 'text', 'What it is' ), apex_f( 'for', 'text', 'Best for' ), apex_f( 'first', 'text', 'First change' ), apex_f( 'lasts', 'text', 'Lasts' ),
			apex_f( 'sessions', 'text', 'Sessions' ), apex_f( 'down', 'text', 'Downtime' ), apex_f( 'from', 'text', 'From' ) ] ] ),
		apex_f( 'lead', 'textarea', 'How it works, opening line' ),
		apex_f( 'how', 'repeater', 'How it works', [ 'list' => true, 'f' => [ apex_f( 'icon', 'text', 'Icon', [ 'h' => 'Leave empty' ] ), apex_f( 'h', 'text', 'Heading (not shown)' ), apex_f( 'p', 'textarea', 'Text' ) ] ] ),
		apex_f( 'not_for', 'repeater', 'Not suited for', [ 'list' => true, 'f' => [ apex_f( 'a', 'text', 'Heading' ), apex_f( 'b', 'textarea', 'Text' ), apex_f( 'h', 'text', 'Link', [ 'h' => 'Another treatment\'s page, for example filler.html. Leave empty for none.' ] ), apex_f( 'x', 'text', 'Link text' ) ] ] ),
		apex_f( 'face', 'repeater', 'Face areas', [ 'list' => true, 'h' => 'The area names link the treatment to the face planner: Forehead, Between the brows, Crow\'s feet, Under-eyes, Temples, Cheeks, Smile lines, Lips, Chin, Jawline, Neck, Whole face', 'f' => [
			apex_f( 'a', 'text', 'Area' ), apex_f( 'b', 'textarea', 'Amount' ), apex_f( 'c', 'text', 'Price for this area', [ 'h' => 'For example 12,900 baht a cc. Leave empty to show the starting price.' ] ) ] ] ),
		apex_pair( 'body', 'Body areas', 'Area', 'Amount' ),
		apex_f( 'areas_note', 'textarea', 'Note under the areas' ),
		apex_pair( 'fitting', 'Your visit', 'Step', 'Text' ),
		apex_pair( 'timeline', 'When you see results', 'When', 'What' ),
		apex_f( 'prices', 'group', 'Prices', [ 'f' => [
			apex_f( 'head', 'lines', 'Table headings', [ 'h' => 'One per line' ] ),
			apex_pair( 'rows', 'Table rows', 'Item', 'Price' ),
			apex_pair( 'invitations', 'Packages', 'Package', 'Price' ),
			apex_f( 'note', 'text', 'Note under the prices' ) ] ] ),
		apex_f( 'care', 'group', 'Before and after care', [ 'f' => [
			apex_f( 'before', 'repeater', 'Before', [ 'list' => true, 'f' => [ apex_f( 'icon', 'select', 'Icon', [ 'o' => apex_icons() ] ), apex_f( 'h', 'text', 'Heading' ), apex_f( 'p', 'textarea', 'Text' ) ] ] ),
			apex_f( 'after', 'repeater', 'After', [ 'list' => true, 'f' => [ apex_f( 'when', 'text', 'When' ), apex_f( 'items', 'repeater', 'Points', [ 'list' => true, 'f' => [ apex_f( 'icon', 'select', 'Icon', [ 'o' => apex_icons() ] ), apex_f( 'x', 'text', 'Text' ) ] ] ) ] ] ),
			apex_f( 'urgent', 'textarea', 'When to call the clinic straight away' ) ] ] ),
		apex_pair( 'faq', 'Questions', 'Question', 'Answer' ),
		apex_f( 'results', 'group', 'Before and after', [ 'h' => 'The photos are the Before and after cases for this treatment', 'f' => [
			apex_f( 'mode', 'select', 'Shown as', [ 'o' => [ '' => 'Not shown', 'slider' => 'Photo with a line to drag', 'gallery' => 'Photo grid' ] ] ),
			apex_f( 'labels', 'lines', 'Photo labels', [ 'h' => 'Two lines: the before label, then the after label' ] ),
			apex_f( 'caption', 'text', 'Line under the heading' ),
			apex_f( 'ar', 'text', 'Photo shape', [ 'h' => 'Width/height of the photos, for example 540/860' ] ) ] ] ),
		apex_f( 'sources', 'lines', 'Sources', [ 'h' => 'One per line' ] ),
	];

	/* ---------- before and after cases ---------- */
	$S['apex_case'] = [
		apex_f( 'title', 'text', 'Name', [ 'src' => 'title', 'h' => 'For the list only, for example Profhilo case 1' ] ),
		apex_f( 'tx', 'select', 'Treatment', [ 'o' => 'treatments' ] ),
		apex_f( 'order', 'number', 'Order', [ 'src' => 'order' ] ),
		apex_f( 'before', 'image', 'Before photo', [ 'h' => 'Leave empty for a photo grid case that is one picture' ] ),
		apex_f( 'after', 'image', 'After photo' ),
		apex_f( 'alt', 'text', 'Alt text' ),
	];

	/* ---------- Compare, one copy per language ---------- */
	$S['compare'] = [
		apex_f( 'rows', 'repeater', 'Rows', [ 'list' => true, 'fixed' => 7, 'h' => 'The row names. Each treatment\'s values are in its Summary.', 'f' => [ apex_f( 'k', 'text', 'Key', [ 'keep' => true ] ), apex_f( 'l', 'text', 'Row name' ) ] ] ),
		apex_f( 'pairs', 'repeater', 'Often compared', [ 'f' => [ apex_f( 'a', 'select', 'First', [ 'o' => 'treatments' ] ), apex_f( 'b', 'select', 'Second', [ 'o' => 'treatments' ] ), apex_f( 'note', 'textarea', 'What sets them apart' ) ] ] ),
	];

	/* ---------- face planner area names, one copy per language ---------- */
	$S['planner'] = [
		apex_f( 'zones', 'repeater', 'Areas', [ 'fixed' => 11, 'h' => 'The names on the buttons beside the 3D face. Where each sits on the face is fixed by the research behind it.', 'f' => [ apex_f( 'key', 'text', 'Key', [ 'keep' => true ] ), apex_f( 'label', 'text', 'Button' ) ] ] ),
	];
	/* ---------- doctors and branches, one copy per language ---------- */
	$S['clinic'] = [
		apex_f( 'doctors', 'repeater', 'Doctors', [ 'list' => true, 'h' => 'In the order shown on the home page. Each treatment page shows three doctors trained in it.', 'f' => [
			apex_f( 'slug', 'text', 'Key', [ 'keep' => true ] ), apex_f( 'name', 'text', 'Name' ), apex_f( 'nick', 'text', 'Nickname', [ 'h' => 'For example Dr. Yui' ] ),
			apex_f( 'role', 'text', 'Role', [ 'h' => 'For example Dermatologist' ] ), apex_f( 'school', 'text', 'Medical school' ), apex_f( 'lic', 'text', 'Licence number' ),
			apex_f( 'treats', 'lines', 'Treatments', [ 'h' => 'Treatment keys, one per line, for example botox' ] ), apex_f( 'img', 'image', 'Photo', [ 'h' => 'Portrait, 480 by 600' ] ) ] ] ),
		apex_f( 'branches', 'repeater', 'Branches', [ 'list' => true, 'h' => 'The branch finder and the branch box on the booking form', 'f' => [
			apex_f( 'name', 'text', 'Name' ), apex_f( 'group', 'select', 'Group', [ 'o' => [ 'bangkok' => 'Bangkok and nearby', 'province' => 'Other provinces', 'hospital' => 'Surgery hospitals' ] ] ),
			apex_f( 'phone', 'text', 'Phone' ), apex_f( 'map', 'url', 'Google Maps link' ),
			apex_f( 'lat', 'text', 'Latitude', [ 'h' => 'For Nearest to me, for example 13.758714' ] ), apex_f( 'lng', 'text', 'Longitude', [ 'h' => 'For example 100.566306' ] ) ] ] ),
	];
	/* ---------- privacy policy, one copy per language ---------- */
	$S['privacy'] = [
		apex_f( 'seo_title', 'text', 'SEO title' ), apex_f( 'seo_desc', 'textarea', 'SEO description' ), apex_f( 'h1', 'text', 'Heading' ),
		apex_f( 'blocks', 'repeater', 'Text', [ 'list' => true, 'h' => 'One block per paragraph, heading or list. Inside the text, **two stars** make bold and [text](https://link) makes a link.', 'f' => [
			apex_f( 't', 'select', 'Kind', [ 'o' => [ 'p' => 'Paragraph', 'h2' => 'Heading', 'h3' => 'Small heading', 'list' => 'List (one item per line)' ] ] ),
			apex_f( 'x', 'textarea', 'Text' ) ] ] ),
	];
	return $S[ $type ] ?? [];
}
