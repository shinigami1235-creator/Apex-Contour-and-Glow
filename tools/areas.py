# Where each face planner area sits on the 3D head, and what backs it.
# Filler: the MD Codes and their vertices on heads.bin (HEAD_AT in assets/features/filler/codes.js), from
#   de Maio M. MD Codes: A Methodological Approach to Facial Aesthetic Treatment with Injectable Hyaluronic Acid Fillers.
#   Aesthetic Plast Surg. 2021;45(2):690-709. doi:10.1007/s00266-020-01762-7
# Botulinum toxin: the usual injection points from
#   Carruthers J, Fagien S, Matarasso SL. Consensus recommendations on the use of botulinum toxin type A in facial aesthetics.
#   Plast Reconstr Surg. 2004;114(6 Suppl):1S-22S. doi:10.1097/01.PRS.0000144795.76040.D3
#   Kim et al. Cosmetic Treatment Using Botulinum Toxin in the Oral and Maxillofacial Area: A Narrative Review of Esthetic
#   Techniques. Toxins. 2023;15(2):82. doi:10.3390/toxins15020082
#   Yi KH et al. Novel anatomical proposal for botulinum neurotoxin injection targeting depressor anguli oris.
#   Anat Cell Biol. 2023;56(2):161-165. doi:10.5115/acb.22.258
# Skin boosters over the whole face: the five Bio Aesthetic Points used for Profhilo (malar, base of the nose, tragus,
#   chin, angle of the jaw), from IBSA's BAP technique.
# The toxin points were placed on the female head from the eye and mouth landmarks: glabella at and above the medial
#   brow, frontalis at least 2 cm above the brow, crow's feet 1 cm outside the orbital rim, masseter in its lower third,
#   mentalis on the chin, DAO below the mouth corner near the jaw border, platysma along the neck bands.
TOXIN = {"glabella": [[77], [1785, 2406], [87, 792]], "frontalis": [[2061, 2687], [205, 896], [1405, 1578]], "crowsfeet": [[117, 818], [112, 813], [496, 1165]], "masseter": [[628, 1289], [518, 1184], [1546, 1717]], "mentalis": [[522, 1188]], "dao": [[526, 1192]], "platysma": [[2002, 2627], [262, 951], [258, 947]], "bap_tragus": [[323, 1006]]}
ZONE_POINTS = {
 'forehead':  dict(codes=['F1', 'F2', 'F3'], toxin=('frontalis', 'Frontalis muscle, 6 points')),
 'brows':     dict(codes=[], toxin=('glabella', 'Procerus and corrugator muscles, 5 points')),
 'eyes':      dict(codes=['E1', 'E2', 'E3', 'O1', 'O2', 'O3'], toxin=('crowsfeet', "Crow's feet, 3 points a side")),
 'temples':   dict(codes=['T1', 'T2'], toxin=None),
 'undereyes': dict(codes=['Tt1', 'Tt2', 'Tt3'], toxin=None),
 'cheeks':    dict(codes=['Ck1', 'Ck2', 'Ck3', 'Ck4', 'Ck5'], toxin=None),
 'smile':     dict(codes=['NL1', 'NL2', 'NL3'], toxin=None),
 'lips':      dict(codes=['Lp1', 'Lp2', 'Lp3', 'Lp4', 'Lp5', 'Lp6', 'Lp7', 'Lp8', 'M1', 'M2', 'M3'], toxin=('dao', 'Mouth corner muscle (DAO), 1 point a side')),
 'chin':      dict(codes=['C1', 'C2', 'C3', 'C4', 'C5', 'C6'], toxin=('mentalis', 'Mentalis muscle, 2 points')),
 'jaw':       dict(codes=['Jw1', 'Jw2', 'Jw3', 'Jw4', 'Jw5'], toxin=('masseter', 'Masseter muscle, 3 points a side')),
 'neck':      dict(codes=[], toxin=('platysma', 'Platysma bands, 3 points a side')),
 'skin':      dict(codes=['Ck2', 'NL1', 'C1', 'Jw1'], toxin=None, extra='bap_tragus'),
}
