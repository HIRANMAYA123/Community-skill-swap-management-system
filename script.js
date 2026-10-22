// ---- Data (mirrors the sample rows in the SQL script) ----
const D={
users:[[1,'Aarav Sharma','aarav@example.com','9876500001','Delhi'],[2,'Priya Verma','priya@example.com','9876500002','Gurugram'],[3,'Rahul Das','rahul@example.com','9876500003','Noida'],[4,'Sneha Patel','sneha@example.com','9876500004','Delhi'],[5,'Kabir Singh','kabir@example.com','9876500005','Jaipur']].map(r=>({id:r[0],name:r[1],email:r[2],phone:r[3],city:r[4],status:'active'})),
skills:[[1,1,'Python Programming','advanced','Python lessons',1],[2,2,'Graphic Design','intermediate','Logo and poster design',2],[3,3,'Web Development','advanced','HTML CSS JavaScript React',1],[4,4,'Public Speaking','intermediate','Communication skills',3],[5,5,'Photography','beginner','Photography basics',4],[6,2,'SQL Database','advanced','SQL and database design',1]].map(r=>({id:r[0],uid:r[1],name:r[2],level:r[3],desc:r[4],cat:r[5]})),
cats:[[1,'Programming'],[2,'Design'],[3,'Communication'],[4,'Photography']].map(r=>({id:r[0],name:r[1]})),
swaps:[[1,1,2,2,'Python Programming','2026-11-05','accepted'],[2,2,1,1,'Graphic Design','2026-11-06','pending'],[3,3,4,4,'Web Development','2026-11-07','completed'],[4,5,3,3,'Photography','2026-11-08','rejected']].map(r=>({id:r[0],req:r[1],prov:r[2],offered:r[3],wanted:r[4],date:r[5],status:r[6]})),
sessions:[[1,1,'2026-11-05','10:00',60,'online','Google Meet','scheduled'],[2,2,'2026-11-06','14:00',90,'offline','Community Library','scheduled'],[3,3,'2026-11-07','16:00',60,'online','Microsoft Teams','completed']].map(r=>({id:r[0],rid:r[1],date:r[2],time:r[3],mins:r[4],mode:r[5],loc:r[6],status:r[7]})),
reviews:[{id:1,sid:3,by:3,of:4,rating:5,text:'Very helpful and clear explanation'}]};
const U=id=>D.users.find(u=>u.id==id),S=id=>D.skills.find(s=>s.id==id),R=id=>D.swaps.find(s=>s.id==id);
const nextId=a=>Math.max(0,...a.map(x=>x.id))+1;
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const cap=s=>s[0].toUpperCase()+s.slice(1);
const badge=s=>`<span class="badge ${s}">${cap(s)}</span>`;
function toast(m){const t=document.getElementById('toast');t.textContent=m;t.classList.add('on');clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.remove('on'),2200)}

// ---- Dialog form helper ----
function form(title,fields,submit,label='Save'){
 const f=document.getElementById('frm');
 f.innerHTML=`<h3>${title}</h3>`+fields.map(x=>`<label>${x.label}${x.options?`<select name="${x.name}">${x.options.map(o=>`<option value="${esc(o[0])}">${esc(o[1])}</option>`).join('')}</select>`:x.area?`<textarea name="${x.name}" rows="3"></textarea>`:`<input name="${x.name}" type="${x.type||'text'}" ${x.req?'required':''} ${x.attr||''} value="${esc(x.val||'')}">`}</label>`).join('')+`<div class="err" id="err"></div><div class="acts"><button type="button" class="btn ghost" id="cx">Cancel</button><button class="btn">${label}</button></div>`;
 const d=document.getElementById('dlg');
 f.onsubmit=e=>{e.preventDefault();const v=Object.fromEntries(new FormData(f));const m=submit(v);if(m){document.getElementById('err').textContent=m;return}d.close();render()};
 document.getElementById('cx').onclick=()=>d.close();d.showModal();
}

// ---- Views ----
const views={
overview(){
 const cnt=(a,st)=>a.filter(x=>x.status==st).length;
 const st=[[cnt(D.users,'active'),'Active members'],[D.skills.length,'Skills on offer'],[cnt(D.swaps,'pending'),'Pending requests'],[cnt(D.swaps,'completed'),'Completed swaps'],[cnt(D.sessions,'completed'),'Completed sessions']];
 return head('Who’s swapping what','See every exchange happening around the community.')+
 `<div class="stats">${st.map(s=>`<div class="stat"><b>${s[0]}</b><span>${s[1]}</span></div>`).join('')}</div>
 <h3 class="sec">Swap board</h3><div class="board">${D.swaps.map(w=>{const a=U(w.req),b=U(w.prov);return `<div class="pair"><div class="who"><b>${esc(a.name)}</b><small>wants ${esc(w.wanted)}</small></div><span class="x">⇄</span><div class="who"><b>${esc(b.name)}</b><small>offers ${esc(S(w.offered)?.name)}</small></div>${badge(w.status)}</div>`}).join('')}</div>`},
members(){
 const q=(ui.q||'').toLowerCase(),c=ui.city||'';
 const cities=[...new Set(D.users.map(u=>u.city))].sort();
 const rows=D.users.filter(u=>(!c||u.city==c)&&(u.name+u.email).toLowerCase().includes(q));
 return head('Members','Everyone who has joined the community.','<button class="btn" onclick="addUser()">Add member</button>')+
 `<div class="tools"><input placeholder="Search by name or email" value="${esc(ui.q)}" oninput="ui.q=this.value;render('members',1)"><select onchange="ui.city=this.value;render()"><option value="">All cities</option>${cities.map(x=>`<option ${x==c?'selected':''}>${esc(x)}</option>`).join('')}</select></div>`+
 (rows.length?`<div class="wrap"><table><tr><th>Name</th><th>Email</th><th>City</th><th>Skills</th><th>Status</th></tr>${rows.map(u=>`<tr><td>${esc(u.name)}</td><td>${esc(u.email)}</td><td>${esc(u.city)}</td><td>${D.skills.filter(s=>s.uid==u.id).length}</td><td><button class="btn ghost sm" onclick="toggleUser(${u.id})">${badge(u.status)}</button></td></tr>`).join('')}</table></div>`:'<div class="empty">No members match. Clear the search or pick another city.</div>')},
skills(){
 const q=(ui.q||'').toLowerCase(),l=ui.level||'',c=ui.cat||'';
 const rows=D.skills.filter(s=>U(s.uid).status=='active'&&(!l||s.level==l)&&(!c||s.cat==c)&&s.name.toLowerCase().includes(q));
 return head('Skills','Find someone who can teach what you want to learn.','<button class="btn" onclick="addSkill()">Offer a skill</button>')+
 `<div class="tools"><input placeholder="Search skills, e.g. Python" value="${esc(ui.q)}" oninput="ui.q=this.value;render('skills',1)"><select onchange="ui.level=this.value;render()"><option value="">Any level</option>${['beginner','intermediate','advanced'].map(x=>`<option ${x==l?'selected':''}>${x}</option>`).join('')}</select><select onchange="ui.cat=this.value;render()"><option value="">All categories</option>${D.cats.map(x=>`<option value="${x.id}" ${x.id==c?'selected':''}>${esc(x.name)}</option>`).join('')}</select></div>`+
 (rows.length?`<div class="cards">${rows.map(s=>{const u=U(s.uid);return `<div class="card"><h3>${esc(s.name)}</h3><p>${esc(s.desc)}</p><div class="meta"><span class="badge">${s.level}</span><span class="badge">${esc(D.cats.find(c=>c.id==s.cat).name)}</span></div><p>${esc(u.name)}, ${esc(u.city)}</p><button class="btn sm" onclick="addSwap(${u.id},'${esc(s.name).replace(/'/g,'’')}')">Request a swap</button></div>`}).join('')}</div>`:'<div class="empty">No skills found. Try a shorter search or offer this skill yourself.</div>')},
swaps(){
 const f=ui.st||'';const rows=D.swaps.filter(w=>!f||w.status==f);
 return head('Swap requests','Accept, schedule and complete exchanges.','<button class="btn" onclick="addSwap()">New request</button>')+
 `<div class="tools">${['','pending','accepted','completed','rejected','cancelled'].map(s=>`<button class="btn sm ${f==s?'':'ghost'}" onclick="ui.st='${s}';render()">${s?cap(s):'All'}</button>`).join('')}</div>`+
 (rows.length?rows.map(w=>{const a=[];
  if(w.status=='pending')a.push(['Accept',`setSwap(${w.id},'accepted')`],['Reject',`setSwap(${w.id},'rejected')`],['Cancel',`setSwap(${w.id},'cancelled')`]);
  if(w.status=='accepted')a.push(['Schedule session',`addSession(${w.id})`],['Mark completed',`setSwap(${w.id},'completed')`],['Cancel',`setSwap(${w.id},'cancelled')`]);
  return `<div class="row"><div><b>${esc(U(w.req).name)} ⇄ ${esc(U(w.prov).name)}</b><br><small>Wants ${esc(w.wanted)} · offers ${esc(S(w.offered)?.name)} · ${w.date||'no date'}</small></div><div class="acts">${badge(w.status)}${a.map(x=>`<button class="btn ghost sm" onclick="${x[1]}">${x[0]}</button>`).join('')}</div></div>`}).join(''):'<div class="empty">No requests with this status.</div>')},
sessions(){
 return head('Sessions','Meetings booked for accepted swaps.')+(D.sessions.length?D.sessions.map(s=>{const w=R(s.rid);const rv=D.reviews.some(r=>r.sid==s.id);
  const a=[];if(s.status=='scheduled')a.push(['Complete',`setSession(${s.id},'completed')`],['Cancel',`setSession(${s.id},'cancelled')`]);
  if(s.status=='completed'&&!rv)a.push(['Write review',`addReview(${s.id})`]);
  return `<div class="row"><div><b>${esc(U(w.req).name)} ⇄ ${esc(U(w.prov).name)}</b><br><small>${s.date} at ${s.time} · ${s.mins} min · ${s.mode}, ${esc(s.loc)}</small></div><div class="acts">${badge(s.status)}${a.map(x=>`<button class="btn ghost sm" onclick="${x[1]}">${x[0]}</button>`).join('')}</div></div>`}).join(''):'<div class="empty">No sessions yet. Accept a request, then schedule it.</div>')},
reviews(){
 const avg=D.reviews.length?(D.reviews.reduce((a,r)=>a+r.rating,0)/D.reviews.length).toFixed(1):'–';
 return head('Reviews',`Average rating ${avg} from ${D.reviews.length} review${D.reviews.length==1?'':'s'}.`)+(D.reviews.length?D.reviews.map(r=>`<div class="row"><div><b>${esc(U(r.by).name)}</b> reviewed <b>${esc(U(r.of).name)}</b><br><small>${esc(r.text||'No comment')}</small></div><span class="stars" aria-label="${r.rating} out of 5">${'★'.repeat(r.rating)}${'☆'.repeat(5-r.rating)}</span></div>`).join(''):'<div class="empty">No reviews yet. Complete a session to leave one.</div>')}
};
const titles={overview:'Overview',members:'Members',skills:'Skills',swaps:'Swaps',sessions:'Sessions',reviews:'Reviews'};
const ui={view:'overview'};
const head=(t,p,x='')=>`<div class="head"><div><h2>${t}</h2><p>${p}</p></div>${x}</div>`;
const themeKey='skill-swap-theme';
const savedTheme=localStorage.getItem(themeKey);
if(savedTheme==='light'||savedTheme==='dark')document.documentElement.dataset.theme=savedTheme;
function isDarkTheme(){
 return document.documentElement.dataset.theme==='dark'||(!document.documentElement.dataset.theme&&window.matchMedia('(prefers-color-scheme: dark)').matches);
}
function toggleTheme(){
 const theme=isDarkTheme()?'light':'dark';
 document.documentElement.dataset.theme=theme;
 localStorage.setItem(themeKey,theme);
 render();
}
function render(v,keep){
 if(v&&!keep){ui.view=v;ui.q='';ui.city='';ui.level='';ui.cat='';ui.st=''}
 const focus=document.activeElement,id=focus&&focus.tagName=='INPUT'&&focus.closest('.tools')?1:0,pos=id?focus.selectionStart:0;
 document.getElementById('nav').innerHTML='<div class="brand"><i></i><span>Skill Swap</span><small>COMMUNITY</small></div><div class="nav-links">'+Object.keys(titles).map(k=>`<button class="nav-link" ${k==ui.view?'aria-current="page"':''} onclick="render('${k}')"><span>${titles[k]}</span>${k=='swaps'?`<span class="count">${D.swaps.filter(s=>s.status=='pending').length}</span>`:''}</button>`).join('')+'</div>'+`<button class="theme-toggle" type="button" aria-pressed="${isDarkTheme()}" onclick="toggleTheme()"><span class="theme-icon" aria-hidden="true"></span><span>Dark theme</span><span class="theme-state">${isDarkTheme()?'On':'Off'}</span></button>`;
 document.getElementById('main').innerHTML=views[ui.view]();
 if(id){const i=document.querySelector('.tools input');if(i){i.focus();i.setSelectionRange(pos,pos)}}
}
// ---- Actions (equivalent to the SQL procedures, updates and triggers) ----
function addUser(){form('Add member',[{name:'name',label:'Full name',req:1},{name:'email',label:'Email',type:'email',req:1},{name:'city',label:'City'}],v=>{
 if(D.users.some(u=>u.email.toLowerCase()==v.email.toLowerCase()))return'That email is already registered.';
 D.users.push({id:nextId(D.users),name:v.name,email:v.email,phone:'',city:v.city||'Unknown',status:'active'});toast('Member added')})}
function toggleUser(id){const u=U(id);u.status=u.status=='active'?'inactive':'active';render()}
function addSkill(){form('Offer a skill',[{name:'uid',label:'Member',options:D.users.map(u=>[u.id,u.name])},{name:'name',label:'Skill name',req:1},{name:'level',label:'Level',options:['beginner','intermediate','advanced'].map(x=>[x,cap(x)])},{name:'cat',label:'Category',options:D.cats.map(c=>[c.id,c.name])},{name:'desc',label:'Description',area:1}],v=>{
 D.skills.push({id:nextId(D.skills),uid:+v.uid,name:v.name,level:v.level,desc:v.desc,cat:+v.cat});toast('Skill added')})}
function addSwap(prov,wanted){form('New swap request',[{name:'req',label:'Requester',options:D.users.map(u=>[u.id,u.name])},{name:'prov',label:'Provider',options:D.users.map(u=>[u.id,u.name]),},{name:'offered',label:'Skill offered in return',options:D.skills.map(s=>[s.id,`${s.name} (${U(s.uid).name})`])},{name:'wanted',label:'Skill requested',req:1,val:wanted},{name:'date',label:'Preferred date',type:'date'}],v=>{
 if(v.req==v.prov)return'Requester and provider must be different members.';
 D.swaps.push({id:nextId(D.swaps),req:+v.req,prov:+v.prov,offered:+v.offered,wanted:v.wanted,date:v.date,status:'pending'});toast('Request sent')});
 if(prov)document.querySelector('[name=prov]').value=prov}
function setSwap(id,s){R(id).status=s;toast('Request '+s);render()}
function addSession(rid){form('Schedule session',[{name:'date',label:'Date',type:'date',req:1,val:R(rid).date},{name:'time',label:'Start time',type:'time',req:1,val:'10:00'},{name:'mins',label:'Duration (minutes)',type:'number',req:1,val:60,attr:'min="1"'},{name:'mode',label:'Mode',options:[['online','Online'],['offline','Offline']]},{name:'loc',label:'Meeting location or link'}],v=>{
 if(+v.mins<1)return'Duration must be greater than 0.';
 D.sessions.push({id:nextId(D.sessions),rid,date:v.date,time:v.time,mins:+v.mins,mode:v.mode,loc:v.loc||'To be decided',status:'scheduled'});toast('Session scheduled')},'Schedule')}
function setSession(id,s){D.sessions.find(x=>x.id==id).status=s;toast('Session '+s);render()}
function addReview(sid){const s=D.sessions.find(x=>x.id==sid),w=R(s.rid);
 form('Write a review',[{name:'by',label:'Reviewer',options:[[w.req,U(w.req).name],[w.prov,U(w.prov).name]]},{name:'rating',label:'Rating (1 to 5)',type:'number',req:1,val:5,attr:'min="1" max="5"'},{name:'text',label:'Comments',area:1}],v=>{
 if(v.rating<1||v.rating>5)return'Rating must be between 1 and 5.';
 if(D.reviews.some(r=>r.sid==sid&&r.by==v.by))return'This member already reviewed this session.';
 D.reviews.push({id:nextId(D.reviews),sid,by:+v.by,of:v.by==w.req?w.prov:w.req,rating:+v.rating,text:v.text});toast('Review saved')},'Post review')}
render();
