'use strict';



/**
 * add event listener on multiple elements
 */
const addEventOnElements = function (elements, eventType, callback) {
  for (let i = 0, len = elements.length; i < len; i++) {
    elements[i].addEventListener(eventType, callback);
  }
}



/**
 * PRELOADER
 */
const preloader = document.querySelector("[data-preloader]");

window.addEventListener("load", function () {
  if (preloader) preloader.classList.add("loaded");
  document.body.classList.add("loaded");
});



/**
 * MOBILE NAVBAR
 */
const navbar = document.querySelector("[data-navbar]");
const navTogglers = document.querySelectorAll("[data-nav-toggler]");
const overlay = document.querySelector("[data-overlay]");

const toggleNav = function () {
  if (!navbar) return;
  navbar.classList.toggle("active");
  if (overlay) overlay.classList.toggle("active");
  document.body.classList.toggle("nav-active");
}

addEventOnElements(navTogglers, "click", toggleNav);



/**
 * HEADER & BACK TOP BTN
 */
const header = document.querySelector("[data-header]");
const backTopBtn = document.querySelector("[data-back-top-btn]");

const activeElementOnScroll = function () {
  if (!header || !backTopBtn) return;
  if (window.scrollY > 100) {
    header.classList.add("active");
    backTopBtn.classList.add("active");
  } else {
    header.classList.remove("active");
    backTopBtn.classList.remove("active");
  }
}

window.addEventListener("scroll", activeElementOnScroll);



/**
 * SCROLL REVEAL
 */
const revealElements = document.querySelectorAll("[data-reveal]");

const revealElementOnScroll = function () {
  for (let i = 0, len = revealElements.length; i < len; i++) {
    if (revealElements[i].getBoundingClientRect().top < window.innerHeight / 1.15) {
      revealElements[i].classList.add("revealed");
    } else {
      revealElements[i].classList.remove("revealed");
    }
  }
}

window.addEventListener("scroll", revealElementOnScroll);
window.addEventListener("load", revealElementOnScroll);





/* ===== Symptoms slider + modal integration ===== */
(function () {
  const track = document.getElementById('sympTrack');
  if (!track) return;

  const leftBtn = document.querySelector('.symp-left');
  const rightBtn = document.querySelector('.symp-right');

  // originals and n
  const originals = Array.from(track.children);
  const n = originals.length;
  if (n === 0) return;

  // ensure dataset.index for originals (0..n-1)
  originals.forEach((el, i) => { el.dataset.index = i; });

  // clone last n -> prepend, clone first n -> append
  const prependClones = originals.map(item => item.cloneNode(true)).reverse();
  prependClones.forEach(clone => track.insertBefore(clone, track.firstChild));
  const appendClones = originals.map(item => item.cloneNode(true));
  appendClones.forEach(clone => track.appendChild(clone));

  let itemWidth = 0, gap = 0, index = n, isAnimating = false;

  const setTransition = (on = true) => { track.style.transition = on ? 'transform .45s cubic-bezier(.22,.9,.35,1)' : 'none'; };

  function recalc() {
    const sample = track.querySelector('.symp-item');
    itemWidth = sample ? sample.offsetWidth : 0;
    gap = parseFloat(getComputedStyle(track).gap) || 0;
    setTranslate();
  }

  function setTranslate() {
    const tx = index * (itemWidth + gap);
    track.style.transform = `translateX(-${tx}px)`;
  }

  function moveTo(i) {
    if (isAnimating) return;
    isAnimating = true;
    setTransition(true);
    index = i;
    setTranslate();
  }

  function moveNext() { moveTo(index + 1); }
  function movePrev() { moveTo(index - 1); }

  track.addEventListener('transitionend', () => {
    // if moved into appended clones (right)
    if (index >= n * 2) {
      setTransition(false);
      index = index - n;
      void track.offsetHeight;
      setTranslate();
    }
    // if moved into prepended clones (left)
    if (index < n) {
      setTransition(false);
      index = index + n;
      void track.offsetHeight;
      setTranslate();
    }
    requestAnimationFrame(() => { setTransition(true); isAnimating = false; });
  });

  leftBtn && leftBtn.addEventListener('click', movePrev);
  rightBtn && rightBtn.addEventListener('click', moveNext);

  window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') movePrev();
    if (e.key === 'ArrowRight') moveNext();
  });

  window.addEventListener('resize', () => {
    clearTimeout(window.__sympResizeTimer);
    window.__sympResizeTimer = setTimeout(recalc, 120);
  });

  // ---------- Modal logic ----------
  const modal = document.getElementById('sympModal');
  const modalOverlay = document.getElementById('sympModalOverlay');
  const modalClose = document.getElementById('sympModalClose');
  const modalImg = document.getElementById('sympModalImg');
  const modalTitle = document.getElementById('sympModalTitle');
  const modalText = document.getElementById('sympModalText');

  // Details for each symptom index (0..n-1) — edit as needed
  const symptomDetails = [
    // 0: Abdominal Pain 
        `<p><strong>Appendicitis:</strong> Periumbilical pain, fever, nausea — General Surgery.</p>
         <p><strong>Cholecystitis:</strong> RUQ pain, fever, worse after fatty meals — Surgery / Gastroenterology.</p>
         <p><strong>Pancreatitis:</strong> Epigastric pain radiating to back; raised lipase/amylase.</p>
         <p><strong>Gastritis/Dyspepsia:</strong> Epigastric discomfort, bloating, food-related.</p>
         <p><strong>Gastroenteritis:</strong> Diffuse pain with diarrhea, vomiting.</p>
         <p><strong>IBS:</strong> Cramping relieved by defecation, variable bowel habits, stress-related.</p>
         <p><strong>Ovarian torsion / PID / Renal stone:</strong> Consider in appropriate presentation.</p>`,

    // 1 back pain
    `
     <p><strong>Lumbar Disc Herniation:</strong> Sharp shooting pain radiating down the leg (sciatica), positive straight leg raise.</p>
     <p><strong>Lumbar Strain / Sprain:</strong> Diffuse low back pain, worse with movement, improves with rest .</p>
     <p><strong>Degenerative Disc Disease / Spondylosis:</strong> Chronic axial back pain with morning stiffness, worsens with posture or activity .</p>
     <p><strong>Spondylolisthesis:</strong> Low back pain with hamstring tightness, may show nerve compression signs .</p>
     <p><strong>Ankylosing Spondylitis:</strong> Chronic back pain in young adults, morning stiffness improving with activity, HLA-B27 positive.</p>
     <p><strong>Reactive / Psoriatic Arthritis:</strong> Back pain associated with skin or joint involvement, asymmetric presentation.</p>`,

    // 2 dental pain 
    `<p><strong>Dental Caries:</strong> Localized tooth sensitivity to sweet, hot, or cold with visible cavity or discoloration.</p>
<p><strong>Pulpitis:</strong> Sharp pain to hot/cold with spontaneous lingering pain, often worse at night .</p>
<p><strong>Periapical Abscess:</strong> Severe throbbing pain, tooth tender to percussion, swelling with possible pus discharge.</p>
<p><strong>Periodontal Abscess:</strong> Gingival swelling, mobile tooth, foul taste, bleeding gums — Endodontics / Periodontics.</p>
<p><strong>Pericoronitis:</strong> Pain around partially erupted tooth (often wisdom tooth), swelling, trismus, bad breath.</p>
<p><strong>TMJ Disorders:</strong> Pain near ear/jaw joint, clicking or popping, jaw stiffness, associated headache.</p>
<p><strong>Trigeminal Neuralgia:</strong> Sudden electric shock–like facial pain triggered by touch or chewing, usually unilateral.</p>
<p><strong>Sinusitis:</strong> Facial pressure or pain with nasal symptoms; upper teeth may hurt mimicking dental pain.</p>`,

    // 3  headache
    `<p><strong>Tension-type headache:</strong> Bilateral pressing or tightening pain, mild to moderate, not worsened by routine activity, usually no nausea.</p>

<p><strong>Migraine:</strong> Unilateral pulsating pain, moderate to severe intensity, worsens with activity, associated with photophobia, phonophobia, and nausea.</p>

<p><strong>Cluster headache:</strong> Severe one-sided eye or temple pain, with tearing and nasal congestion, occurring in repeated short attacks.</p>

<p><strong>Raised intracranial pressure:</strong> Headache worse in the morning or when lying down, may include vomiting and vision changes.</p>

<p><strong>Hypertensive headache:</strong> Occipital pain with possible visual disturbance, dizziness, or confusion.</p>

<p><strong>Cervicogenic headache:</strong> Pain referred from the neck, worsens with neck movements or poor posture.</p>

<p><strong>Sinusitis headache:</strong> Facial pressure or pain, blocked nose, worsens when bending forward.</p>

<p><strong>Intracranial hemorrhage:</strong> Sudden severe headache (“worst headache”), may include vomiting, neck stiffness, or loss of consciousness.</p>

<p><strong>Meningitis / Encephalitis:</strong> Fever, neck stiffness, sensitivity to light, altered awareness, or seizures.</p>`,

    // 4  knee pain
    `<p><strong>ACL Injury:</strong> Sudden knee pain after twisting injury, swelling, instability, and difficulty bearing weight.</p>

<p><strong>Osteoarthritis:</strong> Gradual knee pain with stiffness, worse in the morning or after long activity.</p>

<p><strong>Meniscus Tear:</strong> Pain with knee twisting, clicking or locking sensation, swelling after activity.</p>

<p><strong>Bursitis:</strong> Pain and swelling in front or sides of the knee, worsens with kneeling or pressure.</p>

<p><strong>Patellar Tendonitis:</strong> Pain below the kneecap, worse during running or jumping (“jumper’s knee”).</p>

<p><strong>IT Band Syndrome:</strong> Outer knee pain, especially during running or climbing stairs.</p>

<p><strong>Rheumatoid Arthritis:</strong> Symmetrical knee pain with swelling, morning stiffness improving through the day.</p>

<p><strong>Plica Syndrome:</strong> Pain with knee bending, clicking sensation near the inside of the knee.</p>`,

    // 5 chest pain 
    `<p><strong>Heart Attack (Myocardial Infarction):</strong> Severe central chest pain, pressure or heaviness, may radiate to left arm, jaw, or back; sweating and breathlessness.</p>

<p><strong>Angina:</strong> Chest tightness triggered by exertion or stress, relieved by rest; short episodes.</p>

<p><strong>Gastroesophageal Reflux (Acidity):</strong> Burning chest pain after meals, sour taste, worsens when lying down.</p>

<p><strong>Costochondritis:</strong> Sharp chest pain localized to chest wall, worsens with pressure or movement.</p>

<p><strong>Anxiety / Panic Attack:</strong> Chest tightness with fast heartbeat, breathlessness, trembling, sense of panic.</p>

<p><strong>Pneumonia:</strong> Chest pain with fever, cough, phlegm, worsens with deep breaths.</p>

<p><strong>Pulmonary Embolism:</strong> Sudden sharp chest pain with breathlessness, rapid heartbeat, possible fainting.</p>

<p><strong>Pneumothorax:</strong> Sudden one-sided chest pain with difficulty breathing, often after injury or spontaneously.</p>`,

    // 6 Scar Removal
    `<p><strong>Acne Scars:</strong> Depressed pits, boxcar or ice-pick marks left after acne healing; can be improved with laser, microneedling, or chemical peels.</p>

<p><strong>Hypertrophic Scars:</strong> Raised, firm scars within the wound area, commonly after burns or surgery; may improve with silicone gel, steroid injections, or laser.</p>

<p><strong>Keloids:</strong> Thick, overgrown scars extending beyond the original wound; may require injections, laser therapy, pressure treatment, or minor procedures.</p>

<p><strong>Post-Surgical Scars:</strong> Linear scars after operations that may appear red or thick initially; improve with time, gels, lasers, or resurfacing methods.</p>

<p><strong>Stretch Marks (Striae):</strong> Thin lines caused by rapid skin stretching (growth, pregnancy, weight changes); treated with microneedling or laser for texture improvement.</p>`,



    // 7Sudden-Unconciousness
    `<p><strong>Seizures:</strong> Sudden loss of consciousness with tonic–clonic movements, tongue biting, frothing, and confusion afterward; may have urinary incontinence.</p>

<p><strong>Ischemic / Hemorrhagic Stroke:</strong> Sudden focal weakness or numbness, headache, slurred speech, and possible collapse if severe.</p>

<p><strong>Subarachnoid Hemorrhage:</strong> Sudden “worst headache,” vomiting, extreme light sensitivity, neck stiffness, and rapid loss of consciousness.</p>

<p><strong>Raised Intracranial Pressure / Brain Tumor:</strong> Gradually worsening headache, vomiting, blurred vision, and possible sudden collapse if pressure spikes.</p>

<p><strong>Vasovagal Syncope:</strong> Brief fainting triggered by fear, pain, heat, or prolonged standing; warning signs include nausea, dizziness, and sweating.</p>

<p><strong>Arrhythmias:</strong> Sudden collapse without warning, rapid or irregular heartbeat, may happen during exertion or at rest.</p>

<p><strong>Myocardial Infarction:</strong> Chest discomfort, sweating, weakness, and collapse due to low blood pressure or rhythm disturbance.</p>

<p><strong>Hypoglycemia:</strong> Shaking, sweating, hunger, confusion, and possible collapse—common in diabetics or long fasting.</p>
`
  ];

  // Click handler (works for clones too)
  track.addEventListener('click', (e) => {
    const item = e.target.closest('.symp-item');
    if (!item) return;

    // determine original index (clones have dataset.index too)
    let origIndex = item.dataset.index;
    if (typeof origIndex === 'undefined') {
      // fallback: match by image src
      const img = item.querySelector('img');
      if (img) {
        const src = img.getAttribute('src');
        origIndex = originals.findIndex(o => o.querySelector('img') && o.querySelector('img').getAttribute('src') === src);
      }
    }
    origIndex = Number(origIndex);
    if (isNaN(origIndex) || origIndex < 0 || origIndex >= symptomDetails.length) origIndex = 0;

    // fill modal
    const imgEl = item.querySelector('img');
    if (imgEl) {
      modalImg.src = imgEl.src;
      modalImg.alt = imgEl.alt || '';
      modalTitle.textContent = imgEl.alt || '';
    } else {
      modalImg.src = '';
      modalTitle.textContent = '';
    }
    modalText.innerHTML = symptomDetails[origIndex] || '<p>No information available.</p>';

    // open modal
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    modalText.focus();
  });

  function closeModal() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  modalClose && modalClose.addEventListener('click', closeModal);
  modalOverlay && modalOverlay.addEventListener('click', closeModal);
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape' && modal.classList.contains('open')) closeModal(); });

  // initialize positioning
  window.addEventListener('load', () => {
    setTransition(false);
    recalc();
    requestAnimationFrame(() => setTransition(true));
  });

})();
