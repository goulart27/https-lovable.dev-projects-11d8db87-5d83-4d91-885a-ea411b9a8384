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

const BATTLE_QUESTIONS = [
  ["Linux","Qual comando mostra o diretório atual?",["pwd","rm","mkdir","touch"],0],
  ["Redes","Qual dispositivo encaminha pacotes entre redes?",["Roteador","Monitor","Teclado","Hub USB"],0],
  ["Segurança","Qual recurso adiciona uma segunda etapa de autenticação?",["MFA","FTP","NAT","DNS"],0],
  ["Cisco","Qual protocolo é usado para administração remota segura?",["SSH","Telnet","FTP","HTTP"],0],
  ["IA","Qual área permite que sistemas aprendam com dados?",["Aprendizado de máquina","NAT","DHCP","DNS"],0],
  ["Endpoints","Um computador corporativo conectado à rede é um:",["Endpoint","Gateway","DNS","Switch"],0]
];

const AVATARS=["🛡️ Cavaleiro Endpoint","🧙 Maga da Criptografia","⚡ Guardião Cisco","🐧 Sentinela Linux","🤖 Sentinela IA","🏹 Arqueiro Zero Trust"];
const WEAPONS=["⚔️ Espada Firewall","🏹 Arco do Linux","🔱 Lança Cisco","🪄 Cajado IA","🛡️ Escudo Zero Trust","🔮 Lâmina Criptográfica"];

const state={
  name:"",room:"CASTELO-01",level:1,quizIndex:0,xp:0,score:0,avatar:AVATARS[0],weapon:WEAPONS[0],
  hp:100,position:{x:15,y:82},players:{},turn:null,target:null,channel:null,connected:false,
  battleIndex:0,battleOver:false,turnBusy:false,configSaved:false
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
      <button id="startGame" class="primary full">Entrar na aventura</button>
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
  document.getElementById("startGame").onclick=()=>{
    state.name=document.getElementById("playerName").value.trim()||"Jogador";
    state.room=document.getElementById("roomCode").value.trim()||"CASTELO-01";
    state.level=1;state.quizIndex=0;state.score=0;state.xp=0;state.hp=100;
    state.position={x:15,y:82};state.target=null;state.battleOver=false;state.turnBusy=false;
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
      <div class="card">🧙 ${esc(state.avatar)}</div><div class="card">⚔️ ${esc(state.weapon)}</div><div class="card">🏆 ${state.score} pontos</div>
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
    <p class="subtitle">Escolha seu avatar e equipamento antes do próximo desafio.</p>
    <h3>Avatar</h3><div class="choices">${AVATARS.map(a=>`<button class="choice avatarChoice">${a}</button>`).join("")}</div>
    <h3>Equipamento</h3><div class="choices">${WEAPONS.map(w=>`<button class="choice weaponChoice">${w}</button>`).join("")}</div>
    <button id="continueGame" class="primary" style="margin-top:16px">Continuar →</button>
  </section></div></main>`;
  document.querySelectorAll(".avatarChoice").forEach(b=>b.onclick=()=>{state.avatar=b.textContent;toast("Avatar escolhido.")});
  document.querySelectorAll(".weaponChoice").forEach(b=>b.onclick=()=>{state.weapon=b.textContent;toast("Equipamento escolhido.")});
  document.getElementById("continueGame").onclick=()=>{state.quizIndex++;renderQuiz()};
}

function localPlayer(){
  return {name:state.name,score:state.score,hp:state.hp,x:state.position.x,y:state.position.y,avatar:state.avatar,weapon:state.weapon};
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
  state.battleOver=false;state.battleIndex=0;state.target=null;state.turnBusy=false;
  state.players={[state.name]:localPlayer()};state.turn=state.name;
  app.innerHTML=`
  <main class="screen"><div class="shell">
    <div class="topbar"><div><div class="brand">🏟 ARENA CYBERMEDIEVAL</div><h2>Níveis 6–10 · Batalha de conhecimento</h2></div><span class="pill" id="connectionStatus">🟡 Local</span></div>
    <div class="hud">
      <span class="pill">👥 <b id="playerCount">1</b>/6</span><span class="pill">❤️ HP <b id="hpValue">100</b>/100</span>
      <span class="pill">⭐ <b id="scoreValue">${state.score}</b></span><span class="pill">🎯 Turno: <b id="turnValue">${esc(state.turn)}</b></span>
    </div>
    <div class="arena battlefield" id="battlefield">
      <div class="castle c1"><span>RUÍNA A</span></div><div class="castle c2"><span>RUÍNA B</span></div>
      <div class="wall w1"></div><div class="wall w2"></div>
      <div class="healer">🧙‍♀️<small>CURANDEIRA</small></div>
      <div class="player selected" id="me">🛡️</div><div id="remotePlayers"></div>
    </div>
    <section class="panel battle-panel">
      <div class="arena-actions"><div><b>Movimentação</b><div class="small">WASD ou setas. A Curandeira recupera HP quando você se aproxima.</div></div>
      <div class="move-pad"><button onclick="movePlayer(0,-5)">↑</button><button onclick="movePlayer(-5,0)">←</button><button onclick="movePlayer(0,5)">↓</button><button onclick="movePlayer(5,0)">→</button></div></div>
      <h3>🎯 Alvo</h3><div id="targets" class="choices"></div>
      <div id="battleQuestion"></div>
    </section>
    <section class="panel battle-panel"><h3>🏆 Ranking da sala</h3><div id="leaderboard"></div></section>
  </div></main>`;
  renderArenaState();bindMovement();connectRealtime();
}

function renderArenaState(){
  normalizePlayers();ensureTurn();
  const count=Object.keys(state.players).length;
  const set=(id,value)=>{const e=document.getElementById(id);if(e)e.textContent=value};
  set("playerCount",count);set("hpValue",state.hp);set("scoreValue",state.score);set("turnValue",state.turn||"—");
  const me=document.getElementById("me");
  if(me){me.style.left=state.position.x+"%";me.style.top=state.position.y+"%";me.style.bottom="auto";}
  const remote=document.getElementById("remotePlayers");
  if(remote)remote.innerHTML=Object.values(state.players).filter(p=>p.name!==state.name&&(p.hp??100)>0).map(p=>`<button class="player remote ${state.target===p.name?"targeted":""}" style="left:${p.x||50}%;top:${p.y||50}%" onclick="selectTarget('${esc(p.name)}')">⚡</button>`).join("");
  const targets=document.getElementById("targets");
  if(targets){
    const enemies=Object.values(state.players).filter(p=>p.name!==state.name&&(p.hp??100)>0);
    targets.innerHTML=enemies.length?enemies.map(p=>`<button class="choice ${state.target===p.name?"targeted":""}" onclick="selectTarget('${esc(p.name)}')">🎯 ${esc(p.name)} · ❤️ ${p.hp}</button>`).join(""):'<div class="small">Aguardando outros jogadores na sala...</div>';
  }
  const board=document.getElementById("leaderboard");
  if(board){
    board.innerHTML=Object.values(state.players).sort((a,b)=>b.score-a.score).map((p,i)=>`<div class="card">#${i+1} <b>${esc(p.name)}</b> · ⭐ ${p.score} · ❤️ ${p.hp}</div>`).join("");
  }
  renderBattleQuestion();
}

function renderBattleQuestion(){
  const box=document.getElementById("battleQuestion");if(!box)return;
  const q=BATTLE_QUESTIONS[state.battleIndex%BATTLE_QUESTIONS.length];
  const myTurn=isMyTurn()&&!state.battleOver;
  const canAttack=myTurn&&!!state.target&&!state.turnBusy;
  box.innerHTML=`<h3>🧠 ${esc(q[0])} · ${myTurn?"SEU TURNO":"Aguardando "+esc(state.turn||"jogador")}</h3>
    <p>${esc(q[1])}</p><div class="choices">${q[2].map((a,i)=>`<button class="choice battleAnswer" ${canAttack?"":"disabled"} onclick="resolveBattle(${i})">${esc(a)}</button>`).join("")}</div>
    <p class="small">${state.target?"Alvo: "+esc(state.target):"Selecione um adversário para atacar."} · Acerto: -25 HP e +150 pontos · Erro: turno passa</p>`;
}

function selectTarget(name){
  if(state.players[name]&&(state.players[name].hp??100)>0){state.target=name;toast("🎯 Alvo: "+name);renderArenaState();}
}
window.selectTarget=selectTarget;

function movePlayer(dx,dy){
  if(state.battleOver)return;
  state.position.x=Math.max(5,Math.min(95,state.position.x+dx));
  state.position.y=Math.max(5,Math.min(95,state.position.y+dy));
  if(Math.hypot(state.position.x-50,state.position.y-45)<12&&state.hp<100){state.hp=Math.min(100,state.hp+20);toast("🧙‍♀️ Curandeira restaurou +20 HP");}
  syncSelf();broadcast("player_state",localPlayer());renderArenaState();
}
window.movePlayer=movePlayer;

function advanceTurn(){
  const alive=aliveNames();
  if(alive.length<=1){state.battleOver=true;state.turn=alive[0]||null;return;}
  const current=alive.indexOf(state.turn);state.turn=alive[(current+1+alive.length)%alive.length];
  state.battleIndex=(state.battleIndex+1)%BATTLE_QUESTIONS.length;state.target=null;
}
function resolveBattle(answerIndex){
  if(state.battleOver||!isMyTurn()||!state.target||state.turnBusy)return;
  const q=BATTLE_QUESTIONS[state.battleIndex%BATTLE_QUESTIONS.length];
  const target=state.players[state.target];if(!target||target.hp<=0){state.target=null;renderArenaState();return;}
  state.turnBusy=true;
  if(answerIndex===q[3]){
    state.score+=150;target.hp=Math.max(0,target.hp-25);toast("⚡ Acerto! -25 HP e +150 pontos.");
    if(target.hp===0){state.score+=250;toast("🏆 Adversário derrotado! +250 pontos.");}
  }else toast("🧠 Resposta incorreta. O turno passa.");
  syncSelf();broadcast("battle_state",{players:state.players,turn:state.turn,target:state.target,battleIndex:state.battleIndex});
  setTimeout(()=>{
    if(!state.battleOver){
      advanceTurn();
      state.turnBusy=false;
      syncSelf();
      broadcast("battle_state",{players:state.players,turn:state.turn,target:null,battleIndex:state.battleIndex,battleOver:state.battleOver});
      renderArenaState();
    } else {
      state.turnBusy=false;
      syncSelf();
      broadcast("battle_state",{players:state.players,turn:state.turn,target:null,battleIndex:state.battleIndex,battleOver:true});
      renderArenaState();
      toast("🏆 Batalha encerrada!");
    }
  },700);
}
window.resolveBattle=resolveBattle;

function syncSelf(){
  state.players[state.name]=localPlayer();
}
function broadcast(event,payload){
  if(!state.channel)return;
  state.channel.send({type:"broadcast",event,payload}).catch(e=>console.warn("Realtime:",e));
}

async function connectRealtime(){
  const cfg=supabaseConfig();
  if(!cfg.url||!cfg.key||!window.supabase){toast("🟡 Modo local. Configure o Supabase no lobby para multiplayer.");return;}
  try{
    state.channel=window.supabase.channel("cybermedieval:"+state.room,{config:{presence:{key:state.name},broadcast:{self:false}}});
    state.channel.on("presence",{event:"sync"},()=>{
      const presence=state.channel.presenceState();
      const next={...state.players};
      Object.values(presence).flat().forEach(p=>{if(p.name)next[p.name]={...(next[p.name]||{}),...p};});
      next[state.name]={...(next[state.name]||{}),...localPlayer()};
      state.players=Object.fromEntries(Object.values(next).slice(0,6).map(p=>[p.name,p]));
      ensureTurn();renderArenaState();
    });
    state.channel.on("broadcast",{event:"player_state"},({payload})=>{
      if(payload?.name&&payload.name!==state.name){state.players[payload.name]={...(state.players[payload.name]||{}),...payload};renderArenaState();}
    });
    state.channel.on("broadcast",{event:"battle_state"},({payload})=>{
      if(payload?.players){
        const merged={...state.players,...payload.players};state.players=merged;
        if(payload.turn)state.turn=payload.turn;
        if(Number.isInteger(payload.battleIndex))state.battleIndex=payload.battleIndex;
        if(typeof payload.battleOver==="boolean")state.battleOver=payload.battleOver;
        state.target=null;state.turnBusy=false;renderArenaState();
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