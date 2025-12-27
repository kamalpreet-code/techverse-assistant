// Advanced chat frontend (chat-advanced.js)
const UI2 = {
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
// UI elements for panel toggling
const centerTab = document.getElementById('centerTab');
const chatPanel = document.getElementById('chatPanel');
const closePanel = document.getElementById('closePanel');

function fmt2(iso){ try { return new Date(iso).toLocaleString(); } catch(e){ return iso; } }

function addMessage2(text, cls='bot', ts){
  const el = document.createElement('div'); el.className = `message ${cls}`;
  const c = document.createElement('div'); c.className='content'; c.textContent = text; el.appendChild(c);
  if(ts){ const t = document.createElement('span'); t.className='ts'; t.textContent = fmt2(ts); el.appendChild(t); }
  UI2.messages.appendChild(el); UI2.messages.scrollTop = UI2.messages.scrollHeight;
}

function clearMsgs2(){ UI2.messages.innerHTML=''; }

async function send2(text){ addMessage2(text,'user',new Date().toISOString()); UI2.input.value=''; const l=document.createElement('div'); l.className='message loading'; l.textContent='Thinking...'; UI2.messages.appendChild(l); UI2.messages.scrollTop = UI2.messages.scrollHeight; try{ const r=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:text})}); const j=await r.json(); l.remove(); if(j.reply) addMessage2(j.reply,'bot',new Date().toISOString()); else addMessage2('No reply from server','bot',new Date().toISOString()); await refresh2(); }catch(e){ l.remove(); addMessage2('Error contacting server','bot',new Date().toISOString()); console.error(e); } }

UI2.form.addEventListener('submit', e=>{ e.preventDefault(); const t=UI2.input.value.trim(); if(t) send2(t); });

async function refresh2(){ try{ const r=await fetch('/api/history'); const j=await r.json(); if(j.history && Array.isArray(j.history)){ UI2.historyList.innerHTML=''; const items=[]; for(let i=0;i<j.history.length;i++){ const m=j.history[i]; if(m.role==='user'){ const rep=(j.history[i+1] && j.history[i+1].role==='bot')? j.history[i+1].text : ''; items.push({user:m.text,bot:rep,ts:m.ts}); } } if(!items.length) UI2.historyList.innerHTML='<div class="history-item">No history yet</div>'; else{ items.reverse().forEach(it=>{ const div=document.createElement('div'); div.className='history-item'; div.innerHTML=`<strong>${it.user.slice(0,60)}</strong><div style="font-size:12px;color:rgba(255,255,255,0.7)">${it.bot.slice(0,80)}</div><div style="font-size:11px;color:rgba(255,255,255,0.5);margin-top:6px">${new Date(it.ts).toLocaleString()}</div>`; div.addEventListener('click',()=>{ clearMsgs2(); addMessage2(it.user,'user',it.ts); if(it.bot) addMessage2(it.bot,'bot',it.ts); }); UI2.historyList.appendChild(div); }); } clearMsgs2(); j.history.slice(-20).forEach(m=>addMessage2(m.text, m.role==='user'?'user':'bot', m.ts)); } }catch(e){ console.warn('Failed to load history',e); UI2.historyList.innerHTML='<div class="history-item">Failed to load</div>'; } }

function export2(){ window.location.href='/api/export'; }
async function clear2(){ if(!confirm('Clear all conversation history? This cannot be undone.')) return; try{ const r=await fetch('/api/clear',{method:'POST'}); const j=await r.json(); if(j.ok){ await refresh2(); alert('History cleared'); clearMsgs2(); } }catch(e){ alert('Failed to clear history'); } }

UI2.exportBtn.addEventListener('click', export2);
UI2.clearBtn.addEventListener('click', clear2);
UI2.settingsBtn.addEventListener('click', ()=>UI2.settingsModal.classList.remove('hidden'));
UI2.closeSettings.addEventListener('click', ()=>UI2.settingsModal.classList.add('hidden'));

// Panel open/close handlers
if(centerTab && chatPanel){
  centerTab.addEventListener('click', ()=>{
    chatPanel.classList.toggle('open');
    // when opening, refresh history and focus input
    if(chatPanel.classList.contains('open')){ refresh2().then(()=>{ UI2.input && UI2.input.focus(); }); }
  });
}
if(closePanel && chatPanel){ closePanel.addEventListener('click', ()=>chatPanel.classList.remove('open')); }

async function loadMode2(){ try{ const r=await fetch('/api/mode'); const j=await r.json(); if(j.mode) UI2.modeBadge.textContent = j.mode==='openai'?'OpenAI':'Local (KB)'; }catch(e){} }

window.addEventListener('load', ()=>{ refresh2(); loadMode2(); });
