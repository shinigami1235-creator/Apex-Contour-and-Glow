/* Filler simulator (copied from Apex Surgery International; Contour and Glow passes opts.noPlan and opts.consult)
   A visitor picks what they want to improve (saggy cheeks, tear troughs, a recessed chin...) and sees, on a 3D head,
   where a doctor would usually treat and how much: each point holds a drop of the real amount, and the skin lifts
   where the filler goes. Below it: the effect of each choice, the areas in plain words and the total in mL and syringes.
   Areas and amounts follow the MD Codes method (de Maio 2021, CC BY 4.0), see codes.js.
   It is a model head, not the visitor's face, since a photo simulation of volume is not accurate enough yet.

   mount(container, opts) -> {destroy()}
   opts: lang 'en' | 'th', base (assets/ URL), onEvent(name, data). Testing only: threeUrl */
import {CODES, CONCERNS, STEPS, PER_SESSION, planFor, HEAD_AT, PRODUCTS, productsFor, syringesFor} from './codes.js';
import {createHead} from './head.js?v=17';

const REF = 'https://pmc.ncbi.nlm.nih.gov/articles/PMC8012343/';
// where the wipe line starts in each view: on the profile in the side view, since that is where the change shows
const WIPE_AT = {front:.5, q:.56, side:.7};
const STEP_C = {foundation:'#E3B85C', contour:'#B99BFF', refine:'#F49AC1'};

const STR = {
  en:{
    head:'3D head', women:'Women', men:'Men', front:'Front', q:'45°', side:'Side', drag:'Drag to turn the head.',
    amount:'Amount', minimum:'minimum', wipe:'Drag the line to compare before and after.', loading:'Loading the 3D head', webgl:'This browser cannot show the 3D head.',
    drops:'The drops and the lift are true to size. 100% is the minimum amount for each area.',
    fx:{"cheeks": "Lifts and supports the midface so the cheeks look fuller.", "temples": "Fills the hollow at the side of the forehead.", "chin": "Brings the chin forward and lengthens it a little.", "jowls": "Sharpens the jawline and the angle of the jaw.", "forehead": "Rounds out a flat forehead.", "brows": "Supports the brows so they sit a little higher.", "orbit": "Fills the hollow beside the outer eye.", "tear": "Softens the shadow under the eyes.", "folds": "Softens the lines from the nose to the mouth.", "lips": "Adds volume and shape to the lips.", "corners": "Lifts the corners of the mouth.", "marionette": "Softens the lines below the corners of the mouth.", "nose": "Raises the bridge and lifts the tip without surgery."},
    change:'New photo', photo:'Photo', take:'Take photo', choose:'Choose photo', sample:'Sample face', privacy:'No photo uploaded.',
    hint:'Face the camera straight on, with your hair off your face.', emptyH:'Take or choose a front photo.',
    busy:'Finding your face', credit:'Sample photo: Unsplash', points:'Points',
    before:'Before', after:'After', sim:'Simulation only', compare:'Before and after',
    concerns:'What would you like to improve?', concernsP:'Pick one or more. The areas and amounts update as you go.',
    deep:'Deep folds', deepP:'Uses the amounts for deep nasolabial folds.',
    step:{foundation:'Foundation', contour:'Contour', refine:'Refinement'},
    stepP:{foundation:'Support for the midface comes first.', contour:'Then the outline of the face.', refine:'Finer details last.'},
    c:{cheeks:'Saggy cheeks or flat cheeks', temples:'Sunken temples', chin:'Small or recessed chin', jowls:'Jowls or double chin',
       forehead:'Flat forehead', brows:'Low brows', orbit:'Hollow outer eye area', tear:'Tear troughs', folds:'Deep nasolabial folds',
       lips:'Thin lips', corners:'Downturned mouth corners', marionette:'Marionette lines', nose:'Nose shape'},
    a:{Ck1:'Cheekbone arch', Ck2:'Cheekbone', Ck3:'Front of the cheek', Ck4:'Lower outer cheek', Ck5:'Below the cheekbone',
       T1:'Front of the temple', T2:'Back of the temple',
       C1:'Below the lower lip', C2:'Tip of the chin', C3:'Front of the chin', C4:'Centre of the chin', C5:'Lower side of the chin', C6:'Side of the chin',
       Jw1:'Angle of the jaw', Jw2:'In front of the ear', Jw3:'Jawline', Jw4:'Beside the chin', Jw5:'Under the front of the chin',
       F1:'Inner forehead', F2:'Outer forehead', F3:'Centre of the forehead',
       E1:'Tail of the brow', E2:'Centre of the brow', E3:'Head of the brow',
       O1:'Outer corner of the eye', O2:'Below the outer eye', O3:'Above the outer eye',
       Tt1:'Under the eye, centre', Tt2:'Under the eye, outer', Tt3:'Under the eye, inner',
       NL1:'Top of the fold', NL2:'Middle of the fold', NL3:'Bottom of the fold',
       M1:'Top of the line', M2:'Middle of the line', M3:'Bottom of the line',
       Lp1:'Body of the lips', Lp2:"Cupid's bow", Lp3:'Lip border', Lp4:'Centre of the upper lip', Lp5:'Sides of the lower lip',
       Lp6:'Corners of the mouth', Lp7:'Philtrum', Lp8:'Lines around the lips',
       N1:'Base of the nose', N2:'Between the nostrils', N3:'Top of the bridge', N4:'Upper bridge', N5:'Lower bridge'},
    total:'Estimated amount', totalP:'Both sides of the face, using the minimum amount for each area.',
    prod:'Product', doc:"Doctor's choice", size:'{n} mL syringe', prodP:'Fillers Apex uses, matched to the areas their makers list. Syringes are counted by each product\'s size.',
    ml:'mL', syr:['syringe', 'syringes'], ses:['session', 'sessions'], sesP:'About {n} mL a session',
    each:'each side', mid:'centre', none:'Pick a concern to see the areas and amounts.',
    save:'Save', saveBtn:'Save to phone', plan:'Add to My Plan', planned:'Added to My Plan', consult:'Ask a doctor',
    vary:'Simulation only. Results may vary from person to person.',
    ref:'Areas and amounts follow the MD Codes™ method by Dr. Maurício de Maio, the minimum amount per area from his paper. Your doctor sets the real plan.',
    refLink:'de Maio M. Aesthetic Plastic Surgery 2021;45:690–709 (CC BY 4.0)',
    camHint:'Line up your face with the outline.', shutter:'Take photo', cancel:'Cancel', brand:'Apex Surgery Hospital',
    err:{noFace:'No face found in this photo. Try a closer photo taken from the front.', camera:'The camera could not be opened.', read:'The photo could not be read.',
         model:'The face model could not be loaded.', save:'The image could not be saved.', sample:'The sample photo could not be loaded.'},
  },
  th:{
    head:'หุ่นศีรษะ 3 มิติ', women:'ผู้หญิง', men:'ผู้ชาย', front:'ด้านหน้า', q:'45°', side:'ด้านข้าง', drag:'ลากเพื่อหมุนศีรษะ',
    amount:'ปริมาณ', minimum:'ขั้นต่ำ', wipe:'ลากเส้นเพื่อเทียบก่อนและหลัง', loading:'กำลังโหลดหุ่นศีรษะ 3 มิติ', webgl:'เบราว์เซอร์นี้แสดงหุ่น 3 มิติไม่ได้',
    drops:'หยดและส่วนที่นูนขึ้นเป็นขนาดจริง 100% คือปริมาณขั้นต่ำของแต่ละตำแหน่ง',
    fx:{"cheeks": "ยกและพยุงช่วงกลางใบหน้า แก้มดูเต็มขึ้น", "temples": "เติมร่องขมับด้านข้างหน้าผาก", "chin": "คางยื่นขึ้นและยาวขึ้นเล็กน้อย", "jowls": "กรอบหน้าและมุมกรามชัดขึ้น", "forehead": "หน้าผากโค้งมนขึ้น", "brows": "พยุงคิ้วให้ยกขึ้นเล็กน้อย", "orbit": "เติมร่องลึกข้างหางตา", "tear": "ลดเงาใต้ตา", "folds": "ร่องจากข้างจมูกถึงมุมปากตื้นขึ้น", "lips": "ริมฝีปากอิ่มและได้รูปขึ้น", "corners": "ยกมุมปากขึ้น", "marionette": "ร่องใต้มุมปากตื้นขึ้น", "nose": "เสริมสันจมูกและยกปลายจมูกโดยไม่ผ่าตัด"},
    change:'เปลี่ยนรูป', photo:'รูปภาพ', take:'ถ่ายรูป', choose:'เลือกรูป', sample:'ใบหน้าตัวอย่าง', privacy:'ไม่มีการอัปโหลดรูปภาพ',
    hint:'หันหน้าตรงเข้าหากล้อง และเก็บผมไม่ให้ปิดใบหน้า', emptyH:'ถ่ายหรือเลือกรูปหน้าตรง',
    busy:'กำลังหาใบหน้า', credit:'ภาพตัวอย่าง: Unsplash', points:'จุดฉีด',
    before:'ก่อน', after:'หลัง', sim:'ภาพจำลองเท่านั้น', compare:'ก่อนและหลัง',
    concerns:'อยากแก้ไขตรงไหน', concernsP:'เลือกได้มากกว่าหนึ่งข้อ ตำแหน่งและปริมาณจะเปลี่ยนตามที่เลือก',
    deep:'ร่องลึก', deepP:'ใช้ปริมาณสำหรับร่องแก้มที่ลึก',
    step:{foundation:'วางโครงสร้าง', contour:'ปรับกรอบหน้า', refine:'เก็บรายละเอียด'},
    stepP:{foundation:'เริ่มจากการพยุงช่วงกลางใบหน้า', contour:'จากนั้นปรับกรอบหน้า', refine:'เก็บรายละเอียดเป็นลำดับสุดท้าย'},
    c:{cheeks:'แก้มตอบหรือแก้มหย่อน', temples:'ขมับตอบ', chin:'คางสั้นหรือคางถอย', jowls:'แก้มย้อยหรือเหนียง',
       forehead:'หน้าผากแบน', brows:'คิ้วตก', orbit:'ขอบตาด้านข้างลึก', tear:'ร่องใต้ตา', folds:'ร่องแก้มลึก',
       lips:'ปากบาง', corners:'มุมปากตก', marionette:'ร่องข้างมุมปาก', nose:'ทรงจมูก'},
    a:{Ck1:'โหนกแก้มด้านข้าง', Ck2:'โหนกแก้ม', Ck3:'แก้มด้านหน้า', Ck4:'แก้มด้านข้างล่าง', Ck5:'ใต้โหนกแก้ม',
       T1:'ขมับด้านหน้า', T2:'ขมับด้านหลัง',
       C1:'ร่องใต้ริมฝีปากล่าง', C2:'ปลายคาง', C3:'คางด้านหน้า', C4:'กึ่งกลางคาง', C5:'คางด้านข้างล่าง', C6:'คางด้านข้าง',
       Jw1:'มุมกราม', Jw2:'หน้าใบหู', Jw3:'แนวกราม', Jw4:'ข้างคาง', Jw5:'ใต้คางด้านหน้า',
       F1:'หน้าผากด้านใน', F2:'หน้าผากด้านข้าง', F3:'กลางหน้าผาก',
       E1:'หางคิ้ว', E2:'กลางคิ้ว', E3:'หัวคิ้ว',
       O1:'หางตา', O2:'ใต้หางตา', O3:'เหนือหางตา',
       Tt1:'ใต้ตาตรงกลาง', Tt2:'ใต้ตาด้านนอก', Tt3:'ใต้ตาด้านใน',
       NL1:'ร่องแก้มส่วนบน', NL2:'ร่องแก้มส่วนกลาง', NL3:'ร่องแก้มส่วนล่าง',
       M1:'ร่องส่วนบน', M2:'ร่องส่วนกลาง', M3:'ร่องส่วนล่าง',
       Lp1:'เนื้อริมฝีปาก', Lp2:'กระจับ', Lp3:'ขอบปาก', Lp4:'กลางปากบน', Lp5:'ปากล่างด้านข้าง',
       Lp6:'มุมปาก', Lp7:'ร่องเหนือริมฝีปากบน', Lp8:'ริ้วรอยรอบปาก',
       N1:'ฐานจมูก', N2:'แกนกลางรูจมูก', N3:'ดั้งจมูกช่วงบน', N4:'สันจมูกช่วงบน', N5:'สันจมูกช่วงล่าง'},
    prod:'ผลิตภัณฑ์', doc:'ให้แพทย์เลือก', size:'หลอดละ {n} มล.', prodP:'ฟิลเลอร์ที่ Apex ใช้ จับคู่กับตำแหน่งที่ผู้ผลิตระบุ จำนวนหลอดนับตามขนาดหลอดของแต่ละผลิตภัณฑ์',
    total:'ปริมาณโดยประมาณ', totalP:'รวมทั้งสองข้างของใบหน้า ใช้ปริมาณขั้นต่ำของแต่ละตำแหน่ง',
    ml:'มล.', syr:'หลอด', ses:'ครั้ง', sesP:'ประมาณ {n} มล. ต่อครั้ง',
    each:'ข้างละ', mid:'กึ่งกลาง', none:'เลือกสิ่งที่อยากแก้ไขเพื่อดูตำแหน่งและปริมาณ',
    save:'บันทึก', saveBtn:'บันทึกลงโทรศัพท์', plan:'เพิ่มในแผนของฉัน', planned:'เพิ่มในแผนแล้ว', consult:'ปรึกษาแพทย์',
    vary:'ภาพจำลองเท่านั้น ผลลัพธ์อาจแตกต่างกันในแต่ละบุคคล',
    ref:'ตำแหน่งและปริมาณอ้างอิงตามวิธี MD Codes™ ของ นพ.เมาริซิโอ เด ไมโอ เป็นปริมาณขั้นต่ำของแต่ละตำแหน่งจากงานวิจัย แพทย์จะเป็นผู้วางแผนจริง',
    refLink:'de Maio M. Aesthetic Plastic Surgery 2021;45:690–709 (CC BY 4.0)',
    camHint:'จัดใบหน้าให้อยู่ในเส้น', shutter:'ถ่ายรูป', cancel:'ยกเลิก', brand:'Apex Surgery Hospital',
    err:{noFace:'ไม่พบใบหน้าในรูปนี้ ลองใช้รูปหน้าตรงที่ถ่ายใกล้ขึ้น', camera:'เปิดกล้องไม่ได้', read:'อ่านรูปไม่ได้',
         model:'โหลดโมเดลใบหน้าไม่ได้', save:'บันทึกรูปไม่ได้', sample:'โหลดรูปตัวอย่างไม่ได้'},
  },
};


const ICON = {
  download:'<path d="M12 15V3"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/>',
  plus:'<path d="M5 12h14"/><path d="M12 5v14"/>',
  check:'<path d="M20 6 9 17l-5-5"/>',
  alert:'<circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/>',
  msg:'<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
  drop:'<path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/>',
  book:'<path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/>',
  move:'<path d="m18 8 4 4-4 4"/><path d="M2 12h20"/><path d="m6 8-4 4 4 4"/>',
  turn:'<path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/>',
};
const ic = k => `<svg class="ff-i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[k]}</svg>`;

const CSS = `
.ff{--ff-plum:var(--plum,#6A388C);--ff-plum-7:var(--plum-700,#55286F);--ff-night:var(--night,#1F0A30);--ff-night-2:var(--night-2,#2A0F40);
  --ff-lilac:var(--lilac,#A886CD);--ff-lilac-3:var(--lilac-300,#C9B3DD);--ff-lilac-2:var(--lilac-200,#E4D8EE);--ff-lilac-1:var(--lilac-100,#F1EAF7);
  --ff-wash:var(--wash,#FBF3FB);--ff-ink:var(--ink,#2A1F33);--ff-ink-2:var(--ink-2,#5A4A66);--ff-ink-3:var(--ink-3,#7C6A88);
  --ff-on:var(--on-night,#F6EEFB);--ff-on-2:var(--on-night-2,#CDB9DD);--ff-gold:#E3B85C;--ff-gold-d:#9A6B12;--ff-ease:cubic-bezier(.23,1,.32,1);
  font-family:var(--font,"LINE Seed","Sarabun","Noto Sans Thai",system-ui,sans-serif);color:var(--ff-ink);line-height:1.6;display:grid;gap:14px;min-width:0;-webkit-tap-highlight-color:transparent}
.ff *,.ff *::before,.ff *::after{box-sizing:border-box}
.ff :where(button){font:inherit;color:inherit;background:none;border:0;padding:0;cursor:pointer}
.ff [hidden]{display:none!important}
.ff-i{width:1.15em;height:1.15em;flex:none;display:inline-block;vertical-align:-.18em}
.ff-main{display:grid;gap:14px;min-width:0}
@media (min-width:960px){.ff-main{grid-template-columns:minmax(0,1fr) 360px;grid-template-areas:"stage panel" "props panel";gap:24px;align-items:start}
  .ff-stage{grid-area:stage}.ff-props{grid-area:props}.ff-panel{grid-area:panel}}
.ff-props{display:grid;gap:12px;min-width:0}
.ff-sum{display:flex;align-items:center;justify-content:space-between;gap:12px 20px;flex-wrap:wrap;padding:16px 20px;border-radius:22px;
  background:linear-gradient(135deg,#FFFBF0,#FFF0CF);border:1px solid #EAD5A2}
.ff-sum b{font-size:17px;color:var(--ff-ink)}
.ff-sum p{margin:2px 0 0;font-size:13.5px;line-height:1.45;color:var(--ff-ink-2);max-width:46ch}
.ff-sum-n{display:flex;align-items:center;gap:10px;font-size:30px;font-weight:700;font-variant-numeric:tabular-nums;color:var(--ff-ink-3);line-height:1}
.ff-sum-n .ff-i{width:20px;height:20px;color:var(--ff-gold-d);transform:rotate(45deg)}
.ff-sum-n .a{color:var(--ff-gold-d);font-size:38px}
@media (min-width:700px){.ff-rows{grid-template-columns:1fr 1fr}}
.ff-stage{position:relative;min-width:0;background:radial-gradient(120% 80% at 50% 0%,var(--ff-night-2),var(--ff-night) 70%);color:var(--ff-on);border-radius:28px;padding:10px;display:grid;gap:10px}
.ff-view{--mh:62vh;position:relative;display:grid;place-items:center;min-height:min(64vh,460px);border-radius:20px;overflow:hidden}
@media (min-width:960px){.ff-view{--mh:76vh;min-height:min(76vh,680px)}}
.ff-view.fit{min-height:0}
.ff-fbox{position:relative;width:min(100%,calc(var(--mh) * var(--ar,.8)));aspect-ratio:var(--ar,.8)}
.ff-frame{--x:50%;position:absolute;inset:0;border-radius:20px;overflow:hidden;background:#12051d;touch-action:pan-y;user-select:none;-webkit-user-select:none}
.ff-frame canvas,.ff-frame svg.ff-g{position:absolute;inset:0;width:100%;height:100%;display:block}
.ff-frame .ff-after,.ff-frame .ff-ga{clip-path:inset(0 0 0 var(--x))}
.ff-frame .ff-gb{clip-path:inset(0 calc(100% - var(--x)) 0 0)}
.ff-g{pointer-events:none;overflow:hidden}
.ff.noguides .ff-g .gd,.ff.nospiral .ff-g .sp{opacity:0}
.ff-g g{transition:opacity .25s}
.ff-g .sq{fill:none;stroke:var(--ff-gold);stroke-width:.9;opacity:.45;vector-effect:non-scaling-stroke}
.ff-g .spl{fill:none;stroke:var(--ff-gold);stroke-width:2.2;vector-effect:non-scaling-stroke;stroke-linecap:round;stroke-linejoin:round}
.ff-g .sps{fill:none;stroke:rgba(20,6,31,.5);stroke-width:4.4;vector-effect:non-scaling-stroke;stroke-linecap:round;stroke-linejoin:round}
.ff-g .sh{fill:none;stroke:rgba(20,6,31,.55);stroke-width:3.2;vector-effect:non-scaling-stroke;stroke-linecap:round}
.ff-g .ln{fill:none;stroke:var(--ff-gold);stroke-width:1.3;opacity:.92;vector-effect:non-scaling-stroke;stroke-linecap:round}
.ff-g .dsh{stroke-dasharray:4 4}
.ff-g .dot{fill:var(--ff-gold);stroke:rgba(20,6,31,.6);stroke-width:1;vector-effect:non-scaling-stroke}
.ff-line{position:absolute;top:0;bottom:0;left:var(--x);width:2px;margin-left:-1px;background:#fff;box-shadow:0 0 0 1px rgba(31,10,48,.18)}
.ff-line::before{content:"";position:absolute;top:0;bottom:0;left:-27px;width:56px;touch-action:none}
.ff-knob{position:absolute;top:50%;left:var(--x);width:42px;height:42px;margin:-21px 0 0 -21px;border-radius:50%;background:#fff;color:var(--ff-plum);
  display:grid;place-items:center;box-shadow:0 10px 24px -8px rgba(20,6,31,.6);font-size:20px;cursor:ew-resize;touch-action:none}
.ff-frame:focus-visible{outline:2px solid var(--ff-lilac);outline-offset:3px}
.ff-tag{position:absolute;top:10px;padding:3px 10px;border-radius:999px;font-size:12px;font-weight:700;background:rgba(31,10,48,.62);color:#fff;backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);pointer-events:none}
.ff-tag.l{left:10px}.ff-tag.r{right:10px}
.ff-tag.sim{top:auto;bottom:10px;left:10px;background:rgba(255,255,255,.9);color:var(--ff-plum)}
.ff-corners{position:absolute;inset:8px;pointer-events:none;opacity:.55;background-repeat:no-repeat;
  background:linear-gradient(var(--ff-gold),var(--ff-gold)) 0 0/18px 2px no-repeat,linear-gradient(var(--ff-gold),var(--ff-gold)) 0 0/2px 18px no-repeat,
  linear-gradient(var(--ff-gold),var(--ff-gold)) 100% 0/18px 2px no-repeat,linear-gradient(var(--ff-gold),var(--ff-gold)) 100% 0/2px 18px no-repeat,
  linear-gradient(var(--ff-gold),var(--ff-gold)) 0 100%/18px 2px no-repeat,linear-gradient(var(--ff-gold),var(--ff-gold)) 0 100%/2px 18px no-repeat,
  linear-gradient(var(--ff-gold),var(--ff-gold)) 100% 100%/18px 2px no-repeat,linear-gradient(var(--ff-gold),var(--ff-gold)) 100% 100%/2px 18px no-repeat}
.ff-empty,.ff-error{display:grid;justify-items:center;text-align:center;gap:12px;padding:28px 18px;max-width:440px}
.ff-big{width:64px;height:64px;border-radius:20px;display:grid;place-items:center;background:rgba(255,255,255,.07);border:1px solid rgba(201,179,221,.22);color:var(--ff-gold);font-size:30px}
.ff-error .ff-big{color:#fff;background:rgba(204,51,102,.22);border-color:rgba(204,51,102,.5)}
.ff-empty h3,.ff-error h3{margin:0;font-size:20px;font-weight:700;color:#fff;line-height:1.35}
.ff-empty p{margin:0;color:var(--ff-on-2);font-size:15px}
.ff-row{display:flex;flex-wrap:wrap;gap:8px;justify-content:center}
.ff-cam{position:absolute;inset:0;background:#000;display:grid}
.ff-cam video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transform:scaleX(-1)}
.ff-cam svg{position:absolute;left:50%;top:46%;height:78%;max-width:92%;transform:translate(-50%,-50%);overflow:visible}
.ff-cam svg *{fill:none;stroke:#fff;stroke-width:1.1;stroke-dasharray:3 2.2;vector-effect:non-scaling-stroke;opacity:.9}
.ff-cam p{position:absolute;top:12px;left:12px;right:12px;margin:0;text-align:center;font-size:14px;font-weight:700;color:#fff;text-shadow:0 1px 6px rgba(0,0,0,.6)}
.ff-cambar{position:absolute;left:0;right:0;bottom:16px;display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:16px;padding:0 16px}
.ff-cambar>:first-child{justify-self:end}
.ff-shutter{width:68px;height:68px;border-radius:50%;background:#fff;color:var(--ff-plum);display:grid;place-items:center;font-size:26px;box-shadow:0 0 0 4px rgba(255,255,255,.35);transition:transform .16s var(--ff-ease)}
.ff-shutter:active{transform:scale(.94)}
.ff-busy{position:absolute;inset:0;display:grid;place-content:center;justify-items:center;gap:12px;background:rgba(31,10,48,.72);color:#fff;font-weight:700;z-index:5}
.ff-spin{width:40px;height:40px;border-radius:50%;border:3px solid rgba(255,255,255,.22);border-top-color:var(--ff-gold);animation:ff-spin .8s linear infinite}
@keyframes ff-spin{to{transform:rotate(360deg)}}
.ff-bar{display:flex;align-items:center;gap:8px;flex-wrap:wrap;justify-content:space-between;padding:2px 4px 2px 8px;min-height:44px}
.ff-bar{align-items:end;gap:10px 18px;padding:2px 8px 4px}
.ff-bar .ff-amt{flex:1 1 220px;color:#fff}
.ff-bar .ff-amt div{color:#fff}
.ff-bar .ff-amt output{color:var(--ff-gold)}
.ff .ff-bar input[type=range]{background:linear-gradient(90deg,var(--ff-gold) var(--v,70%),rgba(255,255,255,.2) var(--v,70%))}
.ff .ff-bar input[type=range]::-webkit-slider-thumb{border-color:var(--ff-gold-d)}
.ff-bar-r{display:flex;gap:8px;align-items:center;margin-bottom:6px}
@media (max-width:420px){.ff-hide-s{display:none}}
.ff-hint{margin:0;font-size:14.5px;color:var(--ff-ink-2)}
.ff-credit{margin:0;padding:0 8px 4px;font-size:12px;line-height:1.4;color:var(--ff-on-2)}
.ff .ff-sw-b{white-space:nowrap;display:inline-flex;align-items:center;gap:10px;height:38px;padding:0 10px 0 14px;border-radius:999px;border:1px solid rgba(201,179,221,.5);color:#fff;font-size:14px;font-weight:700}
.ff-sw{position:relative;flex:none;width:30px;height:18px;border-radius:999px;background:rgba(255,255,255,.2);transition:background-color .2s}
.ff-sw::after{content:"";position:absolute;top:2px;left:2px;width:14px;height:14px;border-radius:50%;background:#fff;transition:transform .2s var(--ff-ease)}
[aria-checked=true]>.ff-sw{background:var(--ff-gold-d)}
[aria-checked=true]>.ff-sw::after{transform:translateX(12px)}
.ff .ff-btn{display:inline-flex;align-items:center;justify-content:center;gap:.5em;height:44px;padding:0 18px;border-radius:999px;font-size:15px;font-weight:700;white-space:nowrap;
  transition:transform .16s var(--ff-ease),background-color .2s,color .2s,border-color .2s;text-decoration:none}
.ff .ff-btn:active{transform:scale(.97)}
.ff .ff-btn:disabled{opacity:.45;cursor:not-allowed;transform:none}
.ff .ff-btn.pri{background:var(--ff-plum);color:#fff;box-shadow:0 10px 24px -12px rgba(106,56,140,.8)}
.ff .ff-btn.pri:hover:not(:disabled){background:var(--ff-plum-7)}
.ff .ff-btn.lt{background:#fff;color:var(--ff-plum)}
.ff .ff-btn.gh{border:1px solid rgba(201,179,221,.5);color:#fff}
.ff .ff-btn.gh:hover{background:rgba(255,255,255,.08)}
.ff .ff-btn.ol{border:1px solid var(--ff-lilac-3);color:var(--ff-plum);background:#fff}
.ff .ff-btn.ol:hover:not(:disabled){background:var(--ff-lilac-1)}
.ff .ff-btn.sm{height:38px;padding:0 14px;font-size:14px}
.ff .ff-btn.wide{width:100%}
.ff-panel{min-width:0;background:#fff;border:1px solid var(--ff-lilac-2);border-radius:28px;padding:20px;display:grid;gap:22px}
@media (min-width:960px){.ff-panel{position:sticky;top:96px}}
.ff-sec{display:grid;gap:10px;min-width:0}
.ff-sec h3{margin:0;font-size:13px;letter-spacing:.1em;text-transform:uppercase;color:var(--ff-plum);font-weight:700;display:flex;align-items:center;gap:8px}
.ff-sec h3 i{font-style:normal;width:22px;height:22px;border-radius:50%;background:var(--ff-lilac-1);display:grid;place-items:center;font-size:12px;letter-spacing:0}
.ff-sec>p{margin:0;font-size:15px;color:var(--ff-ink-2)}
.ff-src{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.ff-src .ff-btn{padding:0 10px}
.ff-src .full{grid-column:1/-1}
.ff-priv{display:flex;align-items:center;gap:8px;font-size:14px;color:var(--ff-ink-2);margin:0}
.ff-priv .ff-i{color:var(--ff-plum)}
.ff-warn{margin:0;display:flex;gap:8px;align-items:flex-start;font-size:14px;line-height:1.45;color:#7A4A00;background:#FFF6E0;border:1px solid #F0D9A0;border-radius:14px;padding:10px 12px}
.ff-warn .ff-i{margin-top:2px}
/* proportion rows */
.ff-rows{list-style:none;margin:0;padding:0;display:grid;gap:8px}
.ff-r{display:grid;gap:8px;padding:12px 14px;border-radius:18px;border:1px solid var(--ff-lilac-2);background:#fff;transition:border-color .2s,background-color .2s}
.ff-r.on{border-color:var(--ff-lilac-3);background:var(--ff-wash)}
.ff-r.gold{background:linear-gradient(135deg,#FFFBF0,#FFF4DC);border-color:#EAD5A2}
.ff-rh{display:flex;align-items:center;gap:10px;min-width:0}
.ff-rh b{font-size:15.5px;line-height:1.3;flex:1;min-width:0}
.ff-rh .ff-tg{display:inline-flex;align-items:center;gap:8px;font-size:13px;font-weight:700;color:var(--ff-plum);padding:4px 6px 4px 10px;border-radius:999px;min-height:36px}
.ff-rh .ff-tg:focus-visible{outline:2px solid var(--ff-lilac);outline-offset:2px}
.ff-tg .ff-sw{background:var(--ff-lilac-2)}
.ff-tg[aria-checked=true] .ff-sw{background:var(--ff-plum)}
.ff-r p{margin:0;font-size:13.5px;line-height:1.45;color:var(--ff-ink-2)}
.ff-meter{position:relative;height:22px;margin:2px 4px}
.ff-meter::before{content:"";position:absolute;left:0;right:0;top:10px;height:3px;border-radius:3px;background:linear-gradient(90deg,var(--ff-lilac-2),#F2DFAE 42%,var(--ff-gold) 50%,#F2DFAE 58%,var(--ff-lilac-2))}
.ff-meter .ideal{position:absolute;left:50%;top:3px;width:2px;height:17px;margin-left:-1px;background:var(--ff-gold-d);border-radius:2px}
.ff-meter .mk{position:absolute;top:5px;width:13px;height:13px;margin-left:-6.5px;border-radius:50%;transition:left .35s var(--ff-ease)}
.ff-meter .mk.b{background:#fff;border:2px solid var(--ff-ink-3)}
.ff-meter .mk.a{background:var(--ff-plum);border:2px solid #fff;box-shadow:0 0 0 1px var(--ff-plum)}
.ff-nums{display:flex;flex-wrap:wrap;gap:4px 14px;font-size:13px;color:var(--ff-ink-2);font-variant-numeric:tabular-nums}
.ff-nums b{color:var(--ff-ink);font-weight:700}
.ff-nums .a b{color:var(--ff-plum)}
.ff-nums .ok{color:var(--ff-gold-d);font-weight:700}
.ff-svc{font-size:13px;font-weight:700;color:var(--ff-plum);text-decoration:none;display:inline-flex;align-items:center;gap:4px}
.ff-svc:hover{text-decoration:underline}
.ff-seg{display:grid;grid-template-columns:1fr 1fr;gap:4px;padding:4px;border-radius:999px;background:var(--ff-lilac-1)}
.ff-seg button{min-height:40px;border-radius:999px;font-weight:700;font-size:14.5px;color:var(--ff-plum);transition:background-color .2s,color .2s}
.ff-seg button[aria-pressed=true]{background:var(--ff-plum);color:#fff;box-shadow:0 8px 18px -10px rgba(106,56,140,.8)}
.ff-seg button:focus-visible{outline:2px solid var(--ff-lilac);outline-offset:2px}
.ff-lab{font-size:14px;font-weight:700;color:var(--ff-ink)}
.ff-amt{display:grid;gap:6px}
.ff-amt div{display:flex;justify-content:space-between;font-size:14px;font-weight:700;color:var(--ff-ink)}
.ff-amt output{color:var(--ff-plum);font-variant-numeric:tabular-nums}
.ff input[type=range]{-webkit-appearance:none;appearance:none;width:100%;height:6px;border-radius:6px;margin:10px 0;
  background:linear-gradient(90deg,var(--ff-plum) var(--v,70%),var(--ff-lilac-2) var(--v,70%));outline-offset:8px}
.ff input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:26px;height:26px;border-radius:50%;background:#fff;border:2px solid var(--ff-plum);box-shadow:0 6px 16px -6px rgba(74,22,104,.5);cursor:pointer}
.ff input[type=range]::-moz-range-thumb{width:24px;height:24px;border-radius:50%;background:#fff;border:2px solid var(--ff-plum);cursor:pointer}
.ff-note{margin:0;font-size:13px;line-height:1.45;color:var(--ff-ink-3)}
.ff-saves{display:grid;gap:8px}
.ff-err{margin:0;font-size:14px;color:#CC3366}
.ff-foot{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:10px 16px;padding:14px 18px;border-radius:20px;background:var(--ff-wash);border:1px solid var(--ff-lilac-2)}
.ff-foot p{margin:0;font-size:15px;color:var(--ff-ink-2)}
@media (prefers-reduced-motion:reduce){.ff *{transition:none!important;animation-duration:1.6s!important}}

@media (max-width:959px){.ff-props{order:2}}
.ff-tot{display:grid;gap:14px;padding:18px 20px;border-radius:22px;background:linear-gradient(135deg,#FFFBF0,#FFF0CF);border:1px solid #EAD5A2}
.ff-tot-h{display:flex;align-items:flex-start;justify-content:space-between;gap:12px 20px;flex-wrap:wrap}
.ff-tot-h b{font-size:17px}
.ff-tot-h p{margin:2px 0 0;font-size:13.5px;line-height:1.45;color:var(--ff-ink-2);max-width:44ch}
.ff-ml{font-size:40px;font-weight:700;line-height:1;color:var(--ff-gold-d);font-variant-numeric:tabular-nums;white-space:nowrap}
.ff-ml small{font-size:17px;margin-left:4px}
.ff-kpis{display:flex;flex-wrap:wrap;gap:8px}
.ff-kpis span{display:inline-flex;align-items:center;gap:6px;height:34px;padding:0 14px;border-radius:999px;background:#fff;border:1px solid #EAD5A2;font-size:14px;font-weight:700;color:var(--ff-ink)}
.ff-kpis .ff-i{color:var(--ff-gold-d)}
.ff-kpis em{font-style:normal;font-weight:400;color:var(--ff-ink-2)}
.ff-list{list-style:none;margin:0;padding:0;display:grid;gap:8px}
@media (min-width:700px){.ff-list{grid-template-columns:1fr 1fr}}
.ff-area{padding:12px 14px;border-radius:18px;border:1px solid var(--ff-lilac-2);background:#fff;display:grid;gap:8px;align-content:start}
.ff-area-h{display:flex;align-items:center;gap:10px}
.ff-area-h b{flex:1;font-size:15.5px;line-height:1.3}
.ff-area-h span{font-weight:700;color:var(--ff-plum);font-variant-numeric:tabular-nums;white-space:nowrap}
.ff-dot{width:10px;height:10px;border-radius:50%;flex:none;box-shadow:0 0 0 2px #fff,0 0 0 3px rgba(31,10,48,.18)}
.ff-fx{margin:0;font-size:14px;line-height:1.45;color:var(--ff-ink-2)}
.ff-tags{list-style:none;margin:0;padding:0;display:flex;flex-wrap:wrap;gap:5px}
.ff-tags li{font-size:12.5px;line-height:1.3;padding:4px 10px;border-radius:999px;background:var(--ff-lilac-1);color:var(--ff-plum-7)}
.ff-prod{display:flex;align-items:center;gap:8px;flex-wrap:wrap;font-size:13px;color:var(--ff-ink-2)}
.ff-prod span{font-weight:700;color:var(--ff-ink)}
.ff-prod select{flex:1;min-width:150px;height:34px;padding:0 30px 0 12px;border-radius:999px;border:1px solid var(--ff-lilac-2);background:#fff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236A388C' stroke-width='2.5'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E") no-repeat right 12px center;appearance:none;-webkit-appearance:none;font:inherit;font-size:13.5px;color:var(--ff-ink);cursor:pointer}
.ff-prod select:focus-visible{outline:2px solid var(--ff-plum);outline-offset:2px}
.ff-prod small{font-size:12.5px;color:var(--ff-ink-3)}
.ff-prodp{margin:10px 0 0;font-size:13px;line-height:1.5;color:var(--ff-ink-3)}
.ff-none{margin:0;padding:18px;border-radius:18px;border:1px dashed var(--ff-lilac-3);color:var(--ff-ink-2);font-size:15px;text-align:center}
.ff-ref{display:flex;gap:10px;align-items:flex-start;margin:0;font-size:13px;line-height:1.5;color:var(--ff-ink-3)}
.ff-ref .ff-i{color:var(--ff-plum);margin-top:2px}
.ff-ref a{color:var(--ff-plum)}
.ff-step{display:grid;gap:8px}
.ff-step+.ff-step{margin-top:6px}
.ff-step-h{display:flex;align-items:baseline;gap:8px;font-size:13px;font-weight:700;color:var(--ff-ink)}
.ff-step-h small{font-weight:400;color:var(--ff-ink-3);font-size:12.5px}
.ff-chips{display:flex;flex-wrap:wrap;gap:6px}
.ff .ff-chip{display:inline-flex;align-items:center;gap:7px;min-height:38px;padding:6px 14px 6px 10px;border-radius:999px;border:1px solid var(--ff-lilac-3);background:#fff;font-size:14px;font-weight:700;color:var(--ff-ink-2);text-align:left;line-height:1.25;transition:background-color .2s,border-color .2s,color .2s}
.ff .ff-chip .ff-dot{width:9px;height:9px;opacity:.35;transition:opacity .2s}
.ff .ff-chip[aria-pressed=true]{background:var(--ff-plum);border-color:var(--ff-plum);color:#fff}
.ff .ff-chip[aria-pressed=true] .ff-dot{opacity:1;box-shadow:0 0 0 2px var(--ff-plum),0 0 0 3px rgba(255,255,255,.5)}
.ff .ff-chip:hover:not([aria-pressed=true]){background:var(--ff-lilac-1)}
.ff .ff-chip:focus-visible{outline:2px solid var(--ff-lilac);outline-offset:2px}
.ff-deep{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 12px;border-radius:14px;background:var(--ff-wash);border:1px solid var(--ff-lilac-2)}
.ff-deep span{font-size:13.5px;color:var(--ff-ink-2);line-height:1.4}
.ff-deep b{display:block;color:var(--ff-ink);font-size:14px}
.ff-deep .ff-tg{display:inline-flex;align-items:center;min-height:36px;padding:0 4px}
.ff-tg .ff-sw{background:var(--ff-lilac-2)}
.ff-tg[aria-checked=true] .ff-sw{background:var(--ff-plum)}
.ff-g .pt{stroke:rgba(20,6,31,.65);stroke-width:1.2;vector-effect:non-scaling-stroke}
.ff-g .halo{fill:none;stroke:#fff;stroke-width:1;opacity:.6;vector-effect:non-scaling-stroke}
.ff.nopoints .ff-g{opacity:0}
.ff-g{transition:opacity .25s}

.ff-view{min-height:0!important;aspect-ratio:5/6;max-height:78vh;width:100%;place-items:stretch}
@media (min-width:960px){.ff-view{aspect-ratio:auto;height:min(76vh,700px)}}
.ff-3d{position:absolute;inset:0;border-radius:20px;overflow:hidden;background:radial-gradient(60% 55% at 50% 42%,rgba(142,45,207,.12),transparent 72%),#12051d}
.ff-3d canvas{position:absolute;inset:0;width:100%;height:100%;display:block;cursor:grab}
.ff-3d canvas:active{cursor:grabbing}
.ff-hud{position:absolute;left:10px;right:10px;top:10px;display:flex;justify-content:space-between;gap:8px;pointer-events:none}
.ff-hud>*{pointer-events:auto}
.ff-seg2{display:inline-flex;gap:2px;padding:3px;border-radius:999px;background:rgba(31,10,48,.62);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px)}
.ff-seg2 button{min-height:34px;padding:0 12px;border-radius:999px;font-size:13px;font-weight:700;color:var(--ff-on-2)}
.ff-seg2 button[aria-pressed=true]{background:#fff;color:var(--ff-plum)}
.ff-hint{position:absolute;left:0;right:0;bottom:12px;margin:0;text-align:center;font-size:12.5px;color:var(--ff-on-2);display:flex;justify-content:center;align-items:center;gap:6px;pointer-events:none}
.ff-ba{display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:12px;padding:4px 8px;color:#fff;font-size:14px;font-weight:700}
.ff .ff-ba input[type=range]{background:linear-gradient(90deg,#F49AC1 var(--v,100%),rgba(255,255,255,.2) var(--v,100%));margin:0}
.ff .ff-ba input[type=range]::-webkit-slider-thumb{border-color:#F49AC1}
.ff-ba-r{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:0 8px 6px;flex-wrap:wrap}
.ff-note3{margin:0;font-size:12.5px;line-height:1.45;color:var(--ff-on-2);max-width:52ch}
.ff-ba output{font-variant-numeric:tabular-nums;color:#F49AC1;min-width:4ch;text-align:right}
.ff-wipe{position:absolute;inset:0;pointer-events:none}
.ff-wline{position:absolute;top:0;bottom:0;left:var(--x);width:32px;margin-left:-16px;pointer-events:auto;cursor:ew-resize;touch-action:none}.ff-wline::after{content:"";position:absolute;top:0;bottom:0;left:15px;width:2px;background:rgba(255,255,255,.85);box-shadow:0 0 0 1px rgba(31,10,48,.25)}
.ff .ff-wknob{position:absolute;top:50%;left:var(--x);width:44px;height:44px;margin:-22px 0 0 -22px;border-radius:50%;background:#fff;color:var(--ff-plum);display:grid;place-items:center;box-shadow:0 10px 24px -8px rgba(20,6,31,.6);cursor:ew-resize;touch-action:none;pointer-events:auto}
.ff .ff-wknob:focus-visible{outline:2px solid var(--ff-lilac);outline-offset:3px}
.ff-bt{top:58px}
.ff-load{position:absolute;inset:0;display:grid;place-content:center;justify-items:center;gap:12px;color:#fff;font-weight:700}
`;

/* every injection point of the plan on the head, with the mL at that point */
function headPoints(plan){
  const out = [];
  for (const x of plan.list) {
    const parts = HEAD_AT[x.k] || [], per = x.vol / parts.length;   // vol is per side (or the centre total) shared by its parts
    for (const part of parts) for (const v of part) out.push({v, ml:per, color:STEP_C[x.step], k:x.k});
  }
  return out;
}

/* ===================================================================== */
let styleRefs = 0, styleEl = null;

export function mount(container, opts = {}){
  const lang = opts.lang === 'th' ? 'th' : 'en', S = STR[lang];
  const emit = (n, d) => { try { opts.onEvent && opts.onEvent(n, d); } catch (e) {} };
  const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;'}[c]));
  const n2 = x => (Math.round(x * 100) / 100).toLocaleString(lang === 'th' ? 'th-TH' : 'en-GB', {maximumFractionDigits:2});
  const plural = (w, n) => Array.isArray(w) ? w[n === 1 ? 0 : 1] : w;
  if (!styleRefs++) { styleEl = document.createElement('style'); styleEl.dataset.feature = 'filler'; styleEl.textContent = CSS; document.head.append(styleEl); }

  const state = {on:new Set(['cheeks']), deep:false, points:true, planned:false, gender:'female', view:'q', amt:100, head:null, err:null, pick:{}};
  try {
    const p = JSON.parse(localStorage.getItem('apex.filler') || 'null');
    if (p) { if (Array.isArray(p.on)) state.on = new Set(p.on.filter(k => CONCERNS.some(c => c.k === k))); state.deep = !!p.deep; if (p.points === false) state.points = false; if (p.gender === 'male') state.gender = 'male'; if (p.pick && typeof p.pick === 'object') for (const c in p.pick) if (productsFor(c).some(x => x.k === p.pick[c])) state.pick[c] = p.pick[c]; }
  } catch (e) {}
  const remember = () => { try { localStorage.setItem('apex.filler', JSON.stringify({on:[...state.on], deep:state.deep, points:state.points, gender:state.gender, pick:state.pick})); } catch (e) {} };

  const chip = c => `<button type="button" class="ff-chip" data-c="${c.k}" aria-pressed="false"><span class="ff-dot" style="background:${STEP_C[c.step]}"></span>${esc(S.c[c.k])}</button>`;
  const root = document.createElement('div');
  root.className = 'ff'; root.lang = lang;
  root.innerHTML = `
  <div class="ff-main">
    <section class="ff-stage" aria-label="${esc(S.head)}">
      <div class="ff-view">
        <div class="ff-3d" data-r="host"></div>
        <div class="ff-load" data-r="load"><span class="ff-spin"></span><span>${esc(S.loading)}</span></div>
        <div class="ff-error" data-r="err" hidden><span class="ff-big">${ic('alert')}</span><h3>${esc(S.webgl)}</h3></div>
        <div class="ff-hud">
          <div class="ff-seg2" role="group" aria-label="${esc(S.head)}"><button data-g="female" aria-pressed="true">${esc(S.women)}</button><button data-g="male" aria-pressed="false">${esc(S.men)}</button></div>
          <div class="ff-seg2" role="group"><button data-v="front" aria-pressed="false">${esc(S.front)}</button><button data-v="q" aria-pressed="true">${esc(S.q)}</button><button data-v="side" aria-pressed="false">${esc(S.side)}</button></div>
        </div>
        <div class="ff-wipe" data-r="wipe" style="--x:50%"><span class="ff-wline"></span><button type="button" class="ff-wknob" aria-label="${esc(S.wipe)}">${ic('move')}</button></div>
        <span class="ff-tag l ff-bt">${esc(S.before)}</span><span class="ff-tag r ff-bt">${esc(S.after)}</span>
        <span class="ff-tag sim" style="bottom:38px">${esc(S.sim)}</span>
        <p class="ff-hint">${ic('turn')}${esc(S.drag)}</p>
      </div>
      <label class="ff-ba"><span>${esc(S.amount)}</span><input type="range" min="0" max="200" step="5" value="100" data-r="ba" aria-label="${esc(S.amount)}"><output data-r="bav"></output></label>
      <div class="ff-ba-r"><p class="ff-note3">${esc(S.drops)}</p>
        <button class="ff-sw-b" data-act="points" role="switch" aria-checked="true">${esc(S.points)}<span class="ff-sw" aria-hidden="true"></span></button></div>
    </section>
    <section class="ff-props" aria-live="polite">
      <div class="ff-tot">
        <div class="ff-tot-h"><div><b>${esc(S.total)}</b><p>${esc(S.totalP)}</p></div><div class="ff-ml"><span data-r="ml">0</span><small>${esc(S.ml)}</small></div></div>
        <div class="ff-kpis" data-r="kpis"></div>
      </div>
      <div data-r="areas"></div>
      <p class="ff-ref">${ic('book')}<span>${esc(S.ref)} <a href="${REF}" target="_blank" rel="noopener">${esc(S.refLink)}</a></span></p>
    </section>
    <aside class="ff-panel">
      <div class="ff-sec">
        <h3><i>1</i>${esc(S.concerns)}</h3>
        <p>${esc(S.concernsP)}</p>
        ${STEPS.map(st => `<div class="ff-step"><div class="ff-step-h">${esc(S.step[st])}<small>${esc(S.stepP[st])}</small></div>
          <div class="ff-chips">${CONCERNS.filter(c => c.step === st).map(chip).join('')}</div></div>`).join('')}
        <div class="ff-deep" data-r="deep" hidden><span><b>${esc(S.deep)}</b>${esc(S.deepP)}</span>
          <button class="ff-tg" data-act="deep" role="switch" aria-checked="false" aria-label="${esc(S.deep)}"><span class="ff-sw" aria-hidden="true"></span></button></div>
      </div>
      <div class="ff-sec">
        <h3><i>2</i>${esc(S.save)}</h3>
        <div class="ff-saves">
          <button class="ff-btn pri wide" data-act="save" disabled>${ic('download')}${esc(S.saveBtn)}</button>
          ${opts.noPlan ? '' : `<button class="ff-btn ol wide" data-act="plan">${ic('plus')}<span>${esc(S.plan)}</span></button>`}
          <a class="ff-btn ol wide" href="${esc(opts.consult || 'consult.html')}">${ic('msg')}${esc(S.consult)}</a>
        </div>
        <p class="ff-err" data-r="saveerr" hidden></p>
      </div>
    </aside>
  </div>
  <div class="ff-foot"><p>${esc(S.vary)}</p></div>`;
  container.append(root);

  const $ = s => root.querySelector(s), $$ = s => [...root.querySelectorAll(s)], R = k => root.querySelector(`[data-r="${k}"]`);
  const ba = R('ba');
  const scaled = (P, f) => {
    const r2 = x => Math.round(x * 100) / 100, total = r2(P.total * f), byConcern = {};
    for (const k in P.byConcern) byConcern[k] = {...P.byConcern[k], total:r2(P.byConcern[k].total * f)};
    return {...P, total, byConcern, syringes:syringesFor(byConcern, state.pick), sessions:Math.max(1, Math.ceil(total / PER_SESSION - 1e-9))};
  };
  const basePlan = () => planFor([...state.on], state.deep);
  const curPlan = () => scaled(basePlan(), state.amt / 100);

  /* ---------- the plan ---------- */
  const prodOf = c => PRODUCTS.find(x => x.k === state.pick[c] && x.areas.includes(c));
  const prodRow = c => {
    const ps = productsFor(c); if (!ps.length) return '';
    const p = prodOf(c);
    return `<label class="ff-prod"><span>${esc(S.prod)}</span><select data-pick="${c}">
      <option value="">${esc(S.doc)}</option>${ps.map(x => `<option value="${x.k}"${p && p.k === x.k ? ' selected' : ''}>${esc(x.name)}</option>`).join('')}</select>
      ${p ? `<small>${esc(S.size.replace('{n}', n2(p.ml)))}</small>` : ''}</label>`;
  };

  function panel(P){
    R('ml').textContent = n2(P.total);
    R('kpis').innerHTML = P.list.length ? `<span>${ic('drop')}${P.syringes} ${esc(plural(S.syr, P.syringes))}</span>`
      + `<span>${ic('check')}${P.sessions} ${esc(plural(S.ses, P.sessions))} <em>· ${esc(S.sesP.replace('{n}', PER_SESSION))}</em></span>` : '';
    R('areas').innerHTML = P.list.length ? `<ul class="ff-list">${CONCERNS.filter(c => P.byConcern[c.k]).map(c => {
      const b = P.byConcern[c.k];
      return `<li class="ff-area"><div class="ff-area-h"><span class="ff-dot" style="background:${STEP_C[c.step]}"></span><b>${esc(S.c[c.k])}</b><span>${n2(b.total)} ${esc(S.ml)}</span></div>
        <p class="ff-fx">${esc(S.fx[c.k])}</p>
        <ul class="ff-tags">${b.codes.map(x => `<li>${esc(S.a[x.k])}</li>`).join('')}</ul>${prodRow(c.k)}</li>`;
    }).join('')}</ul><p class="ff-prodp">${esc(S.prodP)}</p>` : `<p class="ff-none">${esc(S.none)}</p>`;
  }
  function draw(){
    const P = curPlan();
    panel(P);
    if (state.head) state.head.setPlan(headPoints(basePlan()));
  }
  function sync(){
    $$('[data-c]').forEach(b => b.setAttribute('aria-pressed', String(state.on.has(b.dataset.c))));
    R('deep').hidden = !state.on.has('folds');
    $('[data-act="deep"]').setAttribute('aria-checked', String(state.deep));
    $('[data-act="points"]').setAttribute('aria-checked', String(state.points));
    $$('[data-g]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.g === state.gender)));
    $$('[data-v]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.v === state.view)));
    ba.value = state.amt; ba.style.setProperty('--v', state.amt / 2 + '%'); R('bav').textContent = state.amt + '%';
    $('[data-act="save"]').disabled = !state.head;
    const pl = $('[data-act="plan"]');
    if (pl) pl.innerHTML = (state.planned ? ic('check') : ic('plus')) + `<span>${esc(state.planned ? S.planned : S.plan)}</span>`;
    if (state.head) { state.head.setPoints(state.points); }
  }

  /* ---------- the head ---------- */
  let alive = true;
  createHead(R('host'), {threeUrl:opts.threeUrl, base:opts.base || '', gender:state.gender, sparkle:!!opts.sparkle, features:!!opts.sparkle, net:!!opts.sparkle, soft:!!opts.soft, maleMorph:opts.maleMorph, fadeOnScroll:!!opts.fadeOnScroll}).then(h => {
    if (!alive) { h.destroy(); return; }
    state.head = h; R('load').hidden = true;
    h.setView(state.view);
    h.jumpAmount(0); setW(WIPE_AT[state.view]); draw(); sync();
    setTimeout(() => h.setAmount(state.amt / 100), 350);   // the filler goes in once the head is up
    emit('filler:ready', {});
  }).catch(e => { console.warn('[filler] 3D head', e); R('load').hidden = true; R('err').hidden = false; emit('filler:error', {error:'webgl'}); });

  /* ---------- save: front before and after with the areas and amounts underneath ---------- */
  async function save(){
    const err = R('saveerr'); err.hidden = true;
    if (!state.head) return;
    try {
      const P = curPlan(), font = getComputedStyle(root).fontFamily;
      try { await document.fonts.load(`700 20px ${font}`); } catch (e) {}
      const w = 560, rowH = 680, gap = 12, pad = 32;
      const b0 = state.head.snapshot(0, w, rowH, -.9), b1 = state.head.snapshot(state.amt / 100, w, rowH, -.9);
      const rows = CONCERNS.filter(c => P.byConcern[c.k]);
      const W = w * 2 + gap + pad * 2, H = pad + rowH + 30 + (rows.length + 1) * 44 + 110;
      const c = document.createElement('canvas'); c.width = W; c.height = H;
      const g = c.getContext('2d');
      g.fillStyle = '#1F0A30'; g.fillRect(0, 0, W, H);
      const box = (x, img) => { g.save(); g.beginPath(); g.roundRect ? g.roundRect(x, pad, w, rowH, 20) : g.rect(x, pad, w, rowH); g.fillStyle = '#2A0F40'; g.fill(); g.clip(); g.drawImage(img, x, pad, w, rowH); g.restore(); };
      box(pad, b0); box(pad + w + gap, b1);
      const pill = (t, x, y, bg, fg) => { g.font = `700 20px ${font}`; const tw = g.measureText(t).width + 24; g.fillStyle = bg; g.beginPath(); g.roundRect ? g.roundRect(x, y, tw, 34, 17) : g.rect(x, y, tw, 34); g.fill(); g.fillStyle = fg; g.textBaseline = 'middle'; g.fillText(t, x + 12, y + 18); };
      pill(S.before, pad + 12, pad + 12, 'rgba(255,255,255,.12)', '#fff');
      pill(S.after, pad + w + gap + 12, pad + 12, 'rgba(255,255,255,.12)', '#fff');
      pill(S.sim, pad + w + gap + 12, pad + rowH - 46, 'rgba(255,255,255,.9)', '#6A388C');
      let y = pad + rowH + 50;
      g.textBaseline = 'alphabetic';
      g.font = `700 26px ${font}`; g.fillStyle = '#E3B85C'; g.fillText(S.total, pad, y);
      const mt = `${n2(P.total)} ${S.ml} · ${P.syringes} ${plural(S.syr, P.syringes)}`;
      g.fillText(mt, W - pad - g.measureText(mt).width, y);
      y += 44;
      for (const r of rows) {
        g.font = `700 24px ${font}`; g.fillStyle = '#fff'; g.fillText(S.c[r.k], pad, y);
        const pr = prodOf(r.k); if (pr) { const x0 = pad + g.measureText(S.c[r.k]).width + 14; g.font = `400 20px ${font}`; g.fillStyle = '#E3B85C'; g.fillText(pr.name, x0, y); }
        g.font = `400 22px ${font}`; g.fillStyle = '#CDB9DD';
        const txt = `${n2(P.byConcern[r.k].total)} ${S.ml}`;
        g.fillText(txt, W - pad - g.measureText(txt).width, y);
        y += 44;
      }
      g.font = `400 18px ${font}`; g.fillStyle = '#CDB9DD';
      g.fillText(S.refLink, pad, H - 60);
      g.font = `400 20px ${font}`;
      g.fillText(S.vary, pad, H - 28);
      const bw = g.measureText(S.brand).width; g.fillText(S.brand, W - pad - bw, H - 28);
      const blob = await new Promise(res => c.toBlob(res, 'image/jpeg', .9));
      if (!blob) throw new Error('blob');
      const name = 'apex-filler-simulation.jpg', fl = new File([blob], name, {type:'image/jpeg'});
      let shared = false;
      if (navigator.canShare && navigator.share) {
        try { if (navigator.canShare({files:[fl]})) { await navigator.share({files:[fl], title:S.brand}); shared = true; } }
        catch (e) { if (e && e.name === 'AbortError') shared = true; }
      }
      if (!shared) {
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name;
        document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
      }
      emit('filler:saved', {on:[...state.on], total:P.total});
    } catch (e) { err.textContent = S.err.save; err.hidden = false; }
  }

  /* ---------- events ---------- */
  function onClick(e){
    const cb = e.target.closest('[data-c]');
    if (cb) {
      const k = cb.dataset.c; state.on.has(k) ? state.on.delete(k) : state.on.add(k); remember(); emit('filler:concern', {concern:k, on:state.on.has(k)});
      sync(); draw();
      if (state.head && state.on.has(k)) { state.head.jumpAmount(0); state.head.setAmount(state.amt / 100); }   // replay the filler going in
      return;
    }
    const gb = e.target.closest('[data-g]');
    if (gb) { state.gender = gb.dataset.g; remember(); if (state.head) state.head.setGender(state.gender); sync(); return; }
    const vb = e.target.closest('[data-v]');
    if (vb) { state.view = vb.dataset.v; if (state.head) state.head.setView(state.view); setW(WIPE_AT[state.view]); sync(); return; }
    const b = e.target.closest('[data-act]'); if (!b) return;
    const a = b.dataset.act;
    if (a === 'points') { state.points = !state.points; remember(); sync(); }
    else if (a === 'deep') { state.deep = !state.deep; remember(); sync(); draw(); }
    else if (a === 'save') save();
    else if (a === 'plan') { state.planned = true; emit('plan:add', {procedure:'consult', source:'filler', concerns:[...state.on], ml:curPlan().total}); sync(); }
  }
  root.addEventListener('click', onClick);
  const onPick = e => { const sel = e.target.closest('[data-pick]'); if (!sel) return; if (sel.value) state.pick[sel.dataset.pick] = sel.value; else delete state.pick[sel.dataset.pick]; remember(); panel(curPlan()); const n = R('areas').querySelector(`[data-pick="${sel.dataset.pick}"]`); if (n) n.focus(); };
  root.addEventListener('change', onPick);
  ba.addEventListener('input', () => { state.amt = +ba.value; sync(); panel(curPlan()); if (state.head) state.head.jumpAmount(state.amt / 100); });
  /* the wipe line */
  const wipe = R('wipe'), view = $('.ff-view');
  let wx = .5, wd = null;
  const setW = x => { wx = Math.max(.02, Math.min(.98, x)); wipe.style.setProperty('--x', wx * 100 + '%'); if (state.head) state.head.setWipe(wx); };
  const knob = $('.ff-wknob');
  const wEnd = e => { if (wd === e.pointerId) wd = null; };
  [knob, $('.ff-wline')].forEach(h => {
    h.addEventListener('pointerdown', e => { wd = e.pointerId; try { h.setPointerCapture(e.pointerId); } catch (er) {} e.preventDefault(); e.stopPropagation(); });
    h.addEventListener('pointermove', e => { if (wd !== e.pointerId) return; const r = view.getBoundingClientRect(); setW((e.clientX - r.left) / r.width); });
    h.addEventListener('pointerup', wEnd); h.addEventListener('pointercancel', wEnd);
  });
  knob.addEventListener('keydown', e => { const d = {ArrowLeft:-.05, ArrowRight:.05}[e.key]; if (d) { e.preventDefault(); setW(wx + d); } });

  sync(); draw();
  return {
    destroy(){
      alive = false; if (state.head) state.head.destroy();
      root.removeEventListener('click', onClick); root.removeEventListener('change', onPick); root.remove();
      if (!--styleRefs && styleEl) { styleEl.remove(); styleEl = null; }
    },
    _state:state, _plan:curPlan,
  };
}
