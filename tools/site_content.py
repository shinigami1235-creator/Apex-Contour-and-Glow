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
             'fine': 'LINE opens with your message filled in. Press send there.',
             'consent': 'I agree to Apex keeping these details to arrange my visit.', 'privacy': 'Privacy policy'},
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
   "The booking form asks for your name, phone number, the treatment you are interested in and a day that suits you. We keep these details to arrange your visit and delete them after 365 days. Sending the form also opens LINE with the same details filled in, and anything you send in LINE is covered by LINE's own privacy policy."
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
