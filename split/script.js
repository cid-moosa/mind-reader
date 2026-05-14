(function(){
  const welcome = document.getElementById('welcome');
  const main = document.getElementById('main');
  const difficultySection = document.getElementById('difficultySection');
  const game = document.getElementById('game');
  const result = document.getElementById('result');
    const howBtn = document.getElementById('howBtn');
        const maxInput = document.getElementById('maxInput');
        const beginGame = document.getElementById('beginGame');
        const cardTitle = document.getElementById('cardTitle');
        const cardNumbers = document.getElementById('cardNumbers');
        const yesBtn = document.getElementById('yesBtn');
        const noBtn = document.getElementById('noBtn');
        const progress = document.getElementById('progress');
        const resultNum = document.getElementById('resultNum');
        const resultMessage = document.getElementById('resultMessage');
        const again = document.getElementById('again');
        const newGame = document.getElementById('newGame');
        const resultCard = document.getElementById('resultCard');
        const infoModal = document.getElementById('infoModal');
        const closeInfo = document.getElementById('closeInfo');

    let cards = [];
        let step = 0;
        let sum = 0;
  let answers = []; // record user's answers per shown card: true = yes, false = no
  let sumHistory = []; // snapshot of sum BEFORE each answer, used for Previous rollback
        let maxVal = 31;
    const MIN_MAX = 15;

        let welcomeTimer = null;
        function showSection(el){
          // hide all sections then reveal the requested one
          document.querySelectorAll('.section').forEach(s=>s.classList.remove('active'));
          if(el && el.classList) el.classList.add('active');
          // toggle 3D welcome panel class
          const panelEl = document.querySelector('.panel');
          const wt = document.getElementById('welcomeTrail');
          if(panelEl){
            if(el && el.id === 'welcome'){
              // enable the welcome-only 3D styling
              panelEl.classList.add('welcome-3d');
              // ensure the transform resets smoothly when later removed
              panelEl.style.transition = 'transform .08s linear';
              if(wt) wt.style.display = 'block';
            } else {
              // leaving welcome: remove 3D class and reset any transient transform
              panelEl.classList.remove('welcome-3d');
              // add a smooth reset transition so the panel returns to neutral
              panelEl.style.transition = 'transform .6s cubic-bezier(.2,.9,.2,1)';
              panelEl.style.transform = 'none';
              if(wt) wt.style.display = 'none';
            }
          }
        }

        function animateWelcomeExit(toSection){
          // add exit animation to welcome, then show the next section with a small delay
          welcome.classList.remove('enter');
          welcome.classList.add('exit');
          clearTimeout(welcomeTimer);
          setTimeout(()=>{
            welcome.classList.remove('exit');
            showSection(toSection);
            // hide bottom loader when moving past welcome
            const bl = document.getElementById('bottomLoader'); if(bl) bl.classList.add('hidden');
            // animate the target section entrance if possible
            if(toSection && toSection.classList) {
              toSection.classList.add('enter');
              setTimeout(()=>toSection.classList.remove('enter'),500);
            }
          },420);
        }

        function computeCards(max){
          const bits = Math.ceil(Math.log2(max+1));
          const arr = [];
          for(let bit=0;bit<bits;bit++){
            const values = [];
            for(let n=1;n<=max;n++) if(n & (1<<bit)) values.push(n);
            arr.push({bit,values});
          }
          return arr;
        }

        function updateHistoryDots(){
          const row = document.getElementById('historyRow'); if(!row) return;
          row.innerHTML = '';
          for(let i=0;i<cards.length;i++){
            const d=document.createElement('div');
            if(i<step){ d.className='hdot '+(answers[i]?'yes':'no'); d.title='Q'+(i+1)+': '+(answers[i]?'Yes':'No'); }
            else if(i===step){ d.className='hdot current'; d.title='Current'; }
            else { d.className='hdot'; d.title='Q'+(i+1); }
            row.appendChild(d);
          }
        }
        function render(){
          const card = cards[step];
          cardTitle.textContent = `Question ${step+1} of ${cards.length} — is your number in this list?`;
          cardNumbers.innerHTML = '';
          // ---- PARITY FIX: filter displayed numbers by parity when known ----
          let displayVals = card.values;
          if(parityKnown && card.bit !== 0){
            const filtered = card.values.filter(v => parityIsOdd ? (v%2!==0) : (v%2===0));
            if(filtered.length > 0) displayVals = filtered;
          }
          displayVals.forEach(v=>{
            const d=document.createElement('div');d.className='num';d.textContent=v;cardNumbers.appendChild(d);
          });
          // update parity badge
          const pb=document.getElementById('parityBadge');
          if(pb){ if(parityKnown){ pb.style.display='inline-flex'; pb.textContent=(parityIsOdd?'🔢 Odd':'🔢 Even'); } else pb.style.display='none'; }
          // update progress bar
          const pf=document.getElementById('progressFill');
          if(pf) pf.style.width=((step/cards.length)*100)+'%';
          // update history dots
          updateHistoryDots();
          progress.textContent = `${step+1} / ${cards.length}`;
          const qa=document.getElementById('questionArea');
          if(qa){ qa.classList.remove('pop'); void qa.offsetWidth; qa.classList.add('pop'); setTimeout(()=>qa.classList.remove('pop'),360); }
        }

        function finish(){
          if(sum>=1 && sum<=maxVal){
            showSection(result);
            resultNum.textContent = sum;
            resultMessage.textContent = 'Nice! Thanks for playing.';
            playSuccessAnimation();
          } else {
            showSection(result);
            resultNum.textContent = '—';
            resultMessage.textContent = 'I could not identify a valid number. Maybe you changed your mind?';
            playFailureAnimation();
            // prepare candidate list for investigation
            prepareCandidates();
          }
        }

  const prevBtn = document.getElementById('prevBtn');
  function updatePrevBtn(){ if(prevBtn) prevBtn.disabled = step <= (parityKnown && cards.length>0 && cards[0].bit===0 ? 1 : 0); }
  function resetGame(){ step=0; sum=0; answers = []; sumHistory = []; if(prevBtn) prevBtn.disabled = true; }


        function playSuccessAnimation(){
          // --- glow ring on result card ---
          resultCard.classList.add('success-glow');
          setTimeout(()=>resultCard.classList.remove('success-glow'), 5500);

          // --- show banner ---
          const banner = document.getElementById('successBanner');
          if(banner){ banner.style.display='block'; banner.classList.add('show'); setTimeout(()=>{ banner.classList.remove('show'); banner.style.display='none'; }, 2200); }

          // --- canvas confetti burst ---
          const canvas = document.getElementById('confettiCanvas');
          if(!canvas) return;
          canvas.style.display = 'block';
          canvas.width  = window.innerWidth;
          canvas.height = window.innerHeight;
          const ctx = canvas.getContext('2d');
          // get current theme accent colours from CSS variables
          const st = getComputedStyle(document.documentElement);
          const c1 = st.getPropertyValue('--accent').trim() || '#06b6d4';
          const c2 = st.getPropertyValue('--accent-2').trim() || '#7c3aed';
          const palette = [c1, c2, '#ffffff', '#facc15', '#f472b6', '#4ade80'];
          const particles = [];
          const cx = canvas.width / 2;
          const cy = canvas.height * 0.42;
          for(let i = 0; i < 180; i++){
            const angle = Math.random() * Math.PI * 2;
            const speed = 4 + Math.random() * 10;
            particles.push({
              x: cx, y: cy,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed - 4,
              w: 6 + Math.random() * 8,
              h: 10 + Math.random() * 10,
              rot: Math.random() * 360,
              rotV: (Math.random() - 0.5) * 12,
              color: palette[Math.floor(Math.random() * palette.length)],
              life: 1,
              decay: 0.012 + Math.random() * 0.01,
              shape: Math.random() > 0.5 ? 'rect' : 'circle'
            });
          }
          let raf;
          function drawConfetti(){
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            let alive = false;
            particles.forEach(p=>{
              p.x  += p.vx;  p.y  += p.vy;  p.vy += 0.22;
              p.rot += p.rotV; p.life -= p.decay;
              if(p.life <= 0) return;
              alive = true;
              ctx.save();
              ctx.globalAlpha = p.life;
              ctx.translate(p.x, p.y);
              ctx.rotate(p.rot * Math.PI / 180);
              ctx.fillStyle = p.color;
              if(p.shape === 'rect'){
                ctx.fillRect(-p.w/2, -p.h/2, p.w, p.h);
              } else {
                ctx.beginPath(); ctx.arc(0, 0, p.w/2, 0, Math.PI*2); ctx.fill();
              }
              ctx.restore();
            });
            if(alive){ raf = requestAnimationFrame(drawConfetti); }
            else { ctx.clearRect(0,0,canvas.width,canvas.height); canvas.style.display='none'; }
          }
          drawConfetti();
          setTimeout(()=>{ cancelAnimationFrame(raf); ctx.clearRect(0,0,canvas.width,canvas.height); canvas.style.display='none'; }, 4500);
        }

        function playFailureAnimation(){
          resultCard.classList.add('shake');
          setTimeout(()=>resultCard.classList.remove('shake'), 700);
          // red flash
          const fl = document.getElementById('flashOverlay');
          if(fl){ fl.classList.add('flash'); setTimeout(()=>fl.classList.remove('flash'), 350); }
        }

  howBtn.addEventListener('click', ()=>{ infoModal.classList.add('open'); infoModal.setAttribute('aria-hidden','false'); closeInfo.focus(); });
  closeInfo.addEventListener('click', ()=>{ infoModal.classList.remove('open'); infoModal.setAttribute('aria-hidden','true'); howBtn.focus(); });

        // When beginning, first ask parity (odd/even) then start the question flow
        const parityArea = document.getElementById('parityArea');
        const oddBtn = document.getElementById('oddBtn');
        const evenBtn = document.getElementById('evenBtn');
        const skipParity = document.getElementById('skipParity');
        let parityKnown = false; // true if user answered
        let parityIsOdd = false;

  // Wire main/difficulty controls
  const dialInput = document.getElementById('dialInput');
  const keypad = document.getElementById('keypad');
  const clearKey = document.getElementById('clearKey');
  const backspaceKey = document.getElementById('backspaceKey');
  const beginBtn = document.getElementById('beginGame');
    // backToMain button removed from difficulty UI

        beginGame.addEventListener('click', ()=>{
          // prefer dialInput, fallback to hidden maxInput
          const raw = (dialInput.value||'').replace(/[^0-9]/g,'');
          const dialVal = raw === '' ? NaN : parseInt(raw,10);
          let chosen = Number.isInteger(dialVal) && dialVal>MIN_MAX ? dialVal : parseInt(maxInput.value,10);
          const dialErrorEl = document.getElementById('dialError'); if(dialErrorEl) dialErrorEl.style.display='none';
          if(!Number.isInteger(chosen) || chosen<=MIN_MAX){
            // show inline message and switch theme to danger
            if(dialErrorEl){ dialErrorEl.style.display='block'; dialErrorEl.textContent = `Please enter a number > ${MIN_MAX}`; }
            else alert(`Please enter a number > ${MIN_MAX}`);
            document.documentElement.classList.add('theme-danger');
            return;
          }
          // chosen is valid -> ensure any danger theme is cleared
          document.documentElement.classList.remove('theme-danger');
          maxVal = chosen;
          // store the chosen value in the hidden input for compatibility
          maxInput.value = String(maxVal);
          // show the game section and parity prompt
          showSection(game);
          const bl = document.getElementById('bottomLoader'); if(bl) bl.classList.add('hidden');
          parityArea.style.display = 'block';
          parityArea.classList.add('pop');
          setTimeout(()=>parityArea.classList.remove('pop'),360);
          // hide question area until parity answered
          document.getElementById('questionArea').style.display = 'none';
        });

        // Keypad handlers (build dialInput as string)
        if(keypad){
          keypad.addEventListener('click', (ev)=>{
            const btn = ev.target.closest('.key');
            if(!btn) return;
            // append digit
            const d = btn.textContent.trim();
            let cur = dialInput.value || '';
            if(cur.length >= 6) return; // prevent excessively long numbers
            dialInput.value = (cur + d).replace(/^0+/, '') || '0';
            updateBeginState();
          });
        }
        if(clearKey){ clearKey.addEventListener('click', ()=>{ dialInput.value = ''; }); }
        if(clearKey){ clearKey.addEventListener('click', ()=>{ dialInput.value = ''; updateBeginState(); }); }
        if(backspaceKey){ backspaceKey.addEventListener('click', ()=>{ dialInput.value = (dialInput.value || '').slice(0,-1); updateBeginState(); }); }

  // enable/disable Begin based on dialInput value (>= MIN_MAX)
  function updateBeginState(){
    const raw = (dialInput.value||'').replace(/[^0-9]/g,'');
    const val = raw === '' ? NaN : parseInt(raw,10);
    if(Number.isInteger(val) && val>=MIN_MAX){ beginBtn.disabled = false; beginBtn.style.opacity = '1'; beginBtn.style.pointerEvents = 'auto'; }
    else { beginBtn.disabled = true; beginBtn.style.opacity = '0.45'; beginBtn.style.pointerEvents = 'none'; }
  }
  // initialize begin button state
  updateBeginState();

        // removed preset buttons — dialInput is populated via keypad only

        function startQuestionsWithParity(){
          console.log('Starting questions with maxVal=', maxVal, 'parityKnown=', parityKnown, 'parityIsOdd=', parityIsOdd);
          // compute cards after parity decision
          cards = computeCards(maxVal);
          resetGame();
          // if parity known and bit 0 exists, auto-apply and skip the LSB card
          if(parityKnown && cards.length>0){
            const lsbBit = cards[0].bit; // should be 0
            if(lsbBit === 0){
              if(parityIsOdd){ sum += (1<<0); }
              // skip the LSB card by incrementing step (previous cannot go before this)
              step = 1;
            }
          }
          // disable Previous at the start of questions
          updatePrevBtn();
          // show question area and render current card
          parityArea.style.display = 'none';
          const q = document.getElementById('questionArea'); q.style.display = 'block';
          render();
        }

        oddBtn.addEventListener('click', ()=>{ parityKnown = true; parityIsOdd = true; startQuestionsWithParity(); });
        evenBtn.addEventListener('click', ()=>{ parityKnown = true; parityIsOdd = false; startQuestionsWithParity(); });
        skipParity.addEventListener('click', ()=>{ parityKnown = false; startQuestionsWithParity(); });

        yesBtn.addEventListener('click', ()=>{
          // snapshot sum before applying answer (enables Previous rollback)
          sumHistory[step] = sum;
          // record answer
          answers[step] = true;
          sum += (1<<cards[step].bit);
          step++;
          updatePrevBtn();
          if(step<cards.length) render(); else finish();
        });

        noBtn.addEventListener('click', ()=>{
          sumHistory[step] = sum;
          answers[step] = false;
          step++;
          updatePrevBtn();
          if(step<cards.length) render(); else finish();
        });

        if(prevBtn){
          prevBtn.addEventListener('click', ()=>{
            // determine the minimum reachable step
            const minStep = (parityKnown && cards.length>0 && cards[0].bit===0) ? 1 : 0;
            if(step <= minStep) return;
            step--;
            // restore sum from snapshot (undo last answer)
            sum = sumHistory[step];
            // clear the recorded answer for this step so it can be re-answered
            answers[step] = undefined;
            updatePrevBtn();
            render();
            // pulse card to signal going back
            const qArea = document.getElementById('questionArea');
            if(qArea){ qArea.classList.remove('pop'); void qArea.offsetWidth; qArea.classList.add('pop'); setTimeout(()=>qArea.classList.remove('pop'),360); }
          });
        }

        function startNewSession(){
          // clear state
          resetGame();
          answers = [];
          sum = 0; step = 0;
          // clear inputs
          if(dialInput) dialInput.value = '';
          if(maxInput) maxInput.value = '31';
          // hide in-game panels
          parityArea.style.display = 'none';
          const qArea = document.getElementById('questionArea'); if(qArea) qArea.style.display = 'none';
          // hide overlays
          const explainSec = document.getElementById('explain'); if(explainSec) explainSec.classList.remove('active');
          const invSec = document.getElementById('investigate'); if(invSec) invSec.classList.remove('active');
          const invFull = document.getElementById('investigateDetailFull'); if(invFull){ invFull.style.display='none'; invFull.setAttribute('aria-hidden','true'); }
          // show difficulty so user can pick max and begin
          showSection(difficultySection);
          // show bottom loader again briefly for visual continuity
          const bl = document.getElementById('bottomLoader'); if(bl) bl.classList.remove('hidden'); setTimeout(()=>{ if(bl) bl.classList.add('hidden'); },800);
        }

        again.addEventListener('click', ()=>{ startNewSession(); });
        newGame.addEventListener('click', ()=>{ startNewSession(); });
        const wrongBtn = document.getElementById('wrongBtn');
        const explainSection = document.getElementById('explain');
        const candidateList = document.getElementById('candidateList');
        const candidateExplain = document.getElementById('candidateExplain');
        const explainTitle = document.getElementById('explainTitle');
        const explainBody = document.getElementById('explainBody');
        const backToResult = document.getElementById('backToResult');
        const restartFromExplain = document.getElementById('restartFromExplain');
  const investigateBtn = document.getElementById('investigateBtn');
  const investigateSection = document.getElementById('investigate');
  const investigateList = document.getElementById('investigateList');
  const investigateDetail = document.getElementById('investigateDetail');
  const investigateTitle = document.getElementById('investigateTitle');
  const investigateBody = document.getElementById('investigateBody');
  const backToExplain = document.getElementById('backToExplain');
  const restartFromInvestigate = document.getElementById('restartFromInvestigate');

        wrongBtn.addEventListener('click', ()=>{
          // show explain section
          showSection(explainSection);
        });

  backToResult.addEventListener('click', ()=>{ showSection(result); });
  restartFromExplain.addEventListener('click', ()=>{ startNewSession(); });

        function prepareCandidates(){
          // compute all numbers from 1..maxVal that match the user's answers on the cards we asked
          candidateList.innerHTML = '';
          candidateExplain.style.display = 'none';
          const exact = [];
          const parityFlip = [];
          for(let n=1;n<=maxVal;n++){
            let ok = true;
            for(let i=0;i<cards.length;i++){
              const bit = cards[i].bit;
              const hasBit = !!(n & (1<<bit));
              // if we have a recorded answer for this card, compare
              if(typeof answers[i] !== 'undefined'){
                if(answers[i] !== hasBit){ ok = false; break; }
              } else if(parityKnown && bit===0){
                // if parity was answered, use it for the LSB
                if(parityIsOdd !== hasBit){ ok = false; break; }
              }
            }
            if(ok) exact.push(n);
            // also compute parity-flip matches if parity was answered: assume parity was misunderstood
            if(parityKnown){
              let okFlip = true;
              for(let i=0;i<cards.length;i++){
                const bit = cards[i].bit;
                const hasBit = !!(n & (1<<bit));
                if(typeof answers[i] !== 'undefined'){
                  if(answers[i] !== hasBit){ okFlip = false; break; }
                } else if(bit===0){
                  // assume opposite parity
                  if((!parityIsOdd) !== hasBit){ okFlip = false; break; }
                }
              }
              if(okFlip) parityFlip.push(n);
            }
          }

          function renderGroup(title, arr, parityFlag){
            if(arr.length===0) return;
            const hdr = document.createElement('div'); hdr.className='muted'; hdr.style.marginTop='8px'; hdr.textContent = title; candidateList.appendChild(hdr);
            const shown = arr.slice(0,48);
            shown.forEach(n=>{
              const b = document.createElement('button'); b.className='btn ghost'; b.textContent = n;
              b.addEventListener('click', ()=>{ explainCandidate(n, {parityFlip: !!parityFlag}); });
              b.addEventListener('click', ()=>{ /* keep for compatibility */ });
              b.addEventListener('click', ()=>{ /* noop */ });
              b.addEventListener('click', ()=>{});
              candidateList.appendChild(b);
            });
            if(arr.length>shown.length){ const more = document.createElement('div'); more.className='muted'; more.textContent = `...and ${arr.length-shown.length} more`; candidateList.appendChild(more); }
          }

          renderGroup('Matches (based on your answers)', exact, false);
          if(parityKnown) renderGroup('Matches if parity was reversed', parityFlip, true);
          if(exact.length===0 && parityFlip.length===0){ candidateList.innerHTML = '<div class="muted">No matching candidates found.</div>'; }
        }

        function explainCandidate(n, opts){
          opts = opts || {};
          const parityFlip = !!opts.parityFlip;
          // find which asked question differs between predicted sum and this candidate
          candidateExplain.style.display = 'block';
          explainTitle.textContent = `Candidate: ${n}` + (parityFlip? ' (parity reversed)' : '');
          // build explanation: list each asked card and whether candidate would answer yes/no and whether the user's answer matched
          const parts = [];
          for(let i=0;i<cards.length;i++){
            const bit = cards[i].bit;
            // determine user's answer for this bit: prefer recorded answer, else use parity if bit=0
            let userAnsDefined = (typeof answers[i] !== 'undefined');
            let userAns;
            if(userAnsDefined) userAns = answers[i];
            else if(parityKnown && bit===0) userAns = parityFlip ? !parityIsOdd : parityIsOdd;
            else continue; // skip cards we didn't ask and no parity info
            const candidateHas = !!(n & (1<<bit));
            const question = `Card ${i+1} (bit ${1<<bit})`;
            const status = candidateHas === userAns ? 'matches' : 'differs';
            parts.push(`<div><strong>${question}:</strong> candidate would answer <em>${candidateHas? 'Yes':'No'}</em>; your answer <em>${userAns? 'Yes':'No'}</em> — <strong>${status}</strong></div>`);
          }
          explainBody.innerHTML = parts.join('');
        }

        // Investigation: compute ranked candidates by Hamming distance (differences) and render
        investigateBtn.addEventListener('click', ()=>{
          // compute distances for 1..maxVal
          const list = [];
          for(let n=1;n<=maxVal;n++){
            let diffs = 0;
            for(let i=0;i<cards.length;i++){
              if(typeof answers[i] === 'undefined') continue;
              const bit = cards[i].bit;
              const candHas = !!(n & (1<<bit));
              if(candHas !== answers[i]) diffs++;
            }
            list.push({n,diffs});
          }
          list.sort((a,b)=>a.diffs - b.diffs || a.n - b.n);
          // render top 100 (or all if small)
          investigateList.innerHTML = '';
          const top = list.slice(0,200);
          top.forEach(item=>{
            // show number only on the button; details appear in the full detail view
            const b = document.createElement('button'); b.className='btn'; b.textContent = `${item.n}`;
            b.addEventListener('click', ()=>{ openInvestigateDetailFull(item.n); });
            investigateList.appendChild(b);
          });
          showSection(investigateSection);
        });

        function showInvestigateDetail(n){
          investigateDetail.style.display = 'block';
          investigateTitle.textContent = `Candidate ${n}`;
          const parts = [];
          for(let i=0;i<cards.length;i++){
            if(typeof answers[i] === 'undefined') continue;
            const bit = cards[i].bit;
            const candHas = !!(n & (1<<bit));
            const userAns = answers[i] ? true : false;
            const question = `Card ${i+1} (bit ${1<<bit})`;
            const status = candHas === userAns ? 'matches' : 'differs';
            parts.push(`<div><strong>${question}:</strong> candidate would answer <em>${candHas? 'Yes':'No'}</em>; your answer <em>${userAns? 'Yes':'No'}</em> — <strong>${status}</strong></div>`);
          }
          investigateBody.innerHTML = parts.join('');
        }

        // Open full-window detail with animation
        const investigateDetailFull = document.getElementById('investigateDetailFull');
        const investigateFullTitle = document.getElementById('investigateFullTitle');
        const investigateFullBody = document.getElementById('investigateFullBody');
        const closeInvestigateFull = document.getElementById('closeInvestigateFull');
        const investigateBackToList = document.getElementById('investigateBackToList');
        const investigateRestart = document.getElementById('investigateRestart');

        function openInvestigateDetailFull(n, opts){
          opts = opts || {};
          const parityFlip = !!opts.parityFlip;
          // populate full detail, similar to showInvestigateDetail but fuller text
          investigateFullTitle.textContent = `Candidate ${n}`;
          // Build a rich snapshot of the asked cards, preserving the game look
          const parts = [];
          parts.push(`<div style="font-weight:700;margin-bottom:8px">Candidate number: ${n} — Max: ${maxVal}</div>`);
          parts.push(`<div class="muted">Brief: If you couldn't clearly see a card, it's easy to mis-click. Below are the cards shown during the game; any highlighted items indicate where the candidate differs from your recorded answer.</div>`);
          parts.push('<div class="snapshot">');
          for(let i=0;i<cards.length;i++){
            const bit = cards[i].bit;
            // determine user's answer: recorded or parity
            let userAnsDefined = (typeof answers[i] !== 'undefined');
            let userAns;
            if(userAnsDefined) userAns = answers[i] ? true : false;
            else if(parityKnown && bit===0) userAns = parityFlip ? !parityIsOdd : parityIsOdd;
            else continue;
            const candHas = !!(n & (1<<bit));
            const questionLabel = `Card ${i+1} — bit ${1<<bit}`;
            // mark mismatch or match
            const isDiff = candHas !== userAns;
            const isMatch = !isDiff;
            parts.push(`<div class="card ${isDiff? 'mismatch': (isMatch? 'match':'')}">`);
            parts.push(`<div class="cardTitle">${questionLabel}</div>`);
            parts.push('<div class="nums">');
            // show numbers in this card — highlight numbers that would be selected by candidate
            cards[i].values.forEach(v=>{
              const selectedByCandidate = !!(v & n);
              const numClass = selectedByCandidate ? 'num selected' : 'num';
              parts.push(`<div class="${numClass}">${v}</div>`);
            });
            // compute card parity (majority even or odd) to help user see why they might have misread it
            const evens = cards[i].values.filter(x=> x%2===0).length;
            const odds = cards[i].values.length - evens;
            const cardParity = evens>odds ? 'even' : (odds>evens ? 'odd' : 'mixed');
            if(parityKnown && cardParity!=='mixed'){
              const userParityLabel = (parityFlip ? (!parityIsOdd) : parityIsOdd) ? 'odd' : 'even';
              if(userParityLabel !== cardParity){
                parts.push(`<div class="muted" style="margin-top:8px">Note: this card contains mostly <strong>${cardParity}</strong> numbers, but you selected <strong>${userParityLabel}</strong>.</div>`);
              }
            }
            parts.push('</div>');
            // show comparison badge
            parts.push('<div style="margin-top:8px">');
            parts.push(`<span class="badge ${userAns? 'yes':'no'}">Your answer: ${userAns? 'Yes':'No'}</span>`);
            if(isDiff) parts.push(`<span class="badge wrong">Mismatch</span>`);
            parts.push('</div>');
            parts.push('</div>');
          }
          parts.push('</div>');
          parts.push('<div style="margin-top:12px;color:var(--muted)">Tip: numbers highlighted are where the candidate expects a different response. If you spot a mismatch, try Play again and correct that card.</div>');
          investigateFullBody.innerHTML = parts.join('');

          // show full detail as overlay
          showSection(investigateDetailFull);
          investigateDetailFull.style.display = 'flex';
          investigateDetailFull.setAttribute('aria-hidden','false');
          // add entrance animation
          investigateDetailFull.classList.add('enter');
          setTimeout(()=>investigateDetailFull.classList.remove('enter'),500);
        }

        closeInvestigateFull.addEventListener('click', ()=>{
          investigateDetailFull.classList.add('exit');
          setTimeout(()=>{ investigateDetailFull.style.display='none'; investigateDetailFull.classList.remove('exit'); investigateDetailFull.setAttribute('aria-hidden','true'); showSection(investigateSection); },420);
        });
        investigateBackToList.addEventListener('click', ()=>{ investigateDetailFull.style.display='none'; showSection(investigateSection); });
        investigateRestart.addEventListener('click', ()=>{ 
          const cl = document.getElementById('centerLoader'); if(cl){ cl.style.display='flex'; setTimeout(()=>{ cl.style.display='none'; startNewSession(); },800); } else startNewSession();
        });

        backToExplain.addEventListener('click', ()=>{ showSection(explainSection); });
        restartFromInvestigate.addEventListener('click', ()=>{ 
          const cl = document.getElementById('centerLoader'); if(cl){ cl.style.display='flex'; setTimeout(()=>{ cl.style.display='none'; startNewSession(); },800); } else startNewSession();
        });

  // initialize with default max but don't render cards until the game starts
  // cards will be computed when the user begins (startQuestionsWithParity())
        // show welcome enter animation
        welcome.classList.add('enter');
  // auto dismiss welcome after 4 seconds -> forward to main landing
  welcomeTimer = setTimeout(()=>{ animateWelcomeExit(difficultySection); }, 4000);

        // pause auto-dismiss while interacting with the welcome area, resume on leave
        const welcomeArea = document.querySelector('#welcome .welcome');
        welcomeArea.addEventListener('mouseenter', ()=>{ clearTimeout(welcomeTimer); });
        welcomeArea.addEventListener('focusin', ()=>{ clearTimeout(welcomeTimer); });
  welcomeArea.addEventListener('mouseleave', ()=>{ clearTimeout(welcomeTimer); welcomeTimer = setTimeout(()=>{ animateWelcomeExit(difficultySection); }, 2400); });
  welcomeArea.addEventListener('focusout', ()=>{ clearTimeout(welcomeTimer); welcomeTimer = setTimeout(()=>{ animateWelcomeExit(difficultySection); }, 2400); });
        // --- welcome 3D tilt + fire trail ---
        (function(){
          const canvas = document.getElementById('welcomeTrail');
          if(!canvas) return;
          const ctx = canvas.getContext('2d');
          let w=0,h=0,particles=[];
          function resize(){ w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; }
          window.addEventListener('resize', resize); resize();

          function spawn(x,y){
            // only spawn when welcome section is active
            const welcomeActive = document.querySelector('#welcome').classList.contains('active');
            if(!welcomeActive) return;
            for(let i=0;i<3;i++){
              particles.push({x:x + (Math.random()-0.5)*8, y:y + (Math.random()-0.5)*8, vx:(Math.random()-0.5)*2,vy:-Math.random()*1.6-0.6, life: 28 + Math.random()*18, age:0, r:6+Math.random()*8, hue: 28 + Math.random()*24});
            }
          }

          function tick(){
            ctx.clearRect(0,0,w,h);
            for(let i=particles.length-1;i>=0;i--){
              const p = particles[i];
              p.x += p.vx; p.y += p.vy; p.vy += 0.06; p.age++;
              const t = p.age / p.life; if(t>1){ particles.splice(i,1); continue; }
              const alpha = (1 - t) * 0.9;
              const grad = ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r);
              grad.addColorStop(0, `hsla(${p.hue},100%,60%,${alpha})`);
              grad.addColorStop(0.5, `hsla(${p.hue+10},95%,50%,${alpha*0.55})`);
              grad.addColorStop(1, `rgba(0,0,0,0)`);
              ctx.fillStyle = grad; ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fill();
            }
            requestAnimationFrame(tick);
          }
          tick();

          // panel tilt based on mouse position; spawn particles across the full viewport
          const panelEl = document.querySelector('.panel');
          function onMove(e){
            const x = e.clientX; const y = e.clientY;
            spawn(x, y);
            // only tilt the panel while the welcome section is active
            const welcomeActive = document.querySelector('#welcome').classList.contains('active');
            if(!welcomeActive) return;
            const rect = welcomeArea.getBoundingClientRect();
            const cx = rect.width/2 + rect.left; const cy = rect.height/2 + rect.top;
            const rx = (y - cy) / (cy - rect.top); const ry = (x - cx) / (cx - rect.left);
            if(panelEl) panelEl.style.transform = `rotateX(${rx*6}deg) rotateY(${ry*8}deg)`;
          }
          // attach to window so the trail covers the viewport; spawning gated by active welcome
          window.addEventListener('mousemove', onMove);
          // still use welcomeArea enter/leave to tweak panel transitions
          welcomeArea.addEventListener('mouseenter', ()=>{ if(panelEl) panelEl.style.transition='transform .08s linear'; });
          welcomeArea.addEventListener('mouseleave', ()=>{ if(panelEl){ panelEl.style.transition='transform .6s cubic-bezier(.2,.9,.2,1)'; panelEl.style.transform='none'; } });
        })();

        // ===== THEME SWITCHER =====
        (function(){
          const THEMES=['cyber','inferno','forest','royal','rose','ocean'];
          const saved=localStorage.getItem('gmn-theme')||'cyber';
          function applyTheme(t){
            document.documentElement.setAttribute('data-theme',t);
            localStorage.setItem('gmn-theme',t);
            document.querySelectorAll('.theme-dot').forEach(d=>d.classList.toggle('active',d.dataset.t===t));
          }
          applyTheme(saved);
          const toggleBtn=document.getElementById('themeToggleBtn');
          const palette=document.getElementById('themePalette');
          toggleBtn.addEventListener('click',()=>palette.classList.toggle('open'));
          document.addEventListener('click',e=>{ if(!e.target.closest('#themeSwitcher')) palette.classList.remove('open'); });
          document.querySelectorAll('.theme-dot').forEach(dot=>{
            dot.addEventListener('click',()=>{ applyTheme(dot.dataset.t); palette.classList.remove('open'); });
          });
        })();

        // ===== RIPPLE EFFECT =====
        document.addEventListener('click',function(e){
          const btn=e.target.closest('.btn');
          if(!btn) return;
          const r=document.createElement('span'); r.className='ripple';
          const rect=btn.getBoundingClientRect();
          const size=Math.max(rect.width,rect.height);
          r.style.cssText=`width:${size}px;height:${size}px;left:${e.clientX-rect.left-size/2}px;top:${e.clientY-rect.top-size/2}px`;
          btn.appendChild(r); setTimeout(()=>r.remove(),500);
        });
      })();
