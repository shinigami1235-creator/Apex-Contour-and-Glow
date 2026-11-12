/* Filler areas and amounts.
   Source: de Maio M. MD Codes™: A Methodological Approach to Facial Aesthetic Treatment with Injectable Hyaluronic
   Acid Fillers. Aesthetic Plast Surg. 2021;45(2):690–709. doi:10.1007/s00266-020-01762-7. CC BY 4.0.
   Table 3 gives each code and its "active number", the minimum mL per side for a visible result. Table 4 groups the
   codes by concern. Depth, needle or cannula and the alert notes are left out since this is for patients.

   Each code: vol = mL per side (or in total when mid is true, for codes injected only on the midline).
   at = MediaPipe face mesh points [right side, left side] (one pair per injection point), or [i] on the midline,
   with an optional sideways shift (share of face width, toward the outside) for points between two landmarks.
   fx = what the simulation does there: fill lifts the shadow, mv moves the skin (u down the face, v outward),
   lit adds a soft highlight. Sizes are shares of the face width at the code's active number. */

export const CODES = {
  // foundation: cheek
  Ck1: {vol:.3, parts:3, at:[[227, 447], [116, 345], [111, 340]], fx:{mv:{u:-.004, v:.007}}},
  Ck2: {vol:.2, at:[[117, 346]], fx:{mv:{u:-.004, v:.003}, lit:.05}},
  Ck3: {vol:.3, at:[[101, 330]], fx:{fill:.06, mv:{u:-.004}}},
  Ck4: {vol:.5, at:[[147, 376]], fx:{mv:{u:-.006, v:.002}}},
  Ck5: {vol:.5, at:[[207, 427]], fx:{fill:.065}},
  // contour: temple
  T1: {vol:.5, at:[[21, 251]], fx:{fill:.07, mv:{v:.006}}},
  T2: {vol:.5, at:[[162, 389]], fx:{fill:.06, mv:{v:.006}}},
  // contour: chin
  C1: {vol:.5, at:[[83, 313]], fx:{fill:.035}},
  C2: {vol:.3, at:[[152, 152, .03]], fx:{mv:{u:.010}}},
  C3: {vol:.3, at:[[208, 428]], fx:{mv:{u:.006}, lit:.03}},
  C4: {vol:.3, mid:true, at:[[199]], fx:{mv:{u:.008}}},
  C5: {vol:.3, at:[[171, 396]], fx:{mv:{u:.004, v:.004}}},
  C6: {vol:.5, at:[[32, 262]], fx:{fill:.035, mv:{v:.003}}},
  // contour: jawline
  Jw1: {vol:.5, at:[[172, 397]], fx:{mv:{v:.010}}},
  Jw2: {vol:.5, at:[[93, 323]], fx:{fill:.04}},
  Jw3: {vol:1, at:[[150, 379]], fx:{mv:{u:.003, v:.006}}},
  Jw4: {vol:.5, at:[[149, 378]], fx:{fill:.035, mv:{v:.003}}},
  Jw5: {vol:.5, at:[[176, 400]], fx:{mv:{u:.005}}},
  // refinement: forehead, brows, outer eye, tear trough
  F1: {vol:.5, at:[[108, 337]], fx:{fill:.07}},
  F2: {vol:.5, at:[[103, 332]], fx:{fill:.07}},
  F3: {vol:.5, at:[[151, 151, .04]], fx:{fill:.06}},
  E1: {vol:.2, at:[[70, 300]], fx:{mv:{u:-.007}}},
  E2: {vol:.2, at:[[52, 282]], fx:{mv:{u:-.006}}},
  E3: {vol:.1, at:[[65, 295]], fx:{mv:{u:-.004}}},
  O1: {vol:.2, at:[[143, 372]], fx:{fill:.04}},
  O2: {vol:.2, at:[[31, 261]], fx:{fill:.035}},
  O3: {vol:.1, at:[[124, 353]], fx:{fill:.035}},
  Tt1: {vol:.2, at:[[230, 450]], fx:{fill:.04}},
  Tt2: {vol:.2, at:[[229, 449]], fx:{fill:.035}},
  Tt3: {vol:.1, at:[[232, 452]], fx:{fill:.03}},
  // refinement: around the mouth. NL depends on how deep the fold is
  NL1: {vol:.3, vol2:.5, at:[[203, 423]], fx:{fill:.04}},
  NL2: {vol:.2, vol2:.3, at:[[206, 426]], fx:{fill:.04}},
  NL3: {vol:0, vol2:.2, at:[[216, 436]], fx:{fill:.035}},
  M1: {vol:.2, at:[[43, 273]], fx:{fill:.03}},
  M2: {vol:.2, at:[[202, 422]], fx:{fill:.03}},
  M3: {vol:.1, at:[[210, 430]], fx:{fill:.03}},
  Lp1: {vol:.4, parts:2, at:[[39, 269], [84, 314]], fx:{mv:{u:[-.008, .010]}}},
  Lp2: {vol:.05, at:[[37, 267]], fx:{lit:.012}},
  Lp3: {vol:.3, parts:2, at:[[40, 270], [91, 321]], fx:{lit:.015}},
  Lp4: {vol:.1, mid:true, at:[[0]], fx:{mv:{u:-.004}}},
  Lp5: {vol:.05, at:[[86, 316]], fx:{mv:{u:.004}}},
  Lp6: {vol:.1, at:[[61, 291]], fx:{mv:{u:-.006}}},
  Lp7: {vol:.05, at:[[167, 393]], fx:{lit:.014}},
  Lp8: {vol:.5, parts:2, at:[[92, 322], [182, 406]], fx:{fill:.03}},
  // nose: all on the midline
  N1: {vol:.3, mid:true, at:[[2]], fx:{mv:{u:-.003}}},
  N2: {vol:.2, mid:true, at:[[94]], fx:{mv:{u:-.003}}},
  N3: {vol:.3, mid:true, at:[[168]], fx:{lit:.03}},
  N4: {vol:.2, mid:true, at:[[6]], fx:{lit:.022}},
  N5: {vol:.2, mid:true, at:[[195]], fx:{lit:.022}},
};

/* concerns, from Table 4, in the paper's order: foundation first, contour second, refinement last */
export const CONCERNS = [
  {k:'cheeks', step:'foundation', codes:['Ck1', 'Ck2', 'Ck3', 'Ck4', 'Ck5']},
  {k:'temples', step:'contour', codes:['T1', 'T2']},
  {k:'chin', step:'contour', codes:['C1', 'C2', 'C3', 'C4', 'C5', 'C6']},
  {k:'jowls', step:'contour', codes:['Jw1', 'Jw2', 'Jw3', 'Jw4', 'Jw5']},
  {k:'forehead', step:'refine', codes:['F1', 'F2', 'F3']},
  {k:'brows', step:'refine', codes:['E1', 'E2', 'E3']},
  {k:'orbit', step:'refine', codes:['O1', 'O2', 'O3']},
  {k:'tear', step:'refine', codes:['Tt1', 'Tt2', 'Tt3']},
  {k:'folds', step:'refine', codes:['NL1', 'NL2', 'NL3'], deep:true},
  {k:'lips', step:'refine', codes:['Lp1', 'Lp2', 'Lp3', 'Lp4', 'Lp5', 'Lp7', 'Lp8']},
  {k:'corners', step:'refine', codes:['Lp6']},
  {k:'marionette', step:'refine', codes:['M1', 'M2', 'M3']},
  {k:'nose', step:'refine', codes:['N1', 'N2', 'N3', 'N4', 'N5']},
];
export const STEPS = ['foundation', 'contour', 'refine'];
export const PER_SESSION = 4;   // the paper suggests about 4 mL in one session
export const SYRINGE = 1;       // mL in one syringe

/* The codes for a set of concerns, with the paper's combination rules:
   C1 goes from 0.5 to 0.7 mL with C2, and T1 or Ck4 go from 0.5 to 0.7 mL with Ck1, so each pair fills one syringe.
   deep: true uses the amounts for severe nasolabial folds. */
export function planFor(keys, deep = false){
  const on = new Set(keys), list = [];
  for (const c of CONCERNS) if (on.has(c.k)) for (const k of c.codes) {
    const d = CODES[k];
    let vol = c.deep && deep ? (d.vol2 ?? d.vol) : d.vol;
    if (!vol) continue;
    list.push({k, concern:c.k, step:c.step, vol, mid:!!d.mid});
  }
  const has = k => list.some(x => x.k === k), set = (k, v) => list.forEach(x => { if (x.k === k) x.vol = v; });
  if (has('C1') && has('C2')) set('C1', .7);
  if (has('Ck1') && has('T1')) set('T1', .7);
  if (has('Ck1') && has('Ck4')) set('Ck4', .7);
  const r2 = x => Math.round(x * 100) / 100;
  const total = r2(list.reduce((a, x) => a + (x.mid ? x.vol : x.vol * 2), 0));
  const byConcern = {};
  for (const x of list) { const b = byConcern[x.concern] = byConcern[x.concern] || {total:0, codes:[]}; b.codes.push(x); b.total = r2(b.total + (x.mid ? x.vol : x.vol * 2)); }
  return {list, total, byConcern, syringes:Math.ceil(total / SYRINGE - 1e-9), sessions:Math.max(1, Math.ceil(total / PER_SESSION - 1e-9))};
}

/* Where each code sits on the 3D head (features/bodymap/heads.bin, one topology for both genders):
   vertex indices in the same order as at, [right, left] or [centre]. Found by placing every code on three
   front-facing photos in a frame set by the eyes, mouth and chin, then on the head in the same frame
   (the nearest skin vertex facing the camera). */
export const HEAD_AT = {"Ck1":[[2286,2907],[115,816],[58,766]],"Ck2":[[1920,2545]],"Ck3":[[1518,1689]],"Ck4":[[2119,2745]],"Ck5":[[2254,2879]],"T1":[[456,1131]],"T2":[[455,1130]],"C1":[[190,883]],"C2":[[569,1231]],"C3":[[522,1188]],"C4":[[527]],"C5":[[2142,2767]],"C6":[[524,1190]],"Jw1":[[1550,1721]],"Jw2":[[2285,2906]],"Jw3":[[2154,2779]],"Jw4":[[2113,2739]],"Jw5":[[2115,2741]],"F1":[[93,797]],"F2":[[2241,2866]],"F3":[[95,798]],"E1":[[1798,2419]],"E2":[[66,773]],"E3":[[67,774]],"O1":[[1775,2397]],"O2":[[30,1139]],"O3":[[1926,763]],"Tt1":[[1739,2361]],"Tt2":[[2233,717]],"Tt3":[[633,1294]],"NL1":[[2081,2707]],"NL2":[[638,1298]],"NL3":[[2093,2719]],"M1":[[196,1601]],"M2":[[2091,2715]],"M3":[[528,1193]],"Lp1":[[179,872],[192,886]],"Lp2":[[1429,1430]],"Lp3":[[2276,2898],[1838,2461]],"Lp4":[[1429]],"Lp5":[[181,874]],"Lp6":[[162,863]],"Lp7":[[2258,2883]],"Lp8":[[2264,2888],[187,880]],"N1":[[144]],"N2":[[2068]],"N3":[[40]],"N4":[[19]],"N5":[[136]]};

/* Hyaluronic acid fillers on Apex's treatment list (Oct 2026), the syringe size and the areas each maker or
   regulator lists for it. An area is only listed when a label, instructions for use or the maker's own product page
   says so; marketing copy from distributors was left out. Forehead, brows, outer eye and nose have no product here
   since none of these labels name them, so the doctor chooses. Thai package inserts, if they differ, win. */
export const PRODUCTS = [
  {k:'voluma', name:'Juvederm Voluma', ml:1, areas:['cheeks', 'chin', 'temples'],
   src:'https://www.accessdata.fda.gov/cdrh_docs/pdf11/P110033S070C.pdf'},
  {k:'volift', name:'Juvederm Volift', ml:1, areas:['cheeks', 'chin', 'jowls', 'lips'],
   src:'https://media.allergan.com/actavis/actavis/media/allergan-pdf-documents/Juv%C3%A9derm%C2%AE_VOLIFT_DFU_GR.pdf'},
  {k:'volbella', name:'Juvederm Volbella', ml:1, areas:['lips', 'tear'],
   src:'https://media.allergan.com/actavis/actavis/media/allergan-pdf-documents/Juv%C3%A9derm%C2%AE_VOLBELLA_DFU_GR.pdf'},
  {k:'kysse', name:'Restylane Kysse', ml:1, areas:['lips'],
   src:'https://www.galderma.com/us/sites/g/files/jcdfhc341/files/2020-04/Restylane_Kysse-IFU.pdf'},
  {k:'belotero', name:'Belotero Intense', ml:1, areas:['folds', 'lips', 'corners', 'marionette'],
   src:'https://www.ddgroup.com/facial-aesthetics/fillers/600055--belotero-intense-with-lidocaine/'},
  {k:'shape', name:'Revanesse Shape', ml:1.2, areas:['cheeks', 'chin', 'jowls'],
   src:'https://international.revanesse.com/products/revanesse-shape/'},
  {k:'ultra', name:'Revanesse Ultra', ml:1.2, areas:['cheeks', 'folds', 'marionette', 'corners'],
   src:'https://international.revanesse.com/products/revanesse-ultra/'},
  {k:'rha4', name:'Teosyal RHA 4', ml:1.2, areas:['folds', 'cheeks'],
   src:'https://www.teoxane.com/en/productinfo-ksa'},
  {k:'ultradeep', name:'Teosyal Ultra Deep', ml:1.2, areas:['cheeks', 'folds'],
   src:'https://www.teoxane.com/en/productinfo-ksa'},
  {k:'redensity2', name:'Teosyal Redensity 2', ml:1, areas:['tear'],
   src:'https://www.teoxane.com/en/productinfo-ksa'},
];
export const productsFor = concern => PRODUCTS.filter(p => p.areas.includes(concern));

/* Syringes for a plan when each concern may use its own product: amounts of the same product share syringes,
   and concerns left to the doctor count in 1 mL syringes. byConcern: {concern: {total}}, pick: {concern: product key}. */
export function syringesFor(byConcern, pick = {}){
  const by = {};
  for (const c in byConcern) {
    const p = PRODUCTS.find(x => x.k === pick[c] && x.areas.includes(c));
    const k = p ? p.k : '', b = by[k] = by[k] || {ml:0, size:p ? p.ml : SYRINGE};
    b.ml += byConcern[c].total;
  }
  return Object.values(by).reduce((a, b) => a + Math.ceil(b.ml / b.size - 1e-9), 0);
}
