(() => {
"use strict";

const QUESTIONS = [
  ["IA","Qual técnica permite aprender padrões a partir de exemplos?",["Aprendizado de máquina","NAT","DNS","FTP"],0],
  ["Redes","Qual protocolo traduz nomes de domínio em IP?",["HTTP","DNS","SSH","FTP"],1],
  ["Linux","Qual comando lista arquivos?",["cd","pwd","ls","mkdir"],2],
  ["Segurança","Qual prática reduz o impacto de uma senha comprometida?",["Desativar logs","MFA","Reutilizar senha","Abrir portas"],1],
  ["Cisco","Qual dispositivo encaminha pacotes entre redes?",["Switch","Roteador","Hub","Access Point"],1],
  ["Vulnerabilidades","O que é uma vulnerabilidade?",["Fraqueza explorável","Backup","Antivírus","Usuário"],0],
  ["Endpoints","Um notebook corporativo conectado é um:",["Endpoint","DNS","Gateway","Firewall"],0],
  ["Linux","Qual comando mostra o diretório atual?",["pwd","grep","touch","rm"],0],
  ["Cisco","Qual protocolo permite administração remota segura?",["Telnet","SSH","FTP","HTTP"],1],
  ["IA","Um sistema que classifica spam é exemplo de:",["Classificação","NAT","Criptografia","Roteamento"],0],
  ["Segurança","Qual princípio concede apenas os acessos necessários?",["Privilégio mínimo","Acesso total","Senha compartilhada","Porta aberta"],0],
  ["Redes","Qual protocolo atribui IP automaticamente?",["DHCP","SMTP","SSH","ICMP"],0]
];

const CHALLENGE_QUESTIONS = [
  ["Linux","Qual comando mostra o diretório atual?",["pwd","rm","mkdir","touch"],0],
  ["Redes","Qual dispositivo encaminha pacotes entre redes?",["Roteador","Monitor","Teclado","Hub USB"],0],
  ["Segurança","Qual recurso adiciona uma segunda etapa de autenticação?",["MFA","FTP","NAT","DNS"],0],
  ["Cisco","Qual protocolo é usado para administração remota segura?",["SSH","Telnet","FTP","HTTP"],0],
  ["IA","Qual área permite que sistemas aprendam com dados?",["Aprendizado de máquina","NAT","DHCP","DNS"],0],
  ["Endpoints","Um computador corporativo conectado à rede é um:",["Endpoint","Gateway","DNS","Switch"],0]
];

const AVATARS=["🛡️ Guardião Endpoint","🧙 Maga da Criptografia","⚡ Guardião Cisco","🐧 Sentinela Linux","🤖 Sentinela IA","🧭 Guardiã Zero Trust"];
const AVATAR_META={"🛡️ Guardião Endpoint":{icon:"🛡️",className:"avatar-knight",tag:"ENDPOINT"},"🧙 Maga da Criptografia":{icon:"🧙",className:"avatar-mage",tag:"CRIPTOGRAFIA"},"⚡ Guardião Cisco":{icon:"⚡",className:"avatar-cisco",tag:"CISCO"},"🐧 Sentinela Linux":{icon:"🐧",className:"avatar-linux",tag:"LINUX"},"🤖 Sentinela IA":{icon:"🤖",className:"avatar-ai",tag:"IA"},"🧭 Guardiã Zero Trust":{icon:"🧭",className:"avatar-zero",tag:"ZERO TRUST"}};
const BADGES=["🧱 Guardião Firewall","🐧 Explorador Linux","🌐 Especialista Cisco","✨ Investigador IA","🛡️ Defensor Zero Trust","🔐 Mestre da Criptografia"];

const RUIN_COLLIDERS=[
  {x:8,y:12,w:24,h:3},{x:8,y:12,w:3,h:25},{x:29,y:12,w:3,h:25},{x:8,y:34,w:10,h:3},{x:24,y:34,w:8,h:3},
  {x:68,y:12,w:24,h:3},{x:68,y:12,w:3,h:25},{x:89,y:12,w:3,h:25},{x:68,y:34,w:9,h:3},{x:83,y:34,w:9,h:3},
  {x:32,y:63,w:32,h:3},{x:32,y:63,w:3,h:28},{x:61,y:63,w:3,h:28},{x:32,y:88,w:14,h:3},{x:52,y:88,w:12,h:3},
  {x:30,y:25,w:17,h:3},{x:53,y:25,w:17,h:3},{x:74,y:53,w:20,h:3},
  {x:16,y:21,w:7,h:2},{x:16,y:29,w:13,h:2},{x:21,y:21,w:2,h:10},
  {x:76,y:21,w:8,h:2},{x:76,y:29,w:13,h:2},{x:84,y:21,w:2,h:10},
  {x:39,y:70,w:18,h:2},{x:39,y:80,w:18,h:2},{x:47,y:70,w:2,h:12}
];
const RUIN_ZONES=[
  {id:"tower",name:"Torre Norte",x:10,y:14,w:20,h:19},
  {id:"citadel",name:"Cidadela Leste",x:70,y:14,w:20,h:19},
  {id:"underground",name:"Salão Subterrâneo",x:34,y:65,w:26,h:22}
];
const ENCOUNTER_POINTS=[
  {id:"crypt",x:20,y:27,label:"Câmara da Criptografia"},
  {id:"ai",x:80,y:27,label:"Observatório IA"},
  {id:"network",x:48,y:76,label:"Núcleo de Redes"}
];
const state={
  name:"",room:"CASTELO-01",level:1,quizIndex:0,xp:0,score:0,avatar:AVATARS[0],badge:BADGES[0],
  hp:100,position:{x:15,y:82},players:{},turn:null,target:null,channel:null,connected:false,
  challengeIndex:0,challengeRound:0,challengeOver:false,challengeBusy:false,configSaved:false,zone:"campo",lastEncounter:"",botTimer:null
};

const app=document.getElementById("app");
const URL_KEY="cms_supabase_url", KEY_KEY="cms_supabase_key";

function toast(message){
  const el=document.createElement("div"); el.className="toast"; el.textContent=message;
  document.body.appendChild(el); setTimeout(()=>el.remove(),2400);
}
function esc(value){
  return String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
}
function avatarMarkup(name,compact=false){const meta=AVATAR_META[name]||AVATAR_META[AVATARS[0]];return `<div class="avatar-figure ${meta.className} ${compact?"avatar-compact":""}" title="${esc(name)}"><span>${meta.icon}</span><small>${meta.tag}</small></div>`;}
function avatarChoiceMarkup(name){const meta=AVATAR_META[name]||AVATAR_META[AVATARS[0]];return `<button class="avatar-card" data-avatar="${esc(name)}">${avatarMarkup(name)}<b>${esc(name)}</b><span>${meta.tag}</span></button>`;}
function createLocalBots(){if(Object.keys(state.players).length>1)return;state.players["Sentinela Bot"]={name:"Sentinela Bot",avatar:AVATARS[2],badge:BADGES[2],x:78,y:18,hp:100,score:0};state.players["Maga Bot"]={name:"Maga Bot",avatar:AVATARS[1],badge:BADGES[3],x:78,y:80,hp:100,score:0};ensureTurn();}
function scheduleBotTurn(){if(state.connected||state.challengeOver||!state.turn||state.turn===state.name)return;const bot=state.players[state.turn];if(!bot||!bot.name.includes("Bot"))return;setTimeout(()=>{if(state.challengeOver||state.turn!==bot.name)return;const enemies=Object.values(state.players).filter(p=>p.name!==bot.name&&(p.hp??100)>0);if(!enemies.length)return;const target=enemies.sort((a,b)=>(a.hp??100)-(b.hp??100))[0];if(Math.random()<0.72){target.hp=Math.max(0,target.hp-20);bot.score+=100;if(target.hp===0)bot.score+=200;toast("🤖 "+bot.name+" acertou o desafio.");}else toast("🤖 "+bot.name+" errou o desafio.");advanceTurn();renderArenaState();},900);}
function supabaseConfig(){
  return {
    url:localStorage.getItem(URL_KEY)||window.CYBERMEDIEVAL_SUPABASE_URL||"",
    key:localStorage.getItem(KEY_KEY)||window.CYBERMEDIEVAL_SUPABASE_KEY||""
  };
}

function renderLobby(){
  const cfg=supabaseConfig();
  app.innerHTML=`
  <main class="screen"><div class="shell hero">
    <section class="panel hero-main">
      <div class="brand">⚔ CYBERMEDIEVAL SHIELD</div>
      <h1 class="title">Defenda o Reino.<br>Domine a Tecnologia.</h1>
      <p class="subtitle">Uma jornada educativa cyberpunk por IA, redes, Linux, segurança, vulnerabilidades, endpoints e Cisco.</p>
      <div class="feature-grid">
        <div>🧠<b>IA & Dados</b><span>Desafios de raciocínio</span></div>
        <div>🌐<b>Redes & Cisco</b><span>Protocolos e infraestrutura</span></div>
        <div>🐧<b>Linux</b><span>Comandos e administração</span></div>
        <div>🛡️<b>Cybersecurity</b><span>Defesa e vulnerabilidades</span></div>
      </div>
    </section>
    <section class="panel">
      <div class="brand">🏰 LOBBY</div><h2>Entrar no Reino</h2>
      <label>Nome do jogador</label><input id="playerName" placeholder="Digite seu nome" autocomplete="off">
      <label>Código da sala</label><input id="roomCode" value="CASTELO-01" autocomplete="off">
      <button id="startGame" class="primary full">Entrar na aventura</button><button id="demoGame" class="secondary full">▶ Testar demonstração</button>
      <p class="small">Níveis 1–5: Academia • Níveis 6–10: Arena multiplayer</p>
      <details class="config"><summary>⚙ Configurar Supabase Realtime</summary>
        <label>Project URL</label><input id="supabaseUrl" value="${esc(cfg.url)}" placeholder="https://seu-projeto.supabase.co">
        <label>Anon key</label><input id="supabaseKey" value="${esc(cfg.key)}" placeholder="chave anon pública">
        <button id="saveConfig" class="secondary">Salvar configuração</button>
        <p class="small">A chave usada aqui deve ser a anon/publishable key. O jogo também funciona em modo local.</p>
      </details>
    </section>
  </div></main>`;

  document.getElementById("saveConfig").onclick=()=>{
    localStorage.setItem(URL_KEY,document.getElementById("supabaseUrl").value.trim());
    localStorage.setItem(KEY_KEY,document.getElementById("supabaseKey").value.trim());
    state.configSaved=true; toast("✅ Configuração salva neste navegador.");
  };
  document.getElementById("demoGame").onclick=()=>{document.getElementById("playerName").value="Visitante";document.getElementById("roomCode").value="DEMO";document.getElementById("startGame").click()};
  document.getElementById("startGame").onclick=()=>{
    state.name=document.getElementById("playerName").value.trim()||"Jogador";
    state.room=document.getElementById("roomCode").value.trim()||"CASTELO-01";
    state.level=1;state.quizIndex=0;state.score=0;state.xp=0;state.hp=100;
    state.position={x:15,y:82};state.target=null;state.challengeOver=false;state.challengeBusy=false;state.zone="campo";state.lastEncounter="";
    renderQuiz();
  };
}

function renderQuiz(){
  const q=QUESTIONS[state.quizIndex%QUESTIONS.length];
  app.innerHTML=`
  <main class="screen"><div class="shell">
    <div class="topbar"><div><div class="brand">ACADEMIA CYBERMEDIEVAL</div><h2>Nível ${state.level} · ${q[0]}</h2></div><span class="pill">XP ${state.xp} · ⭐ ${state.score}</span></div>
    <section class="panel">
      <div class="progress"><span style="width:${state.level*20}%"></span></div>
      <p class="small">Desafio ${state.level}/5</p><h2>${esc(q[1])}</h2>
      <div class="choices">${q[2].map((a,i)=>`<button class="choice" data-answer="${i}">${esc(a)}</button>`).join("")}</div>
    </section>
    <section class="panel compact"><div class="grid">
      <div class="card avatar-mini">${avatarMarkup(state.avatar,true)}</div><div class="card">🛡️ ${esc(state.badge)}</div><div class="card">🏆 ${state.score} pontos</div>
    </div></section>
  </div></main>`;
  document.querySelectorAll("[data-answer]").forEach(btn=>btn.onclick=()=>answer(Number(btn.dataset.answer),q));
}

function answer(index,q){
  document.querySelectorAll("[data-answer]").forEach(b=>b.disabled=true);
  if(index===q[3]){
    state.score+=100;state.xp+=50;toast("⚡ Acerto! +100 pontos");
    if(state.level<5){state.level++;setTimeout(renderReward,450);}
    else{state.level=6;setTimeout(renderArena,500);}
  }else{
    toast("🛡️ Resposta incorreta. Tente novamente.");
    setTimeout(()=>{state.quizIndex++;renderQuiz();},800);
  }
}

function renderReward(){
  app.innerHTML=`
  <main class="screen"><div class="shell reward"><section class="panel">
    <div class="brand">✨ RECOMPENSA DESBLOQUEADA</div><h1>Nível ${state.level}</h1>
    <p class="subtitle">Escolha seu avatar e insígnia digital antes do próximo desafio.</p>
    <h3>Avatar desbloqueado</h3><div class="avatar-grid">${AVATARS.map(a=>avatarChoiceMarkup(a)).join("")}</div>
    <h3>Insígnia digital</h3><div class="choices">${BADGES.map(w=>`<button class="choice badgeChoice">${w}</button>`).join("")}</div>
    <button id="continueGame" class="primary" style="margin-top:16px">Continuar →</button>
  </section></div></main>`;
  document.querySelectorAll(".avatar-card").forEach(b=>b.onclick=()=>{state.avatar=b.dataset.avatar;document.querySelectorAll(".avatar-card").forEach(x=>x.classList.remove("selected"));b.classList.add("selected");toast("Avatar escolhido.")});
  document.querySelectorAll(".badgeChoice").forEach(b=>b.onclick=()=>{state.badge=b.textContent;toast("Insígnia digital escolhido.")});
  document.getElementById("continueGame").onclick=()=>{state.quizIndex++;renderQuiz()};
}

function localPlayer(){
  return {name:state.name,score:state.score,hp:state.hp,x:state.position.x,y:state.position.y,avatar:state.avatar,badge:state.badge};
}
function normalizePlayers(){
  const list=Object.values(state.players).filter(p=>p&&p.name).slice(0,6);
  list.forEach(p=>{p.hp=Math.max(0,Math.min(100,Number(p.hp??100)));p.score=Number(p.score??0);});
  state.players=Object.fromEntries(list.map(p=>[p.name,p]));
}
function aliveNames(){return Object.values(state.players).filter(p=>(p.hp??100)>0).map(p=>p.name).sort();}
function ensureTurn(){
  const alive=aliveNames();
  if(!alive.length){state.turn=null;return;}
  if(!state.turn||!alive.includes(state.turn))state.turn=alive[0];
}
function isMyTurn(){return state.turn===state.name;}

function renderArena(){
  state.level=6;state.challengeOver=false;state.challengeIndex=0;state.challengeRound=0;state.target=null;state.challengeBusy=false;
  state.players={[state.name]:localPlayer()};state.turn=state.name;
  app.innerHTML=`
  <main class="screen"><div class="shell">
    <div class="topbar"><div><div class="brand">🏟 ARENA CYBERMEDIEVAL</div><h2 id="arenaTitle">Nível ${state.level} · Desafio de conhecimento</h2></div><span class="pill" id="connectionStatus">🟡 Local</span></div>
    <div class="hud">
      <span class="pill">👥 <b id="playerCount">1</b>/6</span><span class="pill">❤️ HP <b id="hpValue">100</b>/100</span>
      <span class="pill">⭐ <b id="scoreValue">${state.score}</b></span><span class="pill">🎯 Turno: <b id="turnValue">${esc(state.turn)}</b></span>
    </div>
    <div class="arena battlefield" id="battlefield">
      <div class="ruin ruin-a"><div class="ruin-title">🏰 TORRE NORTE</div><div class="ruin-floor"></div><div class="ruin-room room-a1">CÂMARA DA CRIPTOGRAFIA</div><div class="ruin-corridor corridor-a"></div><button class="ruin-door" onclick="enterRuin('tower')">ENTRADA · ENTRAR</button><i class="crack cr1"></i><i class="crack cr2"></i></div>
      <div class="ruin ruin-b"><div class="ruin-title">🏰 CIDADELA LESTE</div><div class="ruin-floor"></div><div class="ruin-room room-b1">OBSERVATÓRIO IA</div><div class="ruin-corridor corridor-b"></div><button class="ruin-door" onclick="enterRuin('citadel')">ENTRADA · ENTRAR</button><i class="crack cr3"></i><i class="crack cr4"></i></div>
      <div class="ruin ruin-c"><div class="ruin-title">🏰 SALÃO SUBTERRÂNEO</div><div class="ruin-floor"></div><div class="ruin-room room-c1">NÚCLEO DE REDES</div><div class="ruin-corridor corridor-c"></div><button class="ruin-door" onclick="enterRuin('underground')">ENTRADA · ENTRAR</button><i class="crack cr5"></i></div>
      <div class="encounter-point ep-a" title="Câmara da Criptografia">✦</div><div class="encounter-point ep-b" title="Observatório IA">✦</div><div class="encounter-point ep-c" title="Núcleo de Redes">✦</div>
      <div class="wall w1"></div><div class="wall w2"></div>
      <div class="map-sign">🧭 Explore as ruínas · descubra as salas de aprendizagem</div><div class="exploration-hint" id="explorationHint">📍 Pátio central · escolha uma ruína para começar</div>
      <div class="healer">🧙‍♀️<small>CURANDEIRA</small></div>
      <div class="player selected" id="me">${avatarMarkup(state.avatar,true)}</div><div id="remotePlayers"></div>
    </div>
    <section class="panel battle-panel">
      <div class="arena-actions"><div><b>Movimentação</b><div class="small">WASD ou setas. A Curandeira recupera HP quando você se aproxima.</div></div>
      <div class="move-pad"><button onclick="movePlayer(0,-5)">↑</button><button onclick="movePlayer(-5,0)">←</button><button onclick="movePlayer(0,5)">↓</button><button onclick="movePlayer(5,0)">→</button></div></div>
      <h3>🎯 Alvo</h3><div id="targets" class="choices"></div>
      <div id="challengeQuestion"></div>
    </section>
    <section class="panel battle-panel"><h3>🏆 Ranking da sala</h3><div id="leaderboard"></div></section>
  </div></main>`;
  renderArenaState();bindMovement();connectRealtime();
}

function renderArenaState(){
  normalizePlayers();ensureTurn();
  const count=Object.keys(state.players).length;
  const set=(id,value)=>{const e=document.getElementById(id);if(e)e.textContent=value};const title=document.getElementById("arenaTitle");if(title)title.textContent="Nível "+state.level+" · Desafio de conhecimento";
  set("playerCount",count);set("hpValue",state.hp);set("scoreValue",state.score);set("turnValue",state.turn||"—");
  const me=document.getElementById("me");
  if(me){me.style.left=state.position.x+"%";me.style.top=state.position.y+"%";me.style.bottom="auto";}
  const remote=document.getElementById("remotePlayers");
  if(remote)remote.innerHTML=Object.values(state.players).filter(p=>p.name!==state.name&&(p.hp??100)>0).map(p=>`<button class="player remote ${state.target===p.name?"targeted":""}" style="left:${p.x||50}%;top:${p.y||50}%" onclick="selectTarget('${esc(p.name)}')">${avatarMarkup(p.avatar||AVATARS[0],true)}</button>`).join("");
  const targets=document.getElementById("targets");
  if(targets){
    const enemies=Object.values(state.players).filter(p=>p.name!==state.name&&(p.hp??100)>0);
    targets.innerHTML=enemies.length?enemies.map(p=>`<button class="choice ${state.target===p.name?"targeted":""}" onclick="selectTarget('${esc(p.name)}')">🎯 ${esc(p.name)} · ❤️ ${p.hp}</button>`).join(""):'<div class="small">Aguardando outros jogadores na sala...</div>';
  }
  const board=document.getElementById("leaderboard");
  if(board){
    board.innerHTML=Object.values(state.players).sort((a,b)=>b.score-a.score).map((p,i)=>`<div class="card">#${i+1} <b>${esc(p.name)}</b> · ⭐ ${p.score} · ❤️ ${p.hp}</div>`).join("");
  }
  renderChallenge();
}

function renderChallenge(){
  const box=document.getElementById("challengeQuestion");if(!box)return;
  const q=CHALLENGE_QUESTIONS[state.challengeIndex%CHALLENGE_QUESTIONS.length];
  const myTurn=isMyTurn()&&!state.challengeOver;
  const canAttack=myTurn&&!!state.target&&!state.challengeBusy;
  box.innerHTML=`<h3>🧠 ${esc(q[0])} · ${myTurn?"SEU TURNO":"Aguardando "+esc(state.turn||"jogador")}</h3>
    <p>${esc(q[1])}</p><div class="choices">${q[2].map((a,i)=>`<button class="choice battleAnswer" ${canAttack?"":"disabled"} onclick="resolveChallenge(${i})">${esc(a)}</button>`).join("")}</div>
    <p class="small">${state.target?"Alvo: "+esc(state.target):"Selecione um colega para desafiar."} · Acerto: -25 HP e +150 pontos · Erro: turno passa</p>`;
}

function selectTarget(name){
  if(state.players[name]&&(state.players[name].hp??100)>0){state.target=name;toast("🎯 Alvo: "+name);renderArenaState();}
}
window.selectTarget=selectTarget;

function collidesWithRuins(x,y){
  const radius=1.4;
  return RUIN_COLLIDERS.some(r=>{
    const nearestX=Math.max(r.x,Math.min(x,r.x+r.w));
    const nearestY=Math.max(r.y,Math.min(y,r.y+r.h));
    return Math.hypot(x-nearestX,y-nearestY)<radius;
  });
}
function canUseRuinDoor(fromX,fromY,toX,toY){
  const doors=[
    {x1:15,x2:27,y:37},
    {x1:73,x2:87,y:37},
    {x1:42,x2:54,y:63}
  ];
  return doors.some(d=>{
    const crossed=(fromY<d.y&&toY>=d.y)||(fromY>d.y&&toY<=d.y);
    if(!crossed)return false;
    const dy=toY-fromY;
    const t=Math.abs(dy)>0.001?(d.y-fromY)/dy:0;
    const crossX=fromX+(toX-fromX)*t;
    return crossX>=d.x1-1.5&&crossX<=d.x2+1.5;
  });
}
function enterRuin(id){
  const entries={
    tower:{x:20,y:27,label:"🏰 Torre Norte"},
    citadel:{x:80,y:27,label:"🏰 Cidadela Leste"},
    underground:{x:48,y:76,label:"🏰 Salão Subterrâneo"}
  };
  const entry=entries[id];
  if(!entry||state.challengeOver)return;
  state.position={x:entry.x,y:entry.y};
  state.zone=id;
  state.lastEncounter="";
  const hint=document.getElementById("explorationHint"); if(hint) hint.textContent="📍 "+entry.label+" · sala de aprendizagem";
  toast("🚪 Você entrou em "+entry.label+"!");
  syncSelf();broadcast("player_state",localPlayer());renderArenaState();
}
window.enterRuin=enterRuin;

function getRuinZone(x,y){
  const z=RUIN_ZONES.find(r=>x>r.x&&x<r.x+r.w&&y>r.y&&y<r.y+r.h);
  return z?.id||"campo";
}
function checkExploration(){
  const zone=getRuinZone(state.position.x,state.position.y);
  if(zone!==state.zone){
    state.zone=zone;
    const labels={tower:"🏰 Você entrou na Torre Norte.",citadel:"🏰 Você entrou na Cidadela Leste.",underground:"🏰 Você entrou no Salão Subterrâneo.",campo:"🌿 Você voltou ao pátio das ruínas."};
    const hint=document.getElementById("explorationHint"); if(hint) hint.textContent="📍 "+labels[zone].replace("🏰 ","").replace("🌿 ","")+" · exploração ativa"; toast(labels[zone]);
  }
  const encounter=ENCOUNTER_POINTS.find(p=>Math.hypot(state.position.x-p.x,state.position.y-p.y)<5);
  if(encounter&&state.lastEncounter!==encounter.id){
    state.lastEncounter=encounter.id;
    toast("✦ Ponto de encontro: "+encounter.label);
  }
  if(!encounter)state.lastEncounter="";
}
function getDoorTransition(fromX,fromY,toX,toY){
  const doors=[
    {x1:15,x2:27,y:37,insideY:31},
    {x1:73,x2:87,y:37,insideY:31},
    {x1:42,x2:54,y:63,insideY:69}
  ];
  for(const d of doors){
    const crossed=(fromY<d.y&&toY>=d.y)||(fromY>d.y&&toY<=d.y);
    if(!crossed)continue;
    const dy=toY-fromY;
    const t=Math.abs(dy)>0.001?(d.y-fromY)/dy:0;
    const crossX=fromX+(toX-fromX)*t;
    if(crossX>=d.x1&&crossX<=d.x2){
      return {x:Math.max(d.x1+2,Math.min(d.x2-2,toX)),y:d.insideY};
    }
  }
  return null;
}
function movePlayer(dx,dy){
  if(state.challengeOver)return;
  let nx=Math.max(5,Math.min(95,state.position.x+dx));
  let ny=Math.max(5,Math.min(95,state.position.y+dy));
  const door=getDoorTransition(state.position.x,state.position.y,nx,ny);
  if(door){
    nx=door.x;ny=door.y;
    toast("🚪 Entrada encontrada! Você entrou na ruína.");
  }else if(collidesWithRuins(nx,ny)){
    toast("🏚️ Muro bloqueado. Procure a entrada dourada da ruína.");
    return;
  }
  state.position.x=nx;state.position.y=ny;
  if(Math.hypot(state.position.x-50,state.position.y-45)<12&&state.hp<100){state.hp=Math.min(100,state.hp+20);toast("🧙‍♀️ Curandeira restaurou +20 HP");}
  checkExploration();
  syncSelf();broadcast("player_state",localPlayer());renderArenaState();
}
window.movePlayer=movePlayer;

function advanceTurn(){
  const alive=aliveNames();
  if(alive.length<=1){state.challengeOver=true;state.turn=alive[0]||null;return;}
  const current=alive.indexOf(state.turn);state.turn=alive[(current+1+alive.length)%alive.length];
  state.challengeIndex=(state.challengeIndex+1)%CHALLENGE_QUESTIONS.length;if(state.challengeIndex===0&&state.level<10){state.level++;state.challengeRound++;toast("⬆️ Nível "+state.level+" desbloqueado!");}state.target=null;
  if(!state.connected)scheduleBotTurn();
}
function resolveChallenge(answerIndex){
  if(state.challengeOver||!isMyTurn()||!state.target||state.challengeBusy)return;
  const q=CHALLENGE_QUESTIONS[state.challengeIndex%CHALLENGE_QUESTIONS.length];
  const target=state.players[state.target];if(!target||target.hp<=0){state.target=null;renderArenaState();return;}
  state.challengeBusy=true;
  if(answerIndex===q[3]){
    state.score+=150;target.hp=Math.max(0,target.hp-25);toast("⚡ Acerto! -25 HP e +150 pontos.");
    if(target.hp===0){state.score+=250;toast("🏆 Colega derrotado! +250 pontos.");}
  }else toast("🧠 Resposta incorreta. O turno passa.");
  syncSelf();broadcast("battle_state",{players:state.players,turn:state.turn,target:state.target,challengeIndex:state.challengeIndex,level:state.level});
  setTimeout(()=>{
    if(!state.challengeOver){
      advanceTurn();
      state.challengeBusy=false;
      syncSelf();
      broadcast("battle_state",{players:state.players,turn:state.turn,target:null,challengeIndex:state.challengeIndex,level:state.level,challengeOver:state.challengeOver});
      renderArenaState();
    } else {
      state.challengeBusy=false;
      syncSelf();
      broadcast("battle_state",{players:state.players,turn:state.turn,target:null,challengeIndex:state.challengeIndex,challengeOver:true});
      renderArenaState();
      toast("🏆 Desafio concluído!");
    }
  },700);
}
window.resolveChallenge=resolveChallenge;

function syncSelf(){
  state.players[state.name]=localPlayer();
}
function broadcast(event,payload){
  if(!state.channel)return;
  state.channel.send({type:"broadcast",event,payload}).catch(e=>console.warn("Realtime:",e));
}

async function connectRealtime(){
  const cfg=supabaseConfig();
  if(!cfg.url||!cfg.key||!window.supabase){createLocalBots();toast("🟡 Arena local ativada: 2 sentinelas controladas pela IA.");renderArenaState();scheduleBotTurn();return;}
  try{
    state.channel=window.supabase.channel("cybermedieval:"+state.room,{config:{presence:{key:state.name},broadcast:{self:false}}});
    state.channel.on("presence",{event:"sync"},()=>{
      const presence=state.channel.presenceState();
      const next={...state.players};
      Object.values(presence).flat().forEach(p=>{
        if(p.name&&p.name!==state.name)next[p.name]={...(next[p.name]||{}),...p};
      });
      next[state.name]={...(next[state.name]||{}),...localPlayer()};
      state.players=Object.fromEntries(Object.values(next).slice(0,6).map(p=>[p.name,p]));
      ensureTurn();renderArenaState();
    });
    state.channel.on("broadcast",{event:"player_state"},({payload})=>{
      if(payload?.name&&payload.name!==state.name){state.players[payload.name]={...(state.players[payload.name]||{}),...payload};renderArenaState();}
    });
    state.channel.on("broadcast",{event:"battle_state"},({payload})=>{
      if(payload?.players){
        const merged={...state.players};
        Object.values(payload.players).forEach(p=>{
          if(p?.name&&p.name!==state.name)merged[p.name]={...(merged[p.name]||{}),...p};
        });
        merged[state.name]=localPlayer();
        state.players=merged;
        if(payload.turn)state.turn=payload.turn;
        if(Number.isInteger(payload.challengeIndex))state.challengeIndex=payload.challengeIndex;if(Number.isInteger(payload.level))state.level=payload.level;
        if(typeof payload.challengeOver==="boolean")state.challengeOver=payload.challengeOver;
        state.target=null;state.challengeBusy=false;renderArenaState();
      }
    });
    state.channel.subscribe(async status=>{
      if(status==="SUBSCRIBED"){
        state.connected=true;
        const statusEl=document.getElementById("connectionStatus");if(statusEl)statusEl.textContent="🟢 Multiplayer conectado";
        await state.channel.track(localPlayer());
        toast("🟢 Você entrou na sala "+state.room);
      }
    });
  }catch(error){console.error(error);toast("🔴 Não foi possível conectar ao Realtime.");}
}

function bindMovement(){
  document.onkeydown=e=>{
    if(["INPUT","TEXTAREA"].includes(document.activeElement?.tagName))return;
    const k=e.key.toLowerCase();
    if(k==="w"||k==="arrowup")movePlayer(0,-5);
    if(k==="s"||k==="arrowdown")movePlayer(0,5);
    if(k==="a"||k==="arrowleft")movePlayer(-5,0);
    if(k==="d"||k==="arrowright")movePlayer(5,0);
  };
}

renderLobby();
})();