// Advanced frontend logic for Techverse Assistant - final cleaned file
const ui = {
  form: document.getElementById('chat-form'),
  input: document.getElementById('input'),
  messages: document.getElementById('messages'),
  historyList: document.getElementById('historyList'),
  exportBtn: document.getElementById('exportBtn'),
  clearBtn: document.getElementById('clearBtn'),
  settingsBtn: document.getElementById('settingsBtn'),
  settingsModal: document.getElementById('settingsModal'),
  closeSettings: document.getElementById('closeSettings'),
  modeBadge: document.getElementById('modeBadge'),
};

function fmt(iso){ try { return new Date(iso).toLocaleString(); } catch(e){ return iso; } }

function addMsg(text, cls='bot', ts){
  const d = document.createElement('div'); d.className = `message ${cls}`;
  const c = document.createElement('div'); c.className = 'content'; c.textContent = text; d.appendChild(c);
  if(ts){ const t = document.createElement('span'); t.className='ts'; t.textContent = fmt(ts); d.appendChild(t); }
  ui.messages.appendChild(d); ui.messages.scrollTop = ui.messages.scrollHeight;
}

function clearMsgs(){ ui.messages.innerHTML=''; }

async function postMessage(text){ addMsg(text,'user',new Date().toISOString()); ui.input.value=''; const l = document.createElement('div'); l.className='message loading'; l.textContent='Thinking...'; ui.messages.appendChild(l); ui.messages.scrollTop = ui.messages.scrollHeight; try{ const r = await fetch('/api/chat',{method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({message:text})}); const j=await r.json(); l.remove(); if(j.reply) addMsg(j.reply,'bot',new Date().toISOString()); else addMsg('No reply from server','bot',new Date().toISOString()); await refreshHistory(); }catch(e){ l.remove(); addMsg('Error contacting server','bot',new Date().toISOString()); console.error(e); } }

ui.form.addEventListener('submit', e=>{ e.preventDefault(); const t=ui.input.value.trim(); if(t) postMessage(t); });

async function refreshHistory(){ try{ const r=await fetch('/api/history'); const j=await r.json(); if(j.history && Array.isArray(j.history)){ ui.historyList.innerHTML=''; const items=[]; for(let i=0;i<j.history.length;i++){ const m=j.history[i]; if(m.role==='user'){ const rep=(j.history[i+1] && j.history[i+1].role==='bot')? j.history[i+1].text : ''; items.push({user:m.text,bot:rep,ts:m.ts}); } } if(!items.length) ui.historyList.innerHTML='<div class="history-item">No history yet</div>'; else{ items.reverse().forEach(it=>{ const div=document.createElement('div'); div.className='history-item'; div.innerHTML=`<strong>${it.user.slice(0,60)}</strong><div style="font-size:12px;color:rgba(255,255,255,0.7)">${it.bot.slice(0,80)}</div><div style="font-size:11px;color:rgba(255,255,255,0.5);margin-top:6px">${new Date(it.ts).toLocaleString()}</div>`; div.addEventListener('click',()=>{ clearMsgs(); addMsg(it.user,'user',it.ts); if(it.bot) addMsg(it.bot,'bot',it.ts); }); ui.historyList.appendChild(div); }); } clearMsgs(); j.history.slice(-20).forEach(m=>addMsg(m.text, m.role==='user'?'user':'bot', m.ts)); } }catch(e){ console.warn('Failed to load history',e); ui.historyList.innerHTML='<div class="history-item">Failed to load</div>'; } }

function exportHistory(){ window.location.href='/api/export'; }

async function clearHistory(){ if(!confirm('Clear all conversation history? This cannot be undone.')) return; try{ const r=await fetch('/api/clear',{method:'POST'}); const j=await r.json(); if(j.ok){ await refreshHistory(); alert('History cleared'); clearMsgs(); } }catch(e){ alert('Failed to clear history'); } }

ui.exportBtn.addEventListener('click', exportHistory);
ui.clearBtn.addEventListener('click', clearHistory);
ui.settingsBtn.addEventListener('click', ()=>ui.settingsModal.classList.remove('hidden'));
// Clean, single-file advanced frontend for Techverse Assistant
(function(){
  const ui = {
    form: document.getElementById('chat-form'),
    input: document.getElementById('input'),
    messages: document.getElementById('messages'),
    historyList: document.getElementById('historyList'),
    exportBtn: document.getElementById('exportBtn'),
    clearBtn: document.getElementById('clearBtn'),
    settingsBtn: document.getElementById('settingsBtn'),
    settingsModal: document.getElementById('settingsModal'),
    closeSettings: document.getElementById('closeSettings'),
    modeBadge: document.getElementById('modeBadge'),
  };

  function fmt(iso){ try { return new Date(iso).toLocaleString(); } catch(e){ return iso; } }

  function addMessage(text, cls='bot', ts){
    const el = document.createElement('div'); el.className = `message ${cls}`;
    const c = document.createElement('div'); c.className='content'; c.textContent = text; el.appendChild(c);
    if(ts){ const t = document.createElement('span'); t.className='ts'; t.textContent = fmt(ts); el.appendChild(t); }
    ui.messages.appendChild(el); ui.messages.scrollTop = ui.messages.scrollHeight;
  }

  function clearMessages(){ ui.messages.innerHTML=''; }

  async function send(text){
    addMessage(text,'user',new Date().toISOString()); ui.input.value='';
    const loading=document.createElement('div'); loading.className='message loading'; loading.textContent='Thinking...'; ui.messages.appendChild(loading); ui.messages.scrollTop = ui.messages.scrollHeight;
    try{
      const res = await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:text})});
      const json = await res.json(); loading.remove();
      if(json.reply) addMessage(json.reply,'bot',new Date().toISOString()); else addMessage('No reply from server','bot',new Date().toISOString());
      await refresh();
    }catch(e){ loading.remove(); addMessage('Error contacting server','bot',new Date().toISOString()); console.error(e); }
  }

  ui.form && ui.form.addEventListener('submit', e=>{ e.preventDefault(); const t=ui.input.value.trim(); if(t) send(t); });

  async function refresh(){
    try{
      const r = await fetch('/api/history'); const j = await r.json();
      if(j.history && Array.isArray(j.history)){
        ui.historyList.innerHTML=''; const items=[];
        for(let i=0;i<j.history.length;i++){ const m=j.history[i]; if(m.role==='user'){ const rep=(j.history[i+1]&&j.history[i+1].role==='bot')?j.history[i+1].text:''; items.push({user:m.text,bot:rep,ts:m.ts}); } }
        if(!items.length) ui.historyList.innerHTML='<div class="history-item">No history yet</div>';
        else{ items.reverse().forEach(it=>{ const div=document.createElement('div'); div.className='history-item'; div.innerHTML=`<strong>${it.user.slice(0,60)}</strong><div style="font-size:12px;color:rgba(255,255,255,0.7)">${it.bot.slice(0,80)}</div><div style="font-size:11px;color:rgba(255,255,255,0.5);margin-top:6px">${fmt(it.ts)}</div>`; div.addEventListener('click',()=>{ clearMessages(); addMessage(it.user,'user',it.ts); if(it.bot) addMessage(it.bot,'bot',it.ts); }); ui.historyList.appendChild(div); }); }
        clearMessages(); j.history.slice(-20).forEach(m=>addMessage(m.text, m.role==='user'?'user':'bot', m.ts));
      }
    }catch(e){ console.warn('Failed to load history',e); ui.historyList.innerHTML='<div class="history-item">Failed to load</div>'; }
  }

  function doExport(){ window.location.href='/api/export'; }
  async function doClear(){ if(!confirm('Clear all conversation history? This cannot be undone.')) return; try{ const r=await fetch('/api/clear',{method:'POST'}); const j=await r.json(); if(j.ok){ await refresh(); alert('History cleared'); clearMessages(); } }catch(e){ alert('Failed to clear history'); } }

  ui.exportBtn && ui.exportBtn.addEventListener('click', doExport);
  ui.clearBtn && ui.clearBtn.addEventListener('click', doClear);
  ui.settingsBtn && ui.settingsBtn.addEventListener('click', ()=>ui.settingsModal.classList.remove('hidden'));
  ui.closeSettings && ui.closeSettings.addEventListener('click', ()=>ui.settingsModal.classList.add('hidden'));

  async function loadMode(){ try{ const r=await fetch('/api/mode'); const j=await r.json(); if(j.mode) ui.modeBadge.textContent = j.mode==='openai'?'OpenAI':'Local (KB)'; }catch(e){} }

  window.addEventListener('load', ()=>{ refresh(); loadMode(); });

})();
      ui.messages.appendChild(el); ui.messages.scrollTop = ui.messages.scrollHeight;
