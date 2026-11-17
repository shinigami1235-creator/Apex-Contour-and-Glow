# Site-wide settings and the home page text. The builders read this file, and wordpress/tools/export_content.py
# packs it with tx_content.py and layout.py into the WordPress import, so the static site and WordPress show the same words.
SETTINGS = {
    'brand': 'Apex Contour and Glow',
    'clinic': 'Apex Hospital & Clinics, Bangkok',
    'line_id': '@apexbeauty',
    'phone': '080-500-0123',
    'permit': '',   # advertising permit number from the สบส. approval, shown in the footer once Apex has it
    'footer_note': 'Individual results vary. Treatments are done by licensed doctors after a consultation.',
    'address': '28/15 Sukhumvit Villa, Sukhumvit 36, Khlong Tan, Khlong Toei, Bangkok 10110',
    'founded': 'Apex has looked after skin and faces since 1995.',
    # the clinic's accounts, from apexmedicalcenter.co.th: icon, name, link
    'socials': [['facebook', 'APEX Hospital & Beauty Clinic', 'https://www.facebook.com/ApexProfoundBeauty/'],
                ['instagram', 'apexbeauty', 'https://www.instagram.com/apexbeauty/'],
                ['tiktok', 'apex.laser', 'https://www.tiktok.com/@apex.laser'],
                ['youtube', 'Apex Beauty Clinic', 'https://www.youtube.com/@Apex.beautyclinic'],
                ['whatsapp', '+66 85 000 2001', 'https://wa.me/66850002001']],
}

HOME = {
    'seo_title': 'Apex Contour and Glow | Injectables at Apex Hospital & Clinics',
    'seo_desc': 'Botox, filler, HArmonyCa, Radiesse, Sculptra, Juvelook, Profhilo, Skinvive, Vitaran, Nucleofill, Celeb Skin and meso at Apex Hospital & Clinics, Bangkok, with prices.',
    'hero': {'kicker': 'Apex Hospital & Clinics, Bangkok', 'h1': 'Apex Contour and Glow', 'h1_em': '',
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
             'fine': 'LINE opens with your message filled in. Press send there.',
             'consent': 'I agree to Apex keeping these details to arrange my visit.', 'privacy': 'Privacy policy',
             'branch': 'Branch', 'branch_any': 'The one Apex suggests',
             'find': 'Find a branch', 'find_p': 'Call the branch nearest you, or pick it in the form and Apex books you in there.',
             'near': 'Nearest to me', 'more': 'Show all branches', 'search': 'Rama 9',
             'groups': [['bangkok', 'Bangkok and nearby'], ['province', 'Other provinces'], ['hospital', 'Surgery hospitals']]},
    'doctors': {'eyebrow': 'Your doctors', 'h2': 'Doctors trained in', 'h2_em': 'injectables',
                'p': 'Every treatment is done by a licensed Apex doctor. Each card shows the doctor\'s licence number and the treatments they trained in.',
                'check': 'Check a licence with the Medical Council', 'check_url': 'https://checkmd.tmc.or.th/'},
}

# Apex's privacy policy for customers (the same text as apexsurgeryhospital.com), with this site's booking form and cookie banner added.
# Blocks: [kind, text]; kind is p, h2, h3 or list (one item per line). **bold** and [text](link) work inside the text.
PRIVACY = {
 "seo_title": "Privacy policy | Apex Contour and Glow",
 "seo_desc": "How Apex collects, uses and protects your personal data under the Thai Personal Data Protection Act, and how to use your rights.",
 "h1": "Privacy policy",
 "blocks": [
  [
   "p",
   "APEX Medical Center Co., Ltd. recognizes the importance of the protection of your personal data. This Privacy Policy explains our practices regarding the collection, use or disclosure of personal data including other rights of the Data Subjects in accordance with the Personal Data Protection Laws."
  ],
  [
   "h2",
   "Collection of Personal Data"
  ],
  [
   "p",
   "We will collect your personal data that receive directly from you as following:"
  ],
  [
   "list",
   "your account registration\ntelephone\nemail address"
  ],
  [
   "h2",
   "Types of Data Collected"
  ],
  [
   "list",
   "**Personal data** such as name, surname, age, date of birth, nationality, identification card, passport, etc.\n**Contact information** such as address, telephone number, e-mail address, etc.\n**Account details** such as username, password, transactions history, etc.\n**Proof of identity** such as copy of identification card, copy of passport, etc.\n**Transaction and Financial information** such as purchase history, credit card details, bank account, etc.\n**Medical Record** such as recording observations and administration of drugs and therapies, orders for the administration of drugs and therapies, test results, x-rays, reports, etc.\n**Technical data** such as IP address, Cookie ID, Activity Log, etc.\n**Other** such as photo, video, and other information that is considered personal data under the Personal Data Protection Laws."
  ],
  [
   "h2",
   "Children"
  ],
  [
   "p",
   "If you are under the age of 20 or having legal restrictions, we may collect use or disclose your personal data. We require your parents or guardian to be aware and provide consent to us or allowed by applicable laws. If we become aware that we have collected personal data from children without verification of parental consent, we take steps to remove that information from our servers."
  ],
  [
   "h2",
   "Storage of Data"
  ],
  [
   "list",
   "We store your personal data as hard copy and soft copy.\nWe store your personal data by using the following systems:"
  ],
  [
   "list",
   "Our server in Thailand\nOur server outside of Thailand"
  ],
  [
   "h2",
   "Use of Data"
  ],
  [
   "p",
   "We use the collected data for various purposes:"
  ],
  [
   "list",
   "To create and manage accounts\nTo provide products or services\nTo improve products, services, or user experiences\nTo share and manage information within organization\nTo conduct marketing activities and promotions\nTo provide after-sales services\nTo gather user's feedback\nTo process payments of products or services\nTo comply with our Terms and Conditions\nTo comply with laws, rules, and regulatory authorities"
  ],
  [
   "h2",
   "Data Retention"
  ],
  [
   "p",
   "We will retain your personal data for as long as necessary during the period you are a customer or under relationship with us, or for as long as necessary in connection with the purposes set out in this Privacy Policy, unless law requires or permits a longer retention period. We will erase, destroy or anonymize your personal data when it is no longer necessary or when the period lapses."
  ],
  [
   "h2",
   "Data Subject Rights"
  ],
  [
   "p",
   "Subject to the Personal Data Protection Laws thereof, you may exercise any of these rights in the following:"
  ],
  [
   "h3",
   "Withdrawal of consent"
  ],
  [
   "p",
   "If you have given consent to us to collect, use or disclose your personal data whether before or after the effective date of the Personal Data Protection Laws, you have the right to withdraw such consent at any time throughout the period your personal data available to us, unless it is restricted by laws or you are still under beneficial contract."
  ],
  [
   "h3",
   "Data access"
  ],
  [
   "p",
   "You have the right to access your personal data that is under our responsibility; to request us to make a copy of such data for you; and to request us to reveal as to how we obtain your personal data."
  ],
  [
   "h3",
   "Data portability"
  ],
  [
   "p",
   "You have the right to obtain your personal data if we organize such personal data in automatic machine-readable or usable format and can be processed or disclosed by automatic means; to request us to send or transfer the personal data in such format directly to other data controllers if doable by automatic means; and to request to obtain the personal data in such format sent or transferred by us directly to other data controller unless not technically feasible."
  ],
  [
   "h3",
   "Objection"
  ],
  [
   "p",
   "You have the right to object to collection, use or disclosure of your personal data at any time if such doing is conducted for legitimate interests of us, corporation or individual which is within your reasonable expectation; or for carrying out public tasks."
  ],
  [
   "h3",
   "Data erasure or destruction"
  ],
  [
   "p",
   "You have the right to request us to erase, destroy or anonymize your personal data if you believe that the collection, use or disclosure of your personal data is against relevant laws; or retention of the data by us is no longer necessary in connection with related purposes under this Privacy Policy; or when you request to withdraw your consent or to object to the processing as earlier described."
  ],
  [
   "h3",
   "Suspension"
  ],
  [
   "p",
   "You have the right to request us to suspend processing your personal data during the period where we examine your rectification or objection request; or when it is no longer necessary and we must erase or destroy your personal data pursuant to relevant laws but you instead request us to suspend the processing."
  ],
  [
   "h3",
   "Rectification"
  ],
  [
   "p",
   "You have the right to rectify your personal data to be updated, complete and not misleading."
  ],
  [
   "h3",
   "Complaint lodging"
  ],
  [
   "p",
   "You have the right to complain to competent authorities pursuant to relevant laws if you believe that the collection, use or disclosure of your personal data is violating or not in compliance with relevant laws."
  ],
  [
   "p",
   "You can exercise these rights as the Data Subject by contacting our Data Protection Officer as mentioned below. We will notify the result of your request within 30 days upon receipt of such request. If we deny the request, we will inform you of the reason via SMS, email address, telephone, registered mail (if applicable)."
  ],
  [
   "h2",
   "The booking form on this site"
  ],
  [
   "p",
   "The booking form asks for your name, phone number, the treatment you are interested in, the branch you prefer and a day that suits you. We keep these details to arrange your visit and delete them after 365 days. Sending the form also opens LINE with the same details filled in, and anything you send in LINE is covered by LINE's own privacy policy."
  ],
  [
   "h2",
   "Cookies"
  ],
  [
   "p",
   "To enrich and perfect your experience, we use cookies or similar technologies to display personalized content, appropriate advertising and store your preferences on your computer. We use cookies to identify and track visitors, their usage of our website and their website access preferences. If you do not wish to have cookies placed on your computer you should set their browsers to refuse cookies before using our website."
  ],
  [
   "p",
   "This site asks before it sets analytics or advertising cookies. \"Cookie settings\" at the foot of every page changes your choice."
  ],
  [
   "h2",
   "Data Security"
  ],
  [
   "p",
   "We endeavor to protect your personal data by establishing security measures in accordance with the principles of confidentiality, integrity, and availability to prevent loss, unauthorized or unlawful access, destruction, use, alteration, or disclosure including administrative safeguard, technical safeguard, physical safeguard and access controls."
  ],
  [
   "h2",
   "Data Breach Notification"
  ],
  [
   "p",
   "We will notify the Office of the Personal Data Protection Committee without delay and, where feasible, within 72 hours after having become aware of it, unless such personal data breach is unlikely to result in a risk to the rights and freedoms of you. If the personal data breach is likely to result in a high risk to the rights and freedoms of you, we will also notify the personal data breach and the remedial measures to you without delay through our website, SMS, email address, telephone or registered mail (if applicable)."
  ],
  [
   "h2",
   "Changes to this Privacy Policy"
  ],
  [
   "list",
   "We may change this Privacy Policy from time to time. Any changes of this Privacy Policy, we encourage you to frequently check on our website.\nThis Privacy Policy was last updated and effective on 31st May 2022"
  ],
  [
   "h2",
   "Links to Other Sites"
  ],
  [
   "p",
   "The purpose of this Privacy Policy is to offer products or services and use of our website. Any websites from other domains found on our site is subject to their privacy policy which is not related to us."
  ],
  [
   "h2",
   "Contact Information"
  ],
  [
   "p",
   "If you have any questions about this Privacy Policy or would like to exercise your rights, you can contact us by using the following details:"
  ],
  [
   "h2",
   "Data Controller"
  ],
  [
   "list",
   "**Apex Medical Center Co., Ltd.**\n28/15 Sukhumvit Villa, Sukhumvit 36Rd., Klongton, Klongteoi, Bangkok 10110\nE-mail : [marcom@apexprofoundbeauty.com](mailto:marcom@apexprofoundbeauty.com)\nWebsite : [www.apexmedicalcenter.co.th](https://www.apexmedicalcenter.co.th/)\nPhone : [022584353](tel:022584353)"
  ],
  [
   "h2",
   "Data Protection Officer"
  ],
  [
   "list",
   "Miss Techinee Maikantha\n28/15 Sukhumvit Villa, Sukhumvit 36 Rd., Klongton, Klongteoi, Bangkok 10110\nE-mail : [techinee.pos@apexmedicalcenter.co.th](mailto:techinee.pos@apexmedicalcenter.co.th)"
  ]
 ]
}

# Each treatment's short symbol, what it is made of, and the layers of the face it works in (keys of LAYERS).
# The depths are the usual ones from each product's instructions; the doctor picks the depth for each point.
TAGS = {
    'botox':      ('Bt', 'Botulinum toxin', ['muscle']),
    'filler':     ('Ha', 'Hyaluronic acid gel', ['fat', 'bone']),
    'harmonyca':  ('Hc', 'HA with calcium hydroxylapatite', ['fat']),
    'radiesse':   ('Ra', 'Calcium hydroxylapatite', ['fat', 'bone']),
    'sculptra':   ('Sc', 'Poly-L-lactic acid', ['fat', 'bone']),
    'juvelook':   ('Jv', 'PDLLA with HA', ['dermis']),
    'profhilo':   ('Pf', 'Hyaluronic acid', ['fat']),
    'skinvive':   ('Sv', 'Hyaluronic acid microdroplets', ['dermis']),
    'vitaran':    ('Vt', 'Polynucleotides', ['dermis']),
    'nucleofill': ('Nf', 'PDRN polynucleotides', ['dermis']),
    'celeb-skin': ('Cs', 'Facial meso program', ['dermis']),
    'meso':       ('Ms', 'HA, vitamins and nutrients', ['dermis']),
    'bio-lift':   ('Gr', 'Liquid polycaprolactone (PCL)', ['dermis', 'fat']),
    'rejuran':    ('Rj', 'Polynucleotides from salmon', ['dermis']),
}

# The layers of the face, from the surface down, for the Skin layers section of the home page.
LAYERS = {
    'h2': 'Skin', 'h2_em': 'layers', 'eyebrow': 'How deep each one works',
    'p': 'Each treatment works at its own depth. Pick a layer to see what goes there.',
    'layers': [
        ['surface', 'Surface', 'The outer skin. Nothing is injected here; it shows the change made underneath.'],
        ['dermis', 'Dermis', 'The layer that holds collagen and water. Skin boosters go here for texture, fine lines and glow.'],
        ['fat', 'Fat', 'The fat pads that give the face its fullness. Volume and lifting treatments go here.'],
        ['muscle', 'Muscle', 'The muscles that pull the skin into lines. Botox relaxes them.'],
        ['bone', 'Bone', 'The cheekbones, jaw and chin. Filler placed on the bone shapes and lifts from the base.'],
    ],
}
HOME['layers'] = LAYERS   # the Skin layers section of the home page


# Doctors and branches, taken from Apex Medical Center's own site (apexmedicalcenter.co.th, Nov 2026).
# doctors: key, name, nickname, role, medical school, licence number, treatments they are trained in, photo.
# The treatments are the keys of tools/tx_content.py; a doctor shows on the pages of the treatments listed.
# branches: name, group (hospital, bangkok or province), phone, Google Maps link, latitude, longitude.
CLINIC = {
 'doctors': [['dr-nantapat-supapannachart', 'Dr. Nantapat Supapannachart', 'Dr. Yui', 'Founder, dermatologist', 'Mahidol University, Siriraj Hospital', '12117', [], 'assets/img/doctors/dr-nantapat-supapannachart.webp'],
   ['dr-akaluck-thammasunthorn',
    'Dr. Akaluck Thammasunthorn',
    'Dr. Ake',
    'Aesthetic doctor',
    'Phramongkutklao College of Medicine, Mahidol University',
    '21330',
    ['botox', 'filler'],
    'assets/img/doctors/dr-akaluck-thammasunthorn.webp'],
   ['dr-jira-kunakornwong', 'Dr. Jira Kunakornwong', 'Dr. O', 'Dermatologist', 'Siriraj Hospital, Mahidol University', '41082', ['botox', 'filler'], 'assets/img/doctors/dr-jira-kunakornwong.webp'],
   ['dr-kornchai-phuchareonkul', 'Dr. Kornchai Phuchareonkul', 'Dr. Nay', 'Aesthetic doctor', 'Mahidol University', '41660', ['botox', 'filler'], 'assets/img/doctors/dr-kornchai-phuchareonkul.webp'],
   ['dr-porranee-chatthani',
    'Dr. Porranee Chatthani',
    'Dr. Aeng',
    'Dermatologist',
    'Prince of Songkla University',
    '57758',
    ['botox', 'filler', 'sculptra', 'profhilo', 'skinvive', 'rejuran', 'bio-lift', 'celeb-skin'],
    'assets/img/doctors/dr-porranee-chatthani.webp'],
   ['dr-vatunyou-tachandee',
    'Dr. Vatunyou Tachandee',
    'Dr. Big',
    'Aesthetic doctor',
    'Chiang Mai University',
    '42868',
    ['botox', 'filler', 'radiesse', 'sculptra', 'bio-lift'],
    'assets/img/doctors/dr-vatunyou-tachandee.webp'],
   ['dr-charin-chadbuphaphan',
    'Dr. Charin Chadbuphaphan',
    'Dr. Mac',
    'Dermatologist',
    'Mae Fah Luang University',
    '59107',
    ['botox', 'filler', 'radiesse', 'sculptra', 'vitaran', 'nucleofill', 'rejuran', 'bio-lift'],
    'assets/img/doctors/dr-charin-chadbuphaphan.webp'],
   ['dr-tanakorn-leelasoorayakan', 'Dr. Tanakorn Leelasoorayakan', 'Dr. Got', 'Dermatologist', 'Mae Fah Luang University', '59570', ['botox', 'filler'], 'assets/img/doctors/dr-tanakorn-leelasoorayakan.webp'],
   ['dr-woraporn-prateepchaiboon', 'Dr. Woraporn Prateepchaiboon', 'Dr. Ann', 'Dermatologist', 'Mae Fah Luang University', '66171', ['botox', 'filler'], 'assets/img/doctors/dr-woraporn-prateepchaiboon.webp'],
   ['dr-hatainoot-mudpin',
    'Dr. Hatainoot Mudpin',
    'Dr. Aom',
    'Dermatologist',
    'Chiang Mai University',
    '35773',
    ['botox', 'filler', 'profhilo', 'skinvive', 'rejuran', 'celeb-skin'],
    'assets/img/doctors/dr-hatainoot-mudpin.webp'],
   ['dr-prawit-namthongthai', 'Dr. Prawit Namthongthai', 'Dr. Keng', 'Dermatologist', 'Siriraj Hospital, Mahidol University', '31879', ['botox', 'filler'], 'assets/img/doctors/dr-prawit-namthongthai.webp'],
   ['dr-suwannee-thuspittaya', 'Dr. Suwannee Thuspittaya', 'Dr. Jeng', 'Dermatologist', 'Mahidol University', '36179', ['botox', 'filler', 'meso', 'celeb-skin'], 'assets/img/doctors/dr-suwannee-thuspittaya.webp'],
   ['dr-chutinun-suramonsikarn', 'Dr. Chutinun Suramonsikarn', 'Dr. Priew', 'Dermatologist', 'Rangsit University', '45015', ['botox', 'filler'], 'assets/img/doctors/dr-chutinun-suramonsikarn.webp'],
   ['dr-thanatporn-lapatharakul', 'Dr. Thanatporn Lapatharakul', 'Dr. Ann', 'Aesthetic doctor', 'Anti-aging and regenerative medicine', '66289', ['filler'], 'assets/img/doctors/dr-thanatporn-lapatharakul.webp'],
   ['dr-petch-suriyothin', 'Dr. Petch Suriyothin', 'Dr. Petch', 'Dermatologist', 'Chiang Mai University', '39938', ['botox', 'filler', 'skinvive'], 'assets/img/doctors/dr-petch-suriyothin.webp'],
   ['dr-rachen-sornma', 'Dr. Rachen Sornma', 'Dr. Rachen', 'Aesthetic doctor', 'Chiang Mai University', '45102', ['botox', 'filler'], 'assets/img/doctors/dr-rachen-sornma.webp'],
   ['dr-kaewlada-yupakorn', 'Dr. Kaewlada Yupakorn', 'Dr. Namhom', 'Dermatologist', 'Vajira Hospital, Mahidol University', '29041', ['botox', 'filler'], 'assets/img/doctors/dr-kaewlada-yupakorn.webp'],
   ['dr-kanokporn-remkanon', 'Dr. Kanokporn Remkanon', 'Dr. Kook', 'Dermatologist', 'Srinakharinwirot University', '32795', ['radiesse', 'sculptra', 'bio-lift'], 'assets/img/doctors/dr-kanokporn-remkanon.webp'],
   ['dr-pattanajuk-vipadakul', 'Dr. Pattanajuk Vipadakul', 'Dr. Ton', 'Aesthetic doctor', 'Mahasarakham University', '44827', ['botox', 'filler'], 'assets/img/doctors/dr-pattanajuk-vipadakul.webp'],
   ['dr-rueangrong-phasyawan', 'Dr. Rueangrong Phasyawan', 'Dr. Rueang', 'Aesthetic doctor', 'Siam University', '69049', ['botox', 'filler', 'meso', 'celeb-skin'], 'assets/img/doctors/dr-rueangrong-phasyawan.webp'],
   ['dr-piyapat-duangnil', 'Dr. Piyapat Duangnil', 'Dr. Tin', 'Aesthetic doctor', 'Prince of Songkla University', '71943', ['botox', 'filler'], 'assets/img/doctors/dr-piyapat-duangnil.webp'],
   ['dr-nitirat-boonyaniwas', 'Dr. Nitirat Boonyaniwas', 'Dr. Nort', 'Aesthetic doctor', 'Mahidol University', '63835', ['botox', 'filler'], 'assets/img/doctors/dr-nitirat-boonyaniwas.webp'],
   ['dr-jeerachart-wongsuriyasakul', 'Dr. Jeerachart Wongsuriyasakul', 'Dr. Jee', 'Aesthetic doctor', 'Chiang Mai University', '39874', ['botox', 'filler'], 'assets/img/doctors/dr-jeerachart-wongsuriyasakul.webp'],
   ['dr-pichaya-uawongprayoon', 'Dr. Pichaya Uawongprayoon', 'Dr. Jan', 'Dermatologist', 'Thammasat University', '38451', ['botox', 'meso', 'celeb-skin'], 'assets/img/doctors/dr-pichaya-uawongprayoon.webp'],
   ['dr-thiradet-teanpairote', 'Dr. Thiradet Teanpairote', 'Dr. Wai', 'Dermatologist', 'Naresuan University', '44663', ['botox', 'filler', 'sculptra', 'bio-lift'], 'assets/img/doctors/dr-thiradet-teanpairote.webp'],
   ['dr-chananporn-wanishsawad', 'Dr. Chananporn Wanishsawad', 'Dr. Koy', 'Dermatologist', 'Cardiff University, UK', '69867', ['botox', 'filler'], 'assets/img/doctors/dr-chananporn-wanishsawad.webp']],
 'branches': [['Apex Surgery Hospital, Ploenchit', 'hospital', '085-000-0855', 'https://maps.app.goo.gl/f8CaF7p9BQpir3mP9', '13.740810', '100.551225'],
   ['Apex Surgery Hospital, Phuket', 'hospital', '088-870-0053', 'https://maps.app.goo.gl/15GLAMR6PyJA6W4q6', '7.886900', '98.392500'],
   ['Central Rama 2', 'bangkok', '099-080-1000', 'https://maps.app.goo.gl/i5Y3t2pXPoTMH9Em9', '13.662775', '100.437364'],
   ['Central Rama 3', 'bangkok', '088-870-0067', 'https://maps.app.goo.gl/15GLAMR6PyJA6W4q6', '13.697736', '100.537304'],
   ['Central Rama 9, 5th Floor', 'bangkok', '061-712-5000', 'https://maps.app.goo.gl/FSSGH56tAzxRzDyB8', '13.758714', '100.566306'],
   ['Central Westgate, 2nd floor', 'bangkok', '088-870-0015', 'https://maps.app.goo.gl/9qd8N6189H1wd3vL9', '13.877352', '100.411351'],
   ['Central Eastville, 1st floor', 'bangkok', '099-330-6000', 'https://maps.app.goo.gl/1hvNJcg98wyhkXhf9', '13.803543', '100.614786'],
   ['Central Silom Complex, 3rd Floor', 'bangkok', '062-630-8000', 'https://maps.app.goo.gl/gy3dLxwQBUNzZsTR9', '13.728288', '100.535073'],
   ['Central Ladprao, 7th floor', 'bangkok', '085-700-0037', 'https://maps.app.goo.gl/kcmVucvp8WfWLfzj7', '13.816700', '100.561200'],
   ['Central Ladprao, 5th floor', 'bangkok', '085-700-0036', 'https://maps.app.goo.gl/oUvJF29efABVFMxY9', '13.816232', '100.560813'],
   ['Central Pinklao, 3rd floor', 'bangkok', '082-700-0039', 'https://maps.app.goo.gl/MvqDqCDEczxSZKzZ7', '13.777327', '100.476061'],
   ['Central Chaengwattana', 'bangkok', '063-273-7878', 'https://maps.app.goo.gl/UR7ABR9rNviw4FfU9', '13.903900', '100.528703'],
   ['Central Westville, 1st floor', 'bangkok', '080-898-4322', 'https://maps.app.goo.gl/KfcnSZVwpqF1pFhC8', '13.805917', '100.449061'],
   ['The Mall Ngamwongwan, 6th floor', 'bangkok', '063-549-7700', 'https://maps.app.goo.gl/3hezyP8EUUksC98y6', '13.856180', '100.541585'],
   ['The Mall Lifestore Bangkapi, G Floor', 'bangkok', '064-574-9533', 'https://maps.app.goo.gl/9Yfm6UZJE2jhY4EE9', '13.766822', '100.642025'],
   ['The Mall Lifestore Bang Khae, M Floor', 'bangkok', '064-575-6144', 'https://maps.app.goo.gl/Wca7jafed5SfeCAp8', '13.713465', '100.407465'],
   ['The Promenade', 'bangkok', '083-126-7474', 'https://maps.app.goo.gl/r9YmR4tAFXJswb1s5', '13.826140', '100.679245'],
   ['Terminal 21 Rama 3', 'bangkok', '094-310-0002', 'https://maps.app.goo.gl/vhYqQaHPop68E2SL7', '13.689284', '100.505722'],
   ['EmQuartier, 4th floor', 'bangkok', '085-700-0032', 'https://maps.app.goo.gl/93VxRmkrruUAusrG8', '13.731440', '100.569731'],
   ['Siam Square One', 'bangkok', '088-870-0051', 'https://maps.app.goo.gl/6gHPLcQYWgSxEgyn9', '13.745222', '100.533749'],
   ['Seacon Square, 3rd floor, Lotus side', 'bangkok', '099-060-5000', 'https://maps.app.goo.gl/dpaQT3khWZD9Yjq96', '13.694216', '100.648117'],
   ['The Crystal SB Ratchapruek, 2nd floor', 'bangkok', '088-870-0026', 'https://maps.app.goo.gl/dvbFjQqwLpCC2VfY8', '13.809560', '100.448655'],
   ['Crystal Park, 2nd Floor, Phase 1', 'bangkok', '087-700-0051', 'https://maps.app.goo.gl/Zwgjq6ccVm24RwJs5', '13.812070', '100.619544'],
   ['Future Park Rangsit, 2nd floor', 'bangkok', '082-700-0065', 'https://maps.app.goo.gl/Ay5DygxfhZN88HeV8', '13.985942', '100.617148'],
   ['Paragon, 2nd floor', 'bangkok', '085-700-0035', 'https://maps.app.goo.gl/JxoypP18f4Yjd68s8', '13.747341', '100.534288'],
   ['Emporium B1', 'bangkok', '094-530-9009', 'https://maps.app.goo.gl/X5Y5LtjA698XfKSd9', '13.730446', '100.568843'],
   ['Mercury Ville Tower, 3rd Floor', 'bangkok', '094-889-8000', 'https://maps.app.goo.gl/FBz7tPeYE8yLRorp9', '13.743447', '100.544115'],
   ['Fashion Island', 'bangkok', '085 700 0014', None, '13.825100', '100.678800'],
   ['Mega Bangna', 'bangkok', '099-060-8000', 'https://maps.app.goo.gl/tSjG3x6XW5md6rjp6', '13.646600', '100.679900'],
   ['101 True Digital Park, 3rd Floor', 'bangkok', '099-330-8000', 'https://maps.app.goo.gl/ArAczM1oE2wjUTsf6', '13.685300', '100.611100'],
   ['Paradise Park', 'bangkok', '094-304-5552', 'https://maps.app.goo.gl/NnakVCJPskMURETW6', '13.689400', '100.648000'],
   ['ICS Lifestyle Complex', 'bangkok', '094-287-5553', 'https://maps.app.goo.gl/jMvYuX9UpobA8JRY7', '13.725500', '100.507500'],
   ['ICONSIAM, 5th floor', 'bangkok', '062-662-4000', 'https://maps.app.goo.gl/mEJiN3XQX3gvUWn66', '13.726700', '100.510300'],
   ['Samyan Mitrtown', 'bangkok', '082-700-0063', 'https://maps.app.goo.gl/1gZ6acY315yJLek88', '13.733900', '100.528000'],
   ['Thonglor Soi 8', 'bangkok', '080-500-0123', 'https://maps.app.goo.gl/4oeLC4aWzeEX1d1g7', '13.729800', '100.582600'],
   ['Lasalle Avenue, 1st Floor', 'bangkok', '099-330-7000', 'https://maps.app.goo.gl/gBeBxPsFdSGiq72w5', '13.667600', '100.615000'],
   ['Sindhorn Village (Lang Suan)', 'bangkok', '095-102-8585', 'https://maps.app.goo.gl/PeykgfZWiTsGtH7M7', '13.735700', '100.543400'],
   ['Nana', 'bangkok', '095-849-0156', 'https://maps.app.goo.gl/wMCGaJnBUkLox1J46', '13.740400', '100.555000'],
   ['Central Ayutthaya', 'province', '085-900-0097', 'https://maps.app.goo.gl/GeWiefZmSTrwcRP89', '14.336000', '100.609000'],
   ['Central Chonburi', 'province', '085-700-0051', 'https://maps.app.goo.gl/LP12rBz6YRQukjB26', '13.343300', '100.973200'],
   ['Central Nakhon Pathom', 'province', '098-830-8181', 'https://maps.app.goo.gl/RxsH3T4v5f66RdVG9', '13.812500', '100.057000'],
   ['Central Nakhon Sawan', 'province', '063-268-0044', 'https://maps.app.goo.gl/akUkUW8tUHnGQU2x8', '15.693000', '100.127000'],
   ['Central Udon Thani', 'province', '082-683-0300', 'https://maps.app.goo.gl/9qHiEksLVe1aYKt47', '17.404900', '102.800700'],
   ['Central Hatyai', 'province', '084-216-2144', 'https://maps.app.goo.gl/ozdePCjzSS6HVuEBA', '6.995300', '100.482600'],
   ['Central Festival Chiang Mai, 4th floor', 'province', '099-060-1000', 'https://maps.app.goo.gl/aWeurkVZ3jLDCa3e7', '18.807500', '99.018000'],
   ['Central Phuket Floresta', 'province', '062-630-3000', 'https://maps.app.goo.gl/LF7hCas8X2k1GWhT9', '7.891500', '98.368400'],
   ['Central Korat, 3rd floor', 'province', '088-870-0043', 'https://maps.app.goo.gl/BQjZ4AJG4DSwWAA19', '14.983900', '102.082000'],
   ['Pattaya (behind BigC Central Pattaya)', 'province', '087-096-1234', 'https://maps.app.goo.gl/f6kLLsssSz5AvVeG8', '12.936300', '100.892000'],
   ['Market Village Hua Hin', 'province', '094-536-4433', 'https://maps.app.goo.gl/ZTeAYger3xrqWpb1A', '12.553000', '99.960000']],
}
