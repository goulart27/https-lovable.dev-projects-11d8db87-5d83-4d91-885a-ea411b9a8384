(() => {
"use strict";

const questions = [
  ["IA","Qual técnica permite aprender padrões a partir de exemplos?",["Aprendizado de máquina","NAT","DNS","FTP"],0],
  ["Redes","Qual protocolo traduz nomes de domínio em IP?",["HTTP","DNS","SSH","FTP"],1],
  ["Linux","Qual comando lista arquivos?",["cd","pwd","ls","mkdir"],2],
  ["Segurança","Qual prática reduz o impacto de uma senha comprometida?",["Desativar logs","MFA","Reutilizar senha","Abrir portas"],1],
  ["Cisco","Qual dispositivo encaminha pacotes entre redes?",["Switch","Roteador","Hub","Access Point"],1],
  ["Vulnerabilidades","O que é uma vulnerabilidade?",["Fraqueza explorável","Backup","Antivírus","Usuário"],0],
  ["Endpoints","Um notebook corporativo conectado é um:",["Endpoint","DNS","Gateway","Firewall"],0],
  ["Linux","Qual comando mostra o diretório atual?",["pwd","grep","touch","rm"],0],
  ["Cisco","Qual protocolo permite administração remota segura?",["Telnet","SSH","FTP","HTTP"],1],
  ["IA","Um sistema que classifica spam é exemplo de:",["Classificação","NAT","Criptografia","Roteamento"],0]
];

const avatars=["🛡️ Cavaleiro Endpoint","🧙 Maga da Criptografia","⚡ Guardião Cisco","🐧 Hacker Linux","🤖 Sentinela IA"];
const weapons=["⚔️ Espada Firewall","🏹 Arco do Linux","🔱 Lança Cisco","🪄 Cajado IA","🛡️ Escudo Zero Trust"];

const state={
  name:"",room:"CASTELO-01",level:1,questionIndex:0,xp:0,score:0,
  avatar:avatars[0],weapon:weapons[0],hp:100,players:{},turn:null,
  position:{x:15,y:82},target:null,channel:null,battleOver:false
};

const app=document.getElementById("app");
const CONFIG_KEY_URL="cms_supabase_url"; const CONFIG_KEY_ANON="cms_supabase_key";

function toast(message){
  const el=document.createElement("div");
  el.className="toast"; el.textContent=message;
  document.body.appendChild(el);
  setTimeout(()=>el.remove(),2200);
}

function renderLobby(){
  app.innerHTML=`
  <main class="screen"><div class="shell hero">
    <section class="panel">
      <div class="brand">⚔ CYBERMEDIEVAL SHIELD</div>
      <h1 class="title">Defenda o Reino.<br>Domine a Tecnologia.</h1>
      <p class="subtitle">Uma jornada educativa cyberpunk por IA, redes, Linux, segurança, vulnerabilidades, endpoints e Cisco.</p>
      <div class="grid">
        <div class="stat"><b>10</b>Níveis</div>
        <div class="stat"><b>6</b>Jogadores</div>
        <div class="stat"><b>∞</b>Desafios</div>
      </div>
    </section>
    <section class="panel">
      <h2>🏰 Entrar no Reino</h2>
      <label for="playerName">Nome do jogador</label>
      <input id="playerName" placeholder="Digite seu nome" autocomplete="off">
      <label for="roomCode">Código da sala</label>
      <input id="roomCode" value="CASTELO-01" autocomplete="off">
      <button id="startGame" style="width:100%;margin-top:14px">Entrar na aventura</button>
      <p class="small">Níveis 1–5: Academia • Níveis 6–10: Arena</p>
    </section>
  </div></main>`;

  document.getElementById("startGame").onclick=()=>{
    state.name=document.getElementById("playerName").value.trim()||"Jogador";
    state.room=document.getElementById("roomCode").value.trim()||"CASTELO-01";
    state.level=1; state.questionIndex=0; state.score=0; state.xp=0;
    state.hp=100; state.position={x:15,y:82};
    renderQuiz();
  };
}

function renderQuiz(){
  const q=questions[state.questionIndex % questions.length];
  app.innerHTML=`
  <main class="screen"><div class="shell">
    <div class="topbar">
      <div><div class="brand">ACADEMIA CYBERMEDIEVAL</div><h2>Nível ${state.level} · ${q[0]}</h2></div>
      <span class="pill">XP ${state.xp} · ⭐ ${state.score}</span>
    </div>
    <section class="panel">
      <p class="small">Desafio ${state.level}/5</p>
      <h2>${q[1]}</h2>
      <div class="choices">${q[2].map((a,i)=>`<button class="choice" data-answer="${i}">${a}</button>`).join("")}</div>
    </section>
    <section class="panel" style="margin-top:14px">
      <div class="grid">
        <div class="card">🧙 ${state.avatar}</div>
        <div class="card">⚔️ ${state.weapon}</div>
        <div class="card">🏆 ${state.score} pontos</div>
      </div>
    </section>
  </div></main>`;

  document.querySelectorAll("[data-answer]").forEach(btn=>{
    btn.onclick=()=>answer(Number(btn.dataset.answer),q);
  });
}

function answer(index,q){
  document.querySelectorAll("[data-answer]").forEach(b=>b.disabled=true);
  if(index===q[3]){
    state.score+=100; state.xp+=50;
    toast("⚡ Acerto! +100 pontos");
    if(state.level<5){
      state.level++;
      setTimeout(renderReward,500);
    }else{
      state.level=6;
      setTimeout(renderArena,600);
    }
  }else{
    toast("🛡️ Resposta incorreta. Tente novamente.");
    setTimeout(()=>{state.questionIndex++;renderQuiz();},900);
  }
}

function renderReward(){
  app.innerHTML=`
  <main class="screen"><div class="shell"><section class="panel">
    <div class="brand">✨ RECOMPENSA</div>
    <h1>Nível ${state.level}</h1>
    <p class="subtitle">Escolha seu avatar e equipamento.</p>
    <h3>Avatar</h3>
    <div class="choices">${avatars.map(a=>`<button class="choice avatarChoice">${a}</button>`).join("")}</div>
    <h3>Equipamento</h3>
    <div class="choices">${weapons.map(w=>`<button class="choice weaponChoice">${w}</button>`).join("")}</div>
    <button id="continueGame" style="margin-top:16px">Continuar →</button>
  </section></div></main>`;

  document.querySelectorAll(".avatarChoice").forEach(b=>b.onclick=()=>{state.avatar=b.textContent;toast("Avatar escolhido.")});
  document.querySelectorAll(".weaponChoice").forEach(b=>b.onclick=()=>{state.weapon=b.textContent;toast("Equipamento escolhido.")});
  document.getElementById("continueGame").onclick=()=>{state.questionIndex++;renderQuiz()};
}

function renderArena(){
  state.battleOver=false;
  state.turn=state.name;
  state.players={[state.name]:{name:state.name,score:state.score,hp:state.hp,x:state.position.x,y:state.position.y}};

  app.innerHTML=`
  <main class="screen"><div class="shell">
    <div class="topbar">
      <div><div class="brand">🏟 ARENA CYBERMEDIEVAL</div><h2>Nível 6 · Arena de aprendizagem</h2></div>
      <span class="pill" id="playerCount">👥 1/6 jogadores</span>
    </div>
    <div class="hud">
      <span class="pill">❤️ HP <b id="hpValue">${state.hp}</b>/100</span>
      <span class="pill">⚔️ ${state.weapon}</span>
      <span class="pill">⭐ ${state.score}</span>
      <span class="pill">🎯 Turno: <b id="turnValue">${state.turn}</b></span>
    </div>
    <div class="arena" id="battlefield">
      <div class="castle c1"></div><div class="castle c2"></div>
      <div class="healer">🧙‍♀️<div class="small">Curandeira</div></div>
      <div class="player selected" id="me">🛡️</div>
      <div id="remotePlayers"></div>
    </div>
    <section class="panel" style="margin-top:14px">
      <p class="small">Use WASD, setas ou os botões para movimentar seu personagem.</p>
      <div class="choices">
        <button class="choice" onclick="window.movePlayer(0,-5)">⬆️ Mover</button>
        <button class="choice" onclick="window.movePlayer(0,5)">⬇️ Mover</button>
        <button class="choice" onclick="window.movePlayer(-5,0)">⬅️ Mover</button>
        <button class="choice" onclick="window.movePlayer(5,0)">➡️ Mover</button>
      </div>
      <h3>🎯 Escolha o adversário</h3>
      <div id="targets" class="choices"><div class="small">No modo local, a arena começa com você.</div></div>
      <h3>🧠 Pergunta de batalha</h3>
      <p>Qual comando Linux mostra o diretório atual?</p>
      <div class="choices">
        <button class="choice" onclick="window.battle(true)">pwd — Resposta correta</button>
        <button class="choice" onclick="window.battle(false)">rm</button>
        <button class="choice" onclick="window.battle(false)">mkdir</button>
        <button class="choice" onclick="window.battle(false)">touch</button>
      </div>
    </section>
    <section class="panel" style="margin-top:14px"><h3>🏆 Ranking</h3><div id="leaderboard"></div></section>
  </div></main>`;

  renderArenaState();
  bindMovement();
  connectRealtime();
}

function renderArenaState(){
  const count=Object.keys(state.players).length;
  const countEl=document.getElementById("playerCount");
  if(countEl) countEl.textContent="👥 "+count+"/6 jogadores";
  const turnEl=document.getElementById("turnValue");
  if(turnEl) turnEl.textContent=state.turn||state.name;
  const hpEl=document.getElementById("hpValue");
  if(hpEl) hpEl.textContent=state.hp;

  const me=document.getElementById("me");
  if(me){
    me.style.left=state.position.x+"%";
    me.style.top=state.position.y+"%";
    me.style.bottom="auto";
  }

  const board=document.getElementById("leaderboard");
  if(board){
    board.innerHTML=Object.values(state.players).sort((a,b)=>(b.score||0)-(a.score||0))
      .map((p,i)=>`<div class="card">${i+1}º ${p.name} · ⭐ ${p.score||0} · ❤️ ${p.hp??100}</div>`).join("");
  }

  const targets=document.getElementById("targets");
  if(targets){
    const enemies=Object.values(state.players).filter(p=>p.name!==state.name&&(p.hp??100)>0);
    targets.innerHTML=enemies.length
      ? enemies.map(p=>`<button class="choice" onclick="window.selectTarget('${String(p.name).replace(/'/g,"\\'")}')">🎯 ${p.name} · ❤️ ${p.hp??100}</button>`).join("")
      : '<div class="small">Aguardando outros jogadores na sala...</div>';
  }

  const remote=document.getElementById("remotePlayers");
  if(remote){
    remote.innerHTML=Object.values(state.players).filter(p=>p.name!==state.name)
      .map(p=>`<button class="player remote" style="left:${p.x||50}%;top:${p.y||50}%" onclick="window.selectTarget('${String(p.name).replace(/'/g,"\\'")}')">⚡</button>`).join("");
  }
}

window.selectTarget=(name)=>{
  if(state.players[name]){state.target=name;toast("🎯 Alvo selecionado: "+name);renderArenaState();}
};

window.movePlayer=(dx,dy)=>{
  if(state.battleOver)return;
  state.position.x=Math.max(5,Math.min(95,state.position.x+dx));
  state.position.y=Math.max(5,Math.min(95,state.position.y+dy));
  const distance=Math.hypot(state.position.x-50,state.position.y-45);
  if(distance<12 && state.hp<100){state.hp=Math.min(100,state.hp+20);toast("🧙‍♀️ Curandeira restaurou +20 HP");}
  renderArenaState();
  broadcastMove();
};

window.battle=(correct)=>{
  if(state.battleOver)return;
  if(!state.target){toast("🎯 Selecione um adversário quando houver outro jogador na sala.");return;}
  if(correct){state.score+=150;toast("⚡ Resposta correta! +150 pontos.");}
  else toast("🧠 Resposta incorreta. O turno passa.");
  renderArenaState();
};

function bindMovement(){
  document.onkeydown=(event)=>{
    const key=event.key.toLowerCase();
    if(["arrowup","w"].includes(key))window.movePlayer(0,-5);
    if(["arrowdown","s"].includes(key))window.movePlayer(0,5);
    if(["arrowleft","a"].includes(key))window.movePlayer(-5,0);
    if(["arrowright","d"].includes(key))window.movePlayer(5,0);
  };
}

async function connectRealtime(){
  const URL=localStorage.getItem(CONFIG_KEY_URL)||window.CYBERMEDIEVAL_SUPABASE_URL||"";
  const KEY=localStorage.getItem(CONFIG_KEY_ANON)||window.CYBERMEDIEVAL_SUPABASE_KEY||"";
  if(!URL||!KEY||!window.supabase){toast("🟡 Modo local: configure o Supabase no lobby para ativar o multiplayer.");return;}

  try{
    state.channel=window.supabase.channel("cybermedieval:"+state.room,{config:{presence:{key:state.name}}});
    state.channel.on("presence",{event:"sync"},()=>{
      const presence=state.channel.presenceState();
      state.players={};
      Object.values(presence).flat().forEach(p=>{if(p.name)state.players[p.name]=p;});
      const names=Object.keys(state.players).sort();
      state.turn=state.turn&&names.includes(state.turn)?state.turn:(names[0]||state.name);
      renderArenaState();
    });
    state.channel.on("broadcast",{event:"move"},({payload})=>{
      if(payload?.name&&payload.name!==state.name){
        state.players[payload.name]={...(state.players[payload.name]||{}),...payload};
        renderArenaState();
      }
    });
    state.channel.subscribe(async status=>{
      if(status==="SUBSCRIBED"){
        await state.channel.track({name:state.name,score:state.score,hp:state.hp,x:state.position.x,y:state.position.y});
      }
    });
  }catch(error){
    console.warn("Realtime indisponível:",error);
  }
}

async function broadcastMove(){
  if(!state.channel)return;
  try{
    await state.channel.send({
      type:"broadcast",event:"move",
      payload:{name:state.name,score:state.score,hp:state.hp,x:state.position.x,y:state.position.y}
    });
  }catch(error){console.warn("Falha ao sincronizar:",error);}
}

window.addEventListener("error",(event)=>{
  console.error(event.error||event.message);
});

renderLobby();
})();