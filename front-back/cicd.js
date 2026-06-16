// ============================================================================
// cicd.js — déploiement CI/CD : tagging (toggleCardTag, getTaggedFiles),
//           panneau CI/CD, push/pull GitLab/Azure, Jenkins. Extrait de qa-agent.js.
// ============================================================================

if(!window._taggedCards) window._taggedCards = new Set();
function toggleCardTag(cardId) {
  if(!window._taggedCards) window._taggedCards=new Set();
  if(window._taggedCards.has(cardId)){window._taggedCards.delete(cardId);showToast('Retire du deploy');}
  else{window._taggedCards.add(cardId);showToast('Tague pour deploy');}
  var btn=document.getElementById('tagBtn-'+cardId);
  if(btn){var t=window._taggedCards.has(cardId);btn.style.borderColor=t?'#c084fc':'var(--border)';btn.style.color=t?'#c084fc':'var(--gray)';btn.textContent=t?'Tagged':'Tag';}
  var badge=document.getElementById('cicdBadge');
  if(badge) badge.textContent=window._taggedCards.size>0?' ('+window._taggedCards.size+')':'';
}
function getTaggedFiles(){
  if(!window._taggedCards) return [];
  var files=[];
  window._taggedCards.forEach(function(id){
    var card=(window._codeCards||[]).find(function(c){return c.cardId===id;});
    if(card&&card.files) card.files.forEach(function(f){if(f.filename&&f.code&&!f.filename.endsWith('.gitkeep')) files.push({path:f.filename,content:f.code});});
  });
  return files;
}
function openCICDPanel(){
  if(!window._taggedCards) window._taggedCards=new Set();
  var ov=document.getElementById('cicdPanelOverlay');
  if(ov){ov.style.display=ov.style.display==='none'?'flex':'none';if(ov.style.display!=='none')_renderCICDContent();return;}
  ov=document.createElement('div');ov.id='cicdPanelOverlay';
  ov.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,0.4);z-index:800;display:flex;justify-content:flex-end;pointer-events:none';
  var panel=document.createElement('div');
  panel.style.cssText='width:560px;min-width:380px;max-width:95vw;height:100vh;background:var(--surface);border-left:1px solid var(--border);display:flex;flex-direction:column;pointer-events:all;box-shadow:-4px 0 24px rgba(0,0,0,0.4);position:relative;';
  var handle=document.createElement('div');handle.style.cssText='position:absolute;left:0;top:0;bottom:0;width:5px;cursor:ew-resize;z-index:10';
  handle.addEventListener('mousedown',function(e){e.preventDefault();var sx=e.clientX,sw=panel.offsetWidth;var onM=function(m){panel.style.width=Math.min(Math.max(sw+(sx-m.clientX),380),window.innerWidth*0.95)+'px';};var onU=function(){document.removeEventListener('mousemove',onM);document.removeEventListener('mouseup',onU);};document.addEventListener('mousemove',onM);document.addEventListener('mouseup',onU);});
  var hdr=document.createElement('div');hdr.style.cssText='display:flex;align-items:center;gap:8px;padding:12px 14px;background:var(--card);border-bottom:1px solid var(--border);flex-shrink:0';
  hdr.innerHTML='<span style="font-size:13px;font-weight:700;color:#c084fc;letter-spacing:1px">CI/CD DEPLOY</span>'
    +'<span id="cicdTagCount" style="font-size:11px;color:var(--gray);margin-left:6px"></span>'
    +'<button onclick="document.getElementById(\'cicdPanelOverlay\').style.display=\'none\'" style="background:transparent;border:none;color:var(--gray);font-size:18px;cursor:pointer;margin-left:auto">&#x2715;</button>';
  var tabs=document.createElement('div');tabs.style.cssText='display:flex;border-bottom:1px solid var(--border);flex-shrink:0;background:var(--card)';
  [['tagged','TAGUÉS'],['gitlab','GITLAB'],['azure','AZURE']].forEach(function(td,i){
    var b=document.createElement('button');b.id='cicdTab-'+td[0];b.textContent=td[1];
    b.style.cssText='flex:1;padding:10px;font-size:11px;font-family:monospace;cursor:pointer;border:none;border-bottom:2px solid '+(i===0?'#c084fc':'transparent')+';background:transparent;color:'+(i===0?'#c084fc':'var(--gray)');
    (function(t){b.onclick=function(){switchCICDTab(t);};})(td[0]);tabs.appendChild(b);
  });
  var content=document.createElement('div');content.id='cicdPanelContent';content.style.cssText='flex:1;overflow-y:auto;';content.dataset.tab='tagged';
  panel.appendChild(handle);panel.appendChild(hdr);panel.appendChild(tabs);panel.appendChild(content);
  ov.appendChild(panel);document.body.appendChild(ov);
  ov.addEventListener('click',function(e){if(e.target===ov)ov.style.display='none';});
  _renderCICDContent();
}
function switchCICDTab(tab){
  ['tagged','gitlab','azure'].forEach(function(t){var b=document.getElementById('cicdTab-'+t);if(b){b.style.borderBottomColor=t===tab?'#c084fc':'transparent';b.style.color=t===tab?'#c084fc':'var(--gray)';}});
  var c=document.getElementById('cicdPanelContent');if(c){c.dataset.tab=tab;_renderCICDContent();}
}
function _renderCICDContent(){
  var c=document.getElementById('cicdPanelContent');if(!c)return;
  var tab=c.dataset.tab||'tagged';
  var el=document.getElementById('cicdTagCount');
  if(el)el.textContent=window._taggedCards&&window._taggedCards.size>0?window._taggedCards.size+' tague(s)':'Aucun bloc tague';
  if(tab==='tagged')_cicdTaggedTab(c);else _cicdProviderTab(c,tab);
}
function _cicdTaggedTab(c){
  var tagged=[...(window._taggedCards||new Set())].map(function(id){return(window._codeCards||[]).find(function(x){return x.cardId===id;});}).filter(Boolean);
  if(!tagged.length){c.innerHTML='<div style="padding:40px;text-align:center;color:var(--gray);font-size:12px">Clique sur <strong style="color:#c084fc">Tag</strong> sur un bloc de code</div>';return;}
  var h='<div style="padding:8px 14px;font-size:11px;color:var(--gray);border-bottom:1px solid var(--border)">'+tagged.length+' bloc(s) — '+getTaggedFiles().length+' fichier(s)</div>';
  tagged.forEach(function(card){
    var nbFiles=(card.files||[]).length;
    h+='<div style="border-bottom:1px solid var(--border);padding:10px 14px">'
      +'<div style="display:flex;align-items:center;gap:8px;margin-bottom:5px">'
      +'<span style="font-size:12px;font-weight:700;color:var(--teal);flex:1">'+escHtml(card.title||card.cardId)+'</span>'
      +'<span style="font-size:10px;color:var(--gray);margin-right:6px">('+nbFiles+' fichier(s))</span>'
      +'<button onclick="toggleCardTag(\''+card.cardId+'\');" style="background:rgba(220,38,38,0.08);border:1px solid rgba(220,38,38,0.3);color:var(--red);padding:2px 8px;border-radius:4px;font-size:10px;cursor:pointer">Retirer</button>'
      +'</div>'
      +'<div style="display:flex;gap:4px;flex-wrap:wrap">'
      +(card.files||[]).map(function(f){return'<span style="font-size:13px;background:var(--card);border:1px solid var(--border);padding:4px 10px;border-radius:8px;color:var(--teal);font-family:monospace">'+escHtml(f.filename)+'</span>';}).join('')
      +'</div></div>';
  });
  h+='<div style="padding:12px;display:flex;gap:6px;border-top:1px solid var(--border)"><button onclick="switchCICDTab(\'gitlab\')" style="flex:1;padding:8px;font-size:11px;font-family:monospace;border-radius:6px;cursor:pointer;border:1px solid var(--border);background:rgba(192,132,252,0.08);color:#c084fc">GitLab</button><button onclick="switchCICDTab(\'azure\')" style="flex:1;padding:8px;font-size:11px;font-family:monospace;border-radius:6px;cursor:pointer;border:1px solid var(--border);background:rgba(0,120,212,0.08);color:#60a5fa">Azure</button></div>';
  c.innerHTML=h;
}
function _cicdInp(id,val,ph,pw){return'<input id="'+id+'" type="'+(pw?'password':'text')+'" value="'+escHtml(val||'')+'" placeholder="'+escHtml(ph||'')+'" style="width:100%;background:var(--card);border:1px solid var(--border);border-radius:6px;padding:7px 10px;font-size:12px;font-family:monospace;color:var(--text);box-sizing:border-box"/>';}
function _cicdProviderTab(c,provider){
  var isGL=provider==='gitlab',color=isGL?'#c084fc':'#60a5fa',label=isGL?'GitLab':'Azure DevOps';
  var stored={};try{stored=JSON.parse(localStorage.getItem('cicd_'+provider)||'{}');}catch(e){}
  var files=getTaggedFiles();
  var fHtml=files.length?files.map(function(f){return'<div style="font-size:11px;color:var(--teal);font-family:monospace">'+escHtml(f.path)+'</div>';}).join(''):'<div style="font-size:11px;color:var(--red)">Aucun bloc tague</div>';
  c.innerHTML='<div style="padding:16px 14px"><div style="font-size:13px;font-weight:700;color:'+color+';margin-bottom:14px">'+label+'</div><div style="display:flex;flex-direction:column;gap:10px">'
    +'<div><label style="font-size:11px;color:var(--gray);display:block;margin-bottom:3px">URL repo</label>'+_cicdInp(provider+'_url',stored.url,isGL?'https://gitlab.com/org/repo':'https://dev.azure.com/org/repo')+'</div>'
    +'<div><label style="font-size:11px;color:var(--gray);display:block;margin-bottom:3px">Token</label>'+_cicdInp(provider+'_token',stored.token,'token',true)+'</div>'
    +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px"><div><label style="font-size:11px;color:var(--gray);display:block;margin-bottom:3px">Branche</label>'+_cicdInp(provider+'_branch',stored.branch||'main','main')+'</div>'
    +'<div><label style="font-size:11px;color:var(--gray);display:block;margin-bottom:3px">Nouvelle branche</label>'+_cicdInp(provider+'_newbranch',stored.newbranch,'feature/tests-rf')+'</div></div>'
    +'<div><label style="font-size:11px;color:var(--gray);display:block;margin-bottom:3px">Message commit</label>'+_cicdInp(provider+'_msg',stored.msg||'feat: ajout tests RF','feat: ...')+'</div>'
    +'<div><label style="font-size:11px;color:var(--gray);display:block;margin-bottom:3px">Dossier destination</label>'+_cicdInp(provider+'_folder',stored.folder||'tests/robot','tests/robot')+'</div>'
    +'</div><div style="margin-top:12px;padding:8px;background:var(--card);border-radius:6px;border:1px solid var(--border)"><div style="font-size:11px;color:var(--gray);margin-bottom:4px">Fichiers ('+files.length+')</div>'+fHtml+'</div>'
    +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px">'
    +'<button onclick="_cicdPush(&quot;'+provider+'&quot;)" style="padding:10px;background:rgba(192,132,252,0.12);border:1px solid '+color+';color:'+color+';border-radius:8px;font-size:12px;font-family:monospace;cursor:pointer;font-weight:700">Push</button>'
    +'<button onclick="_cicdPull(&quot;'+provider+'&quot;)" style="padding:10px;background:rgba(0,212,170,0.08);border:1px solid var(--teal);color:var(--teal);border-radius:8px;font-size:12px;font-family:monospace;cursor:pointer;font-weight:700">Pull</button>'
    +'</div><div id="'+provider+'_status" style="margin-top:10px;font-size:12px;display:none"></div></div>';
}

async function _cicdPush(provider){
  var url=document.getElementById(provider+'_url')?.value?.trim(),token=document.getElementById(provider+'_token')?.value?.trim();
  var branch=document.getElementById(provider+'_branch')?.value?.trim()||'main',newBranch=document.getElementById(provider+'_newbranch')?.value?.trim()||'';
  var msg=document.getElementById(provider+'_msg')?.value?.trim()||'feat: tests RF',folder=document.getElementById(provider+'_folder')?.value?.trim()||'tests/robot';
  var statusEl=document.getElementById(provider+'_status'),files=getTaggedFiles();
  if(!url||!token){showToast('URL et token requis');return;}
  if(!files.length){showToast('Aucun bloc tagué');return;}
  localStorage.setItem('cicd_'+provider,JSON.stringify({url:url,token:token,branch:branch,newbranch:newBranch,msg:msg,folder:folder}));
  if(statusEl){statusEl.style.display='block';statusEl.innerHTML='<span style="color:var(--teal)">Analyse des changements...</span>';}

  // ── Étape 1 : git status (diff)
  var diffData = null;
  try {
    var diffRes = await fetch('http://localhost:3001/api/cicd/diff', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({provider,url,token,branch,folder,files})
    });
    diffData = await diffRes.json();
  } catch(e) {
    diffData = { ok: false };
  }

  // Si diff échoue, on pushe tout avec create/update fallback
  if (!diffData || !diffData.ok) {
    if(statusEl)statusEl.innerHTML='<span style="color:var(--warn)">Diff indisponible — push direct...</span>';
    await _cicdDoPush(provider,url,token,branch,newBranch,msg,folder,files,statusEl);
    return;
  }

  var added    = diffData.added    || [];
  var modified = diffData.modified || [];
  var unchanged= diffData.unchanged|| [];
  var deleted  = diffData.deleted  || [];
  var toPush   = files.filter(function(f){ return added.includes(f.path)||modified.includes(f.path); })
                      .map(function(f){ return {...f, status: modified.includes(f.path)?'modified':'added'}; });
  // Ajouter les fichiers à supprimer
  deleted.forEach(function(p){ toPush.push({path:p, content:'', status:'deleted'}); });

  if(!toPush.length){
    if(statusEl)statusEl.innerHTML='<span style="color:var(--gray)">Aucun changement à pusher</span>';
    showToast('Rien à pusher — tous les fichiers sont identiques');
    return;
  }

  // ── Étape 2 : afficher le dialog git status
  _showDiffDialog({added,modified,unchanged,deleted,toPush,provider,url,token,branch,newBranch,msg,folder,statusEl});
}

function _showDiffDialog({added,modified,unchanged,deleted,toPush,provider,url,token,branch,newBranch,msg,folder,statusEl}){
  deleted = deleted || [];
  document.getElementById('_diffDialog')?.remove();
  var d = document.createElement('div');
  d.id = '_diffDialog';
  d.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,0.65);z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px';

  var rows = '';
  added.forEach(function(p){ rows+='<div style="display:flex;align-items:center;gap:8px;padding:4px 0;font-size:11px;font-family:monospace"><span style="color:#22c55e;width:80px;flex-shrink:0">● added</span><span style="color:var(--text)">'+escHtml(p)+'</span></div>'; });
  modified.forEach(function(p){ rows+='<div style="display:flex;align-items:center;gap:8px;padding:4px 0;font-size:11px;font-family:monospace"><span style="color:#f59e0b;width:80px;flex-shrink:0">● modified</span><span style="color:var(--text)">'+escHtml(p)+'</span></div>'; });
  deleted.forEach(function(p){ rows+='<div style="display:flex;align-items:center;gap:8px;padding:4px 0;font-size:11px;font-family:monospace"><span style="color:#ef4444;width:80px;flex-shrink:0">✕ deleted</span><span style="color:#ef4444;text-decoration:line-through">'+escHtml(p)+'</span></div>'; });
  unchanged.forEach(function(p){ rows+='<div style="display:flex;align-items:center;gap:8px;padding:4px 0;font-size:11px;font-family:monospace"><span style="color:var(--gray);width:80px;flex-shrink:0">○ unchanged</span><span style="color:var(--gray)">'+escHtml(p)+'</span></div>'; });

  d.innerHTML='<div style="background:var(--surface);border:1px solid var(--border);border-radius:12px;width:100%;max-width:480px;overflow:hidden">'
    +'<div style="padding:12px 18px;background:var(--card);border-bottom:1px solid var(--border);display:flex;align-items:center;gap:8px">'
    +'<span style="font-size:13px;font-weight:700;color:var(--teal)">📋 Git Status</span>'
    +'<span style="font-size:11px;color:var(--gray);margin-left:auto">'+toPush.length+' fichier(s) à pusher</span>'
    +'</div>'
    +'<div style="padding:14px 18px;max-height:320px;overflow-y:auto">'+rows+'</div>'
    +'<div style="padding:12px 18px;background:var(--card);border-top:1px solid var(--border);display:flex;gap:8px">'
    +'<button id="_diffConfirm" style="flex:1;padding:9px;background:rgba(192,132,252,0.12);border:1px solid #c084fc;color:#c084fc;border-radius:8px;font-size:12px;font-family:monospace;cursor:pointer;font-weight:700">🚀 Push ('+toPush.length+')</button>'
    +'<button id="_diffCancel" style="padding:9px 16px;background:transparent;border:1px solid var(--border);color:var(--gray);border-radius:8px;font-size:12px;font-family:monospace;cursor:pointer">Annuler</button>'
    +'</div>'
    +'</div>';

  document.body.appendChild(d);
  document.getElementById('_diffCancel').onclick=function(){ d.remove(); if(statusEl)statusEl.innerHTML=''; };
  document.getElementById('_diffConfirm').onclick=async function(){
    d.remove();
    await _cicdDoPush(provider,url,token,branch,newBranch,msg,folder,toPush,statusEl);
  };
}

async function _cicdDoPush(provider,url,token,branch,newBranch,msg,folder,files,statusEl){
  if(statusEl){statusEl.style.display='block';statusEl.innerHTML='<span style="color:var(--teal)">Push en cours...</span>';}
  try{
    var res=await fetch('http://localhost:3001/api/cicd/push',{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({provider,url,token,branch,newBranch,msg,folder,files})});
    var data=await res.json();
    if(data.ok){if(statusEl)statusEl.innerHTML='<span style="color:#22c55e">✅ Push réussi !</span>';showToast('Code pushé sur '+provider);}
    else{if(statusEl)statusEl.innerHTML='<span style="color:#DC2626">Erreur: '+escHtml(data.error||'inconnue')+'</span>';}
  }catch(e){if(statusEl)statusEl.innerHTML='<span style="color:#DC2626">'+escHtml(e.message)+'</span>';}
}
async function _cicdPull(provider){
  var url=document.getElementById(provider+'_url')?.value?.trim(),token=document.getElementById(provider+'_token')?.value?.trim();
  var branch=document.getElementById(provider+'_branch')?.value?.trim()||'main',folder=document.getElementById(provider+'_folder')?.value?.trim()||'';
  var statusEl=document.getElementById(provider+'_status');
  if(!url||!token){showToast('URL et token requis');return;}
  // Sauvegarder token + url au Pull
  var _stored={};try{_stored=JSON.parse(localStorage.getItem('cicd_'+provider)||'{}');}catch(e){}
  localStorage.setItem('cicd_'+provider,JSON.stringify({..._stored,url:url,token:token,branch:branch,folder:folder}));
  if(statusEl){statusEl.style.display='block';statusEl.innerHTML='<span style="color:var(--teal)">Recuperation...</span>';}
  try{var res=await fetch('http://localhost:3001/api/cicd/pull',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({provider:provider,url:url,token:token,branch:branch,folder:folder})});var data=await res.json();
  if(data.ok&&data.files&&data.files.length){
    var _repoName=(function(){try{var u=document.getElementById(provider+'_url')?.value?.trim()||'';return u.replace(/\/$/,'').split('/').pop()||provider;}catch(e){return provider;}})();
    var _source=_repoName+' ('+provider+'/'+branch+')';
    _importRFFiles(data.files,_source);if(statusEl)statusEl.innerHTML='<span style="color:#22c55e">'+data.files.length+' fichier(s)</span>';showToast(data.files.length+' fichiers importes');}
  else{if(statusEl)statusEl.innerHTML='<span style="color:#DC2626">'+escHtml((data&&data.error)||'Aucun .robot')+'</span>';}}
  catch(e){if(statusEl)statusEl.innerHTML='<span style="color:#DC2626">'+escHtml(e.message)+'</span>';}
}
async function _cicdJenkinsTrigger(){
  showToast('Jenkins supprimé — utilise GitLab ou Azure');
  return;
  var url='',job='',user='',token='',params='';
  var statusEl=null;
  if(!url||!job||!token){showToast('URL, job et token requis');return;}
  localStorage.setItem('cicd_jenkins',JSON.stringify({url:url,job:job,user:user,token:token,params:params}));
  if(statusEl){statusEl.style.display='block';statusEl.innerHTML='<span style="color:var(--teal)">Declenchement...</span>';}
  try{var res=await fetch('http://localhost:3001/api/cicd/jenkins',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({url:url,job:job,user:user,token:token,params:params})});var data=await res.json();
  if(data.ok){if(statusEl)statusEl.innerHTML='<span style="color:#22c55e">Pipeline declenche!</span>';showToast('Jenkins declenche');}
  else{if(statusEl)statusEl.innerHTML='<span style="color:#DC2626">'+escHtml((data&&data.error)||'Erreur')+'</span>';}}
  catch(e){if(statusEl)statusEl.innerHTML='<span style="color:#DC2626">'+escHtml(e.message)+'</span>';}
}
async function _cicdJenkinsPull(){
  showToast('Jenkins supprimé — utilise GitLab ou Azure');
  return;
  var url='',job='',user='',token='',build='';
  var statusEl=null;
  if(!url||!job||!token){showToast('URL, job et token requis');return;}
  if(statusEl){statusEl.style.display='block';statusEl.innerHTML='<span style="color:var(--teal)">Pull artifacts...</span>';}
  try{var res=await fetch('http://localhost:3001/api/cicd/jenkins-artifacts',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({url:url,job:job,user:user,token:token,buildNumber:build})});var data=await res.json();
  if(data.ok&&data.files&&data.files.length){_importRFFiles(data.files,'Jenkins #'+(data.buildNumber||'?'));if(statusEl)statusEl.innerHTML='<span style="color:#22c55e">'+data.files.length+' artifact(s)</span>';showToast(data.files.length+' artifacts');}
  else{if(statusEl)statusEl.innerHTML='<span style="color:#DC2626">'+escHtml((data&&data.error)||'Aucun artifact')+'</span>';}}
  catch(e){if(statusEl)statusEl.innerHTML='<span style="color:#DC2626">'+escHtml(e.message)+'</span>';}
}
