(() => {
  const $ = (s, ctx=document) => ctx.querySelector(s);
  const $$ = (s, ctx=document) => [...ctx.querySelectorAll(s)];
  let lastFocus = null;
  const seed = [
    {ref:'HHP-SEED-2031',displayName:'Sarah W.',postcode:'S35',jobType:'Boiler / no heating',urgency:'Today if possible',details:'Boiler has stopped and there is no heating.',photoCount:2,receivedAt:new Date(Date.now()-18*60000).toISOString(),status:'NEW',seed:true},
    {ref:'HHP-SEED-2029',displayName:'Martin P.',postcode:'S63',jobType:'Plumbing Repair',urgency:'Within 48 hours',details:'Slow leak beneath kitchen sink.',photoCount:1,receivedAt:new Date(Date.now()-57*60000).toISOString(),status:'NEW',seed:true},
    {ref:'HHP-SEED-2027',displayName:'Amira K.',postcode:'S10',jobType:'Bathroom',urgency:'Planning ahead',details:'Looking at replacing bath and shower fittings.',photoCount:3,receivedAt:new Date(Date.now()-3.4*3600000).toISOString(),status:'CONTACTED',seed:true},
    {ref:'HHP-SEED-2025',displayName:'Daniel R.',postcode:'DN4',jobType:'Heating',urgency:'This week',details:'Two radiators not heating properly.',photoCount:0,receivedAt:new Date(Date.now()-5.1*3600000).toISOString(),status:'NEW',seed:true}
  ];
  const loadSession = () => JSON.parse(sessionStorage.getItem('hhp-demo-enquiries') || '[]');
  const saveSession = records => sessionStorage.setItem('hhp-demo-enquiries', JSON.stringify(records));
  const loadQuotes = () => JSON.parse(sessionStorage.getItem('hhp-demo-quotes') || '[]');
  const saveQuotes = quotes => sessionStorage.setItem('hhp-demo-quotes', JSON.stringify(quotes));
  const allRecords = () => [...loadSession().map(x=>({...x,seed:false})), ...seed];
  const fmtTime = iso => new Intl.DateTimeFormat('en-GB',{hour:'2-digit',minute:'2-digit'}).format(new Date(iso));
  const initials = name => name.split(/\s+/).slice(0,2).map(x=>x[0]).join('').toUpperCase();
  const escapeHtml = s => String(s ?? '').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const quoteFor = ref => loadQuotes().find(q => q.ref === ref);

  function card(r){
    const urgent = /Today|48/.test(r.urgency);
    const quote = quoteFor(r.ref);
    return `<article class="enquiry-card ${r.seed?'':'session-record'}" data-ref="${escapeHtml(r.ref)}">
      <div class="record-main"><span class="record-avatar">${escapeHtml(initials(r.displayName||r.fullName||'DE'))}</span><div><b>${escapeHtml(r.displayName||r.fullName)}</b><small>${escapeHtml(r.postcode)} • ${escapeHtml(r.ref)}${r.seed?'':' • THIS SESSION'}</small></div></div>
      <div class="record-meta"><b>${escapeHtml(r.jobType)}</b><small>${r.photoCount||0} photograph${r.photoCount===1?'':'s'} • Received ${fmtTime(r.receivedAt)}</small></div>
      <div class="record-state"><span class="priority ${urgent?'urgent':'normal'}">${escapeHtml(r.urgency||'Normal')}</span><small class="record-status ${r.status==='CONTACTED'?'contacted':''}">${escapeHtml(r.status||'NEW')}</small>${quote?`<span class="quote-attached">QUOTE £${Number(quote.total).toFixed(2)}</span>`:''}</div>
      <div class="record-actions"><button class="desk-btn" data-action="open">Open</button><button class="desk-btn" data-action="call">Call</button><button class="desk-btn" data-action="whatsapp">WhatsApp</button><button class="desk-btn primary" data-action="contacted">Mark contacted</button><button class="desk-btn orange" data-action="quote">${quote?'View quote':'Create quote'}</button></div>
    </article>`;
  }
  function render(){
    const records = allRecords();
    $('#enquiry-list').innerHTML = records.slice(0,5).map(card).join('');
    $('#enquiry-list-all').innerHTML = records.map(card).join('');
    const session = loadSession();
    $('#metric-new').textContent = records.filter(r=>r.status==='NEW').length;
    $('#metric-callback').textContent = records.filter(r=>r.status==='NEW').length;
    $('#metric-quotes').textContent = loadQuotes().length + 2;
    $('#metric-activity').textContent = Math.max(6, session.length + loadQuotes().length + 6);
    renderQuotes();
  }
  function renderQuotes(){
    const quotes = loadQuotes();
    $('#quotes-list').innerHTML = quotes.length ? quotes.map(q=>`<article class="quote-card"><div><div class="quote-demo-label">QUOTE CREATED — DEMONSTRATION</div><h3>${escapeHtml(q.ref)} — ${escapeHtml(q.description)}</h3><p>Attached to this enquiry • Created ${fmtTime(q.createdAt)}</p>${q.notes?`<p>${escapeHtml(q.notes)}</p>`:''}</div><strong>£${Number(q.total).toFixed(2)}</strong></article>`).join('') : `<div class="empty-state"><span>£</span><h3>No session quotes yet.</h3><p>Create a demo quote from any enquiry. It will appear here without being sent externally.</p></div>`;
  }
  function openDialog(dialog){lastFocus=document.activeElement;dialog.showModal();}
  function closeDialog(dialog){if(dialog.open)dialog.close();lastFocus?.focus?.();}
  $$('dialog').forEach(d=>{$$('.modal-close,.modal-ok',d).forEach(b=>b.addEventListener('click',()=>closeDialog(d)));d.addEventListener('click',e=>{if(e.target===d)closeDialog(d)});});
  function getRecord(ref){return allRecords().find(r=>r.ref===ref)}
  function openRecord(r){
    const quote = quoteFor(r.ref);
    $('#record-dialog-content').innerHTML=`<p class="kicker">${r.seed?'Fictional seeded record':'This browser session'}</p><h2>${escapeHtml(r.displayName||r.fullName)}</h2><div class="record-details"><div><small>Reference</small><b>${escapeHtml(r.ref)}</b></div><div><small>Status</small><b>${escapeHtml(r.status)}</b></div><div><small>Job type</small><b>${escapeHtml(r.jobType)}</b></div><div><small>Urgency</small><b>${escapeHtml(r.urgency)}</b></div><div><small>Postcode</small><b>${escapeHtml(r.postcode)}</b></div><div><small>Photos</small><b>${r.photoCount||0} selected</b></div></div><div class="record-description">${escapeHtml(r.details||'Demonstration enquiry details.')}</div>${quote?`<div class="attached-quote-summary"><small>DEMO QUOTE ATTACHED</small><strong>£${Number(quote.total).toFixed(2)}</strong></div>`:''}${r.seed?'':`<p><small>Demo contact details entered in this session remain in your browser only.</small></p>`}`;
    openDialog($('#record-dialog'));
  }
  function markContacted(ref){
    const session=loadSession();const ix=session.findIndex(r=>r.ref===ref);
    if(ix>=0){session[ix].status='CONTACTED';saveSession(session);}else{const s=seed.find(r=>r.ref===ref);if(s)s.status='CONTACTED'}
    render();
  }
  function openQuote(r){
    const existing = quoteFor(r.ref);
    $('#quote-ref').value=r.ref;
    $('#quote-description').value=existing?.description || (r.jobType + ' — ' + (r.details||''));
    $('#quote-labour').value=existing?.labour ?? '0';
    $('#quote-materials').value=existing?.materials ?? '0';
    $('#quote-callout').value=existing?.callout ?? '0';
    $('#quote-other').value=existing?.other ?? '0';
    $('#quote-notes').value=existing?.notes || '';
    calcTotal();
    openDialog($('#quote-dialog'));
  }
  function numeric(id){return Math.max(0,parseFloat($(id).value)||0)}
  function calcTotal(){const total=['#quote-labour','#quote-materials','#quote-callout','#quote-other'].reduce((n,id)=>n+numeric(id),0);$('#quote-total').textContent='£'+total.toFixed(2);return total}
  ['labour','materials','callout','other'].forEach(k=>$('#quote-'+k).addEventListener('input',calcTotal));
  document.addEventListener('click',e=>{
    const btn=e.target.closest('[data-action]');if(!btn)return;const cardEl=btn.closest('.enquiry-card');const r=getRecord(cardEl?.dataset.ref);if(!r)return;
    if(btn.dataset.action==='open')openRecord(r);
    if(['call','whatsapp'].includes(btn.dataset.action))openDialog($('#action-dialog'));
    if(btn.dataset.action==='contacted')markContacted(r.ref);
    if(btn.dataset.action==='quote')openQuote(r);
  });
  function showQuoteToast(ref,total){
    let toast=$('#quote-toast');
    if(!toast){toast=document.createElement('div');toast.id='quote-toast';toast.className='quote-toast';toast.setAttribute('role','status');toast.setAttribute('aria-live','polite');document.body.appendChild(toast);}
    toast.innerHTML=`<b>QUOTE CREATED — DEMONSTRATION</b><span>${escapeHtml(ref)} • £${Number(total).toFixed(2)} attached to the enquiry.</span>`;
    toast.hidden=false;
    clearTimeout(showQuoteToast.timer);
    showQuoteToast.timer=setTimeout(()=>{toast.hidden=true},4200);
  }
  $('#quote-builder').addEventListener('submit',e=>{
    e.preventDefault();
    const ref=$('#quote-ref').value;
    const total=calcTotal();
    const quote={
      ref,
      description:$('#quote-description').value,
      labour:numeric('#quote-labour'),
      materials:numeric('#quote-materials'),
      callout:numeric('#quote-callout'),
      other:numeric('#quote-other'),
      total,
      notes:$('#quote-notes').value,
      createdAt:new Date().toISOString()
    };
    const quotes=loadQuotes().filter(q=>q.ref!==ref);
    quotes.unshift(quote);
    saveQuotes(quotes);
    closeDialog($('#quote-dialog'));
    render();
    showView('quotes');
    showQuoteToast(ref,total);
  });
  function showView(view){
    $$('.dashboard-view').forEach(p=>p.hidden=p.dataset.viewPanel!==view);
    $$('.desk-nav').forEach(b=>b.classList.toggle('active',b.dataset.view===view));
    $('#view-title').textContent=({dashboard:'Dashboard',enquiries:'New Enquiries',quotes:'Quotes',followups:'Follow-ups',settings:'Settings'})[view]||'Dashboard';
    window.scrollTo({top:0,behavior:'smooth'});
  }
  $$('.desk-nav').forEach(b=>b.addEventListener('click',()=>showView(b.dataset.view)));
  $('#clear-session').addEventListener('click',()=>{sessionStorage.removeItem('hhp-demo-enquiries');sessionStorage.removeItem('hhp-demo-quotes');render();});
  render();
  if (matchMedia('(max-width:760px)').matches) showView('enquiries');
})();
