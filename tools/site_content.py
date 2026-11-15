# Site-wide settings and the home page text. The builders read this file, and wordpress/tools/export_content.py
# packs it with tx_content.py and layout.py into the WordPress import, so the static site and WordPress show the same words.
SETTINGS = {
    'brand': 'Apex Contour and Glow',
    'clinic': 'Apex Hospital & Clinics, Bangkok',
    'line_id': '@apexbeauty',
    'phone': '080-500-0123',
    'permit': '',   # advertising permit number from the สบส. approval, shown in the footer once Apex has it
    'footer_note': 'Individual results vary. Treatments are done by licensed doctors after a consultation.',
}

HOME = {
    'seo_title': 'Apex Contour and Glow | Injectables at Apex Hospital & Clinics',
    'seo_desc': 'Botox, filler, HArmonyCa, Radiesse, Sculptra, Juvelook, Profhilo, Skinvive, Vitaran, Nucleofill, Celeb Skin and meso at Apex Hospital & Clinics, Bangkok, with prices.',
    'hero': {'kicker': 'Apex Hospital & Clinics, Bangkok', 'h1': 'Injectables', 'h1_em': 'at Apex',
             'sub': 'Tap an area of the face to see its treatments and prices.',
             'empty': 'Tap an area. Drag the face to turn it.', 'whole': 'The whole face'},
    'treatments': {'h2': 'Treatments', 'h2_em': 'and prices', 'p': 'Starting prices. Your doctor confirms the amount at the consultation.',
                   'halves': [['Contour', 'shape and lift'], ['Glow', 'skin quality']]},
    'visit': {'h2': 'Your', 'h2_em': 'visit', 'foot': 'A visit takes about 1 to 1.5 hours.',
              'steps': [
                  ['talk', 'Consultation', 'Your doctor looks at your face, asks what bothers you and picks the treatment and the amount.', '15 to 20 minutes'],
                  ['tube', 'Numbing cream', 'The cream goes on first and sits before your doctor starts.', '20 to 30 minutes'],
                  ['needle', 'Treatment', 'A fine needle at each point, a few seconds each. Your doctor tells you how many points before starting.', '10 to 30 minutes'],
                  ['ice', 'Ice and rest', 'A little swelling or a small bruise can show for a few days.', 'About 10 minutes'],
                  ['cal', 'Follow-up', 'Your doctor checks the result with you and tells you when to come back.', '2 weeks later'],
              ]},
    'results': {'h2': 'Before', 'h2_em': 'and after', 'set': 'profhilo',
                'p': 'Profhilo at Apex, one month after the first session. Drag the line to compare.',
                'stats': [['Sessions', 'Two, a month apart'], ['Lasts', '6 to 12 months'], ['From', '25,000 baht']],
                'fine': 'Individual results vary.'},
    'compare': {'h2': 'Compare', 'h2_em': 'two treatments', 'a': 'botox', 'b': 'filler'},
    'book': {'h2': 'Book a', 'h2_em': 'consultation', 'p': 'Send your details on LINE or call, and Apex sets a day with you.',
             'fine': 'LINE opens with your message filled in. Press send there.'},
}
