document.addEventListener('DOMContentLoaded', () => {
  // Year
  const y = document.getElementById('year'); if (y) y.textContent = new Date().getFullYear();

  // Sticky header state
  const hdr = document.querySelector('header');
  const onScroll = () => hdr && hdr.classList.toggle('scrolled', window.scrollY > 8);
  onScroll(); window.addEventListener('scroll', onScroll, {passive:true});

  // Reveal on view
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{ if(e.isIntersecting) e.target.classList.add('show'); });
  }, {threshold:.12});
  document.querySelectorAll('.reveal').forEach(el=>io.observe(el));

  // Home mini funnel → localStorage → Apply
  const mf = document.getElementById('mini-funnel');
  if (mf) {
    mf.addEventListener('submit', (e) => {
      e.preventDefault();
      const amount = mf.querySelector('input[type=number]')?.value?.trim();
      const purpose = mf.querySelector('select')?.value?.trim();
      if (!amount || !purpose) return;
      const payload = { amount, purpose, source:'home-mini', ts:Date.now() };
      localStorage.setItem('po_lead', JSON.stringify(payload));
      location.href = 'apply.html';
    });
  }

  // Apply wizard (if present)
  const form = document.getElementById('apply-form');
  if (form) {
    const steps = Array.from(form.querySelectorAll('.step'));
    const bar = document.getElementById('apply-progress');
    let idx = steps.findIndex(s => !s.hasAttribute('hidden')); if (idx < 0) idx = 0;
    const setBar = () => { if (bar) bar.style.width = (((idx+1)/steps.length)*100)+'%'; };
    const show = (n) => { steps.forEach((s,i)=> s.hidden = i!==n); idx=n; setBar(); };
    setBar();

    // Preselect via ?p=
    const p = new URLSearchParams(location.search).get('p');
    if (p) form.querySelectorAll('input[name="products"]').forEach(cb => {
      if (cb.value.toLowerCase() === decodeURIComponent(p).toLowerCase()) cb.checked = true;
    });

    form.querySelectorAll('[data-next]').forEach(btn => btn.addEventListener('click', () => {
      const cur = steps[idx];
      const invalid = Array.from(cur.querySelectorAll('input,select')).filter(el => el.required && !el.value.trim());
      invalid.forEach(el => { el.setAttribute('aria-invalid','true'); el.style.borderColor='#ff7a7a'; });
      if (invalid.length) { cur.scrollIntoView({behavior:'smooth', block:'start'}); return; }
      show(Math.min(idx+1, steps.length-1));
    }));
    form.querySelectorAll('[data-prev]').forEach(btn => btn.addEventListener('click', () => show(Math.max(idx-1,0))));

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(form).entries());
      const products = Array.from(form.querySelectorAll('input[name="products"]:checked')).map(x=>x.value);
      data.products = products; data.ts = Date.now(); data.source = 'apply';
      if (!data.tcpa) { alert('Please agree to the contact consent.'); return; }
      localStorage.setItem('po_lead', JSON.stringify(data));
      const thanks = document.getElementById('apply-thanks');
      if (thanks) { thanks.hidden = false; form.hidden = true; window.scrollTo({top:0,behavior:'smooth'}); }
    });
  }

  // Calculator (if present)
  const calc = document.getElementById('loan-calculator');
  if (calc) {
    const _num = v => Number(String(v).replace(/[^0-9.]/g,''))||0;
    const out = calc.querySelector('#calc-result');
    const compute = () => {
      const A=_num(calc.querySelector('#loan-amount')?.value);
      const APR=_num(calc.querySelector('#interest-rate')?.value)/100/12;
      const N=_num(calc.querySelector('#loan-term')?.value);
      let pmt = 0; if (APR>0 && N>0) pmt = (A*APR)/(1-Math.pow(1+APR,-N));
      out.textContent = (A&&N) ? `Estimated Monthly Payment: $${pmt.toFixed(2)}` : '';
    };
    calc.addEventListener('input', compute); compute();
  }
});

