<?php
/**
 * The fields of every content type. The keys are the design's own data keys (tools/tx_content.py,
 * tools/site_content.py, tools/layout.py), so the admin forms, the importer and the data layer read one list.
 *
 * Field: [ 'k' => key, 't' => type, 'l' => label, 'h' => help, 'f' => sub-fields, 'o' => choices, 'src' => storage ]
 * Types: text, textarea, url, image, number, select, lines (one item per line), group, repeater.
 * A repeater of rows that the design keeps as plain lists ([label, value]) is stored as a list of objects
 * with the sub-field keys; inc/data.php turns them back into lists in the same order.
 * src: 'title' keeps the value in the post title, 'order' in the menu order.
 */
defined( 'ABSPATH' ) || exit;

function apex_f( string $k, string $t, string $l, array $more = [] ): array { return [ 'k' => $k, 't' => $t, 'l' => $l ] + $more; }
function apex_pair( string $k, string $l, string $a, string $b, array $more = [] ): array {
	return apex_f( $k, 'repeater', $l, $more + [ 'f' => [ apex_f( 'a', 'text', $a ), apex_f( 'b', 'textarea', $b ) ] ] );
}
function apex_h2( string $k, string $l ): array {
	return apex_f( $k, 'group', $l, [ 'f' => [ apex_f( 'h2', 'text', 'Heading' ), apex_f( 'h2_em', 'text', 'Heading, gold part', [ 'h' => 'The words after the heading, shown in gold italic' ] ) ] ] );
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
		apex_f( 'footer_note', 'textarea', 'Footer note' ),
	];

	/* ---------- home page, one copy per language ---------- */
	$S['home'] = [
		apex_f( 'seo_title', 'text', 'SEO title' ),
		apex_f( 'seo_desc', 'textarea', 'SEO description' ),
		apex_f( 'hero', 'group', 'Face planner', [ 'f' => [
			apex_f( 'kicker', 'text', 'Small line above the heading' ), apex_f( 'h1', 'text', 'Heading' ), apex_f( 'h1_em', 'text', 'Heading, gold part' ),
			apex_f( 'sub', 'text', 'Line under the heading' ), apex_f( 'empty', 'text', 'Hint before an area is picked' ), apex_f( 'whole', 'text', 'Whole face button' ) ] ] ),
		apex_f( 'treatments', 'group', 'Treatments and prices', [ 'f' => [
			apex_f( 'h2', 'text', 'Heading' ), apex_f( 'h2_em', 'text', 'Heading, gold part' ), apex_f( 'p', 'text', 'Line under the heading' ),
			apex_pair( 'halves', 'Column headings', 'Name', 'Second line', [ 'h' => 'Contour first, then Glow. Each treatment says which column it sits in.', 'fixed' => 2 ] ) ] ] ),
		apex_f( 'visit', 'group', 'Your visit', [ 'f' => [
			apex_f( 'h2', 'text', 'Heading' ), apex_f( 'h2_em', 'text', 'Heading, gold part' ), apex_f( 'foot', 'text', 'Line under the steps' ),
			apex_f( 'steps', 'repeater', 'Steps', [ 'h' => 'Five steps fill the row best', 'f' => [
				apex_f( 'icon', 'select', 'Icon', [ 'o' => [ 'talk' => 'Talk', 'tube' => 'Cream', 'needle' => 'Needle', 'ice' => 'Ice', 'cal' => 'Calendar' ] ] ),
				apex_f( 'h', 'text', 'Step' ), apex_f( 'p', 'textarea', 'Text' ), apex_f( 't', 'text', 'How long' ) ] ] ) ] ] ),
		apex_f( 'results', 'group', 'Before and after', [ 'f' => [
			apex_f( 'h2', 'text', 'Heading' ), apex_f( 'h2_em', 'text', 'Heading, gold part' ),
			apex_f( 'set', 'select', 'Treatment shown', [ 'o' => 'treatments', 'h' => 'Its before and after cases go in the mirror' ] ),
			apex_f( 'p', 'textarea', 'Text' ), apex_pair( 'stats', 'Facts under the photos', 'Label', 'Value' ), apex_f( 'fine', 'text', 'Small print' ) ] ] ),
		apex_f( 'compare', 'group', 'Compare', [ 'f' => [
			apex_f( 'h2', 'text', 'Heading' ), apex_f( 'h2_em', 'text', 'Heading, gold part' ),
			apex_f( 'a', 'select', 'First treatment picked', [ 'o' => 'treatments' ] ), apex_f( 'b', 'select', 'Second treatment picked', [ 'o' => 'treatments' ] ) ] ] ),
		apex_f( 'book', 'group', 'Book a consultation', [ 'f' => [
			apex_f( 'h2', 'text', 'Heading' ), apex_f( 'h2_em', 'text', 'Heading, gold part' ), apex_f( 'p', 'textarea', 'Text' ), apex_f( 'fine', 'text', 'Small print under the button' ) ] ] ),
	];

	/* ---------- treatments ---------- */
	$S['apex_tx'] = [
		apex_f( 'name', 'text', 'Name', [ 'src' => 'title' ] ),
		apex_f( 'key', 'text', 'Key', [ 'keep' => true, 'h' => 'Links the page to its before and after cases, the face planner and Compare. Set once by the import; do not change it.' ] ),
		apex_f( 'order', 'number', 'Order on the site', [ 'src' => 'order' ] ),
		apex_f( 'no', 'number', 'Number on the page' ),
		apex_f( 'half', 'select', 'Column', [ 'o' => [ 'Contour' => 'Contour (shape and lift)', 'Glow' => 'Glow (skin quality)' ] ] ),
		apex_f( 'seo_title', 'text', 'SEO title' ), apex_f( 'seo_desc', 'textarea', 'SEO description' ),
		apex_f( 'hook', 'lines', 'Opening paragraphs', [ 'h' => 'One paragraph per line' ] ),
		apex_pair( 'facts', 'Facts beside the opening', 'Label', 'Value', [ 'h' => 'Four fill the box best' ] ),
		apex_f( 'price_from', 'text', 'Starting price', [ 'h' => 'For example 25,000 baht. Leave empty when the price is on request.' ] ),
		apex_f( 'price_note', 'text', 'Note under the price', [ 'h' => 'For example Apex promotion' ] ),
		apex_f( 'summary', 'group', 'Summary (home page, Compare, face planner)', [ 'f' => [
			apex_f( 'is', 'text', 'What it is' ), apex_f( 'for', 'text', 'Best for' ), apex_f( 'first', 'text', 'First change' ), apex_f( 'lasts', 'text', 'Lasts' ),
			apex_f( 'sessions', 'text', 'Sessions' ), apex_f( 'down', 'text', 'Downtime' ), apex_f( 'from', 'text', 'From' ) ] ] ),
		apex_f( 'lead', 'textarea', 'How it works, opening line' ),
		apex_f( 'how', 'repeater', 'How it works', [ 'f' => [ apex_f( 'icon', 'text', 'Icon', [ 'h' => 'Leave empty' ] ), apex_f( 'h', 'text', 'Heading (not shown)' ), apex_f( 'p', 'textarea', 'Text' ) ] ] ),
		apex_f( 'not_for', 'repeater', 'Not suited for', [ 'f' => [ apex_f( 'a', 'text', 'Heading' ), apex_f( 'b', 'textarea', 'Text' ), apex_f( 'h', 'text', 'Link', [ 'h' => 'Another treatment\'s page, for example filler.html. Leave empty for none.' ] ), apex_f( 'x', 'text', 'Link text' ) ] ] ),
		apex_pair( 'face', 'Face areas', 'Area', 'Amount', [ 'h' => 'The area names link the treatment to the face planner: Forehead, Between the brows, Crow\'s feet, Under-eyes, Temples, Cheeks, Smile lines, Lips, Chin, Jawline, Neck, Whole face' ] ),
		apex_pair( 'body', 'Body areas', 'Area', 'Amount' ),
		apex_f( 'areas_note', 'textarea', 'Note under the areas' ),
		apex_pair( 'fitting', 'Your visit', 'Step', 'Text' ),
		apex_pair( 'timeline', 'When you see results', 'When', 'What' ),
		apex_f( 'prices', 'group', 'Prices', [ 'f' => [
			apex_f( 'head', 'lines', 'Table headings', [ 'h' => 'One per line' ] ),
			apex_f( 'rows', 'repeater', 'Table rows', [ 'h' => 'One cell per line', 'f' => [ apex_f( 'cells', 'lines', 'Cells' ) ] ] ),
			apex_pair( 'invitations', 'Packages', 'Package', 'Price' ),
			apex_f( 'note', 'text', 'Note under the prices' ) ] ] ),
		apex_f( 'care', 'group', 'Before and after care', [ 'f' => [
			apex_f( 'before', 'repeater', 'Before', [ 'f' => [ apex_f( 'icon', 'select', 'Icon', [ 'o' => apex_icons() ] ), apex_f( 'h', 'text', 'Heading' ), apex_f( 'p', 'textarea', 'Text' ) ] ] ),
			apex_f( 'after', 'repeater', 'After', [ 'f' => [ apex_f( 'when', 'text', 'When' ), apex_f( 'items', 'repeater', 'Points', [ 'f' => [ apex_f( 'icon', 'select', 'Icon', [ 'o' => apex_icons() ] ), apex_f( 'x', 'text', 'Text' ) ] ] ) ] ] ),
			apex_f( 'urgent', 'textarea', 'When to call the clinic straight away' ) ] ] ),
		apex_pair( 'faq', 'Questions', 'Question', 'Answer' ),
		apex_f( 'results', 'group', 'Before and after', [ 'h' => 'The photos are the Before and after cases for this treatment', 'f' => [
			apex_f( 'mode', 'select', 'Shown as', [ 'o' => [ '' => 'Not shown', 'slider' => 'Mirror with a line to drag', 'gallery' => 'Photo grid' ] ] ),
			apex_f( 'labels', 'lines', 'Mirror labels', [ 'h' => 'Two lines: the before label, then the after label' ] ),
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
		apex_f( 'rows', 'repeater', 'Rows', [ 'fixed' => 7, 'h' => 'The row names. Each treatment\'s values are in its Summary.', 'f' => [ apex_f( 'k', 'text', 'Key', [ 'keep' => true ] ), apex_f( 'l', 'text', 'Row name' ) ] ] ),
		apex_f( 'pairs', 'repeater', 'Often compared', [ 'f' => [ apex_f( 'a', 'select', 'First', [ 'o' => 'treatments' ] ), apex_f( 'b', 'select', 'Second', [ 'o' => 'treatments' ] ), apex_f( 'note', 'textarea', 'What sets them apart' ) ] ] ),
	];

	/* ---------- face planner area names, one copy per language ---------- */
	$S['planner'] = [
		apex_f( 'zones', 'repeater', 'Areas', [ 'fixed' => 11, 'h' => 'The names on the buttons beside the 3D face. Where each sits on the face is fixed by the research behind it.', 'f' => [ apex_f( 'key', 'text', 'Key', [ 'keep' => true ] ), apex_f( 'label', 'text', 'Button' ) ] ] ),
	];
	return $S[ $type ] ?? [];
}
