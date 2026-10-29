(() => {
const $ = id => document.getElementById(id);
const SUITS = [{s:'♠',red:false},{s:'♥',red:true},{s:'♦',red:true},{s:'♣',red:false}];
const RANKS = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
let deck=[], hands=[[],[]], table=[], scores=[0,0], captured=[[],[]], turn=0, started=false, sound=false, roomChannel=null, online=false, playerIndex=0, roomCode='', vsComputer=false, aiTimer=null;
function shuffle(a){for(let i=a.length-1;i>0;i--){let j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function makeDeck(){return shuffle(SUITS.flatMap((s,si)=>RANKS.map((r,ri)=>({id:si*13+ri,rank:r,value:ri,suit:s.s,red:s.red}))))}
function cardHTML(c,clickable=false){return '<div class="card '+(c.red?'red':'')+'" '+(clickable?'role="button" tabindex="0" data-card="'+c.id+'" aria-label="'+c.rank+' '+c.suit+'"':'')+'><span class="corner">'+c.rank+'<br>'+c.suit+'</span><span>'+c.rank+'</span><span class="suit">'+c.suit+'</span><span class="corner bottom">'+c.rank+'<br>'+c.suit+'</span></div>'}
function show(id){['home','lobby','game'].forEach(x=>$(x).classList.toggle('hidden',x!==id))}
function toast(t){$('toast').textContent=t;$('toast').classList.add('show');setTimeout(()=>$('toast').classList.remove('show'),2600)}
function startGame(mode='local'){if(aiTimer){clearTimeout(aiTimer);aiTimer=null}vsComputer=mode==='computer';deck=makeDeck();hands=[[],[]];table=[];scores=[0,0];captured=[[],[]];turn=0;started=true;online=false;roomChannel=null;
 // Deal four cards to each player and four cards face-up to table.
 for(let i=0;i<4;i++){hands[0].push(deck.pop());hands[1].push(deck.pop())}
 table=deck.splice(-4);$('gameMode').textContent=vsComputer?'KUNDËR KOMPJUTERIT':'LOJË LOKALE';show('game');render();$('gameMessage').textContent=vsComputer?'Ti je Lojtari 1. Bëje lëvizjen e parë.':'Lojtari 1, zgjedhe një letër.'}
function render(){if(!started)return;
 $('turnLabel').textContent=vsComputer?(turn===0?'Radha jote':'Kompjuteri po mendon…'):(turn===0?'Radha e Lojtarit 1':'Radha e Lojtarit 2');
 $('handTitle').textContent=vsComputer?'Letrat e tua':'Letrat e Lojtarit '+(turn+1);
 $('remaining').textContent=deck.length+hands[0].length+hands[1].length;
 $('tableCount').textContent=table.length+' '+(table.length===1?'letër':'letra');
 $('tableCards').innerHTML=table.length?('<div class="table-pile"><div class="pile-count">'+table.length+' '+(table.length===1?'letër në grumbull':'letra në grumbull')+'</div>'+cardHTML(table[table.length-1])+'</div>'):'<span class="empty-table">Tavolina është bosh</span>';
 $('handCards').innerHTML=(vsComputer?hands[0]:hands[turn]).map(c=>cardHTML(c,true)).join('');
 if(vsComputer&&turn===1){$('handCards').innerHTML=hands[1].map(()=>'<div class="card back-card">✦<span class="suit">♠</span></div>').join('');}
 [0,1].forEach(i=>{const el=$('score'+i);el.querySelector('span').textContent='Lojtari '+(i+1);el.querySelector('b').textContent=scores[i]});
 $('handCards').querySelectorAll('[data-card]').forEach(el=>{el.addEventListener('click',()=>play(Number(el.dataset.card)));el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();play(Number(el.dataset.card))}})});
}
function play(id,fromAI=false){if(!started)return;if(vsComputer&&turn===1&&!fromAI)return;const idx=hands[turn].findIndex(c=>c.id===id);if(idx<0)return;const card=hands[turn].splice(idx,1)[0];let msg='Letra u la në tavolinë.';
 const isPišti=table.length===1&&table[0].value===card.value;
 const isJack=card.rank==='J';
 if(table.length&&(isJack||table[table.length-1].value===card.value)){
   const taken=[...table,card];captured[turn].push(...taken);table=[];
   const countedCards=taken.filter(c=>['10','J','Q','K','A'].includes(c.rank)).length;
   const pishpirikBonus=isPišti?10:0;
   const points=countedCards+pishpirikBonus;scores[turn]+=points;
   msg='Lojtari '+(turn+1)+' i mori krejt letrat në tavolinë! +'+points+' pikë ('+countedCards+' letra të numëruara'+(isPišti?', Pishpirik +10':'')+').';
   $('lastCapture').textContent=isPišti?'✨ PISHPIRIK! +'+points+' pikë':('+'+points+' pikë');
 }else{table.push(card);$('lastCapture').textContent=''}
 turn=1-turn;
 if(hands[0].length===0&&hands[1].length===0){
   if(deck.length){for(let i=0;i<4&&deck.length;i++){hands[0].push(deck.pop());if(deck.length)hands[1].push(deck.pop())}}
   else {if(table.length){const winner= captured[0].length>captured[1].length?0:captured[1].length>captured[0].length?1:-1;const recipient=winner<0?turn:winner;const remainingPoints=table.filter(c=>['10','J','Q','K','A'].includes(c.rank)).length;scores[recipient]+=remainingPoints;if(winner>=0)scores[winner]+=3;captured[recipient].push(...table);table=[]}
    if(scores[0]===scores[1])msg+=' Loja përfundoi barazim!';else msg+=' Fiton Lojtari '+(scores[0]>scores[1]?1:2)+'!';started=false;renderFinal(msg);return}
 }
 $('gameMessage').textContent=msg;render();
 scheduleComputerTurn();
}
function renderFinal(msg){render();$('turnLabel').textContent='Loja përfundoi';$('handTitle').textContent='Rezultati final';$('handCards').innerHTML='<div class="rules"><b>'+msg+'</b><br>Lojtari 1: '+scores[0]+' pikë · Lojtari 2: '+scores[1]+' pikë</div>';$('gameMessage').textContent='Shtype Rifillo për një lojë të re.';toast(scores[0]===scores[1]?'Barazim!':'Fituesi: Lojtari '+(scores[0]>scores[1]?1:2))}
function scheduleComputerTurn(){
 if(aiTimer){clearTimeout(aiTimer);aiTimer=null}
 if(!started||!vsComputer||turn!==1)return;
 $('turnLabel').textContent='Kompjuteri po mendon…';
 $('gameMessage').textContent='Kompjuteri po zgjedh letrën…';
 aiTimer=setTimeout(()=>{aiTimer=null;computerMove()},700);
}
function computerMove(){
 if(!started||!vsComputer||turn!==1)return;
 const hand=hands[1];
 if(!hand.length){$('gameMessage').textContent='Gabim me letrat e kompjuterit. Shtype Rifillo.';return}
 // Prefer Pishpirik first, then a capture; otherwise play a random card.
 const ranked=hand.map(card=>{
   const pishpirik=table.length===1&&table[0].value===card.value;
   const captures=table.length>0&&(card.rank==='J'||table[table.length-1].value===card.value);
   const score=(pishpirik?1000:0)+(captures?100:0)+Math.random();
   return {card,score};
 }).sort((a,b)=>b.score-a.score);
 play(ranked[0].card.id,true);
}
function setupOnline(){show('lobby');$('onlineStatus').textContent='Për online real, plotëso Supabase URL dhe anon key te config.js dhe ekzekuto SQL nga README.'}
function makeCode(){return Math.random().toString(36).slice(2,8).toUpperCase()}
async function onlineAction(create){
 const name=$('playerName').value.trim();if(!name){toast('Shkruaje emrin së pari.');$('playerName').focus();return}
 const cfg=window.PISHPIRIK_CONFIG||{};
 if(!cfg.supabaseUrl||!cfg.supabaseAnonKey){$('onlineStatus').textContent='Online nuk është aktivizuar ende. Konfiguro Supabase sipas README.md; loja lokale është gati për përdorim.';toast('Mungon konfigurimi i Supabase.');return}
 try{
  if(!window.supabaseLib){const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';document.head.appendChild(s);await new Promise((res,rej)=>{s.onload=res;s.onerror=rej})}
  const client=window.supabase.createClient(cfg.supabaseUrl,cfg.supabaseAnonKey);
  roomCode=create?makeCode:$('roomCode').value.trim().toUpperCase();
  if(!roomCode){toast('Shkruaje kodin e dhomës.');return}
  $('roomCode').value=roomCode;
  roomChannel=client.channel('pishpirik-'+roomCode,{config:{broadcast:{self:false},presence:{key:name}}});
  roomChannel.on('presence',{event:'sync'},()=>{const peers=roomChannel.presenceState();$('onlineStatus').textContent='Dhoma '+roomCode+' · lojtarë të lidhur: '+Object.keys(peers).length+' · Sinkronizimi i lojës online është ende në fazë fillestare.'});
  roomChannel.on('broadcast',{event:'hello'},({payload})=>toast(payload.name+' u bashkua në dhomë.'));
  await roomChannel.subscribe(async status=>{if(status==='SUBSCRIBED'){await roomChannel.track({name,joinedAt:new Date().toISOString()});$('onlineStatus').textContent=(create?'Dhoma u krijua: ':'U lidh me dhomën: ')+roomCode+'. Ndaje kodin me shokun.';$('gameMode').textContent='DHOMA '+roomCode;toast('U lidh me dhomën!')}})
  if(!create)await roomChannel.send({type:'broadcast',event:'hello',payload:{name}});
 }catch(e){$('onlineStatus').textContent='Lidhja dështoi. Kontrollo Supabase URL/key dhe politikat e Realtime.';toast('Gabim në lidhje online.')}
}
$('computerBtn').addEventListener('click',()=>startGame('computer'));$('localBtn').addEventListener('click',()=>startGame('local'));$('onlineBtn').addEventListener('click',setupOnline);$('backBtn').addEventListener('click',()=>show('home'));
$('createRoom').addEventListener('click',()=>onlineAction(true));$('joinRoom').addEventListener('click',()=>onlineAction(false));
$('exitBtn').addEventListener('click',()=>{started=false;if(roomChannel){roomChannel.unsubscribe();roomChannel=null}show('home')});
$('newGameBtn').addEventListener('click',()=>startGame(vsComputer?'computer':'local'));
$('soundBtn').addEventListener('click',()=>{sound=!sound;$('soundBtn').textContent='♫ Tingulli: '+(sound?'ndezur':'fikur');toast(sound?'Tingulli u aktivizua (efektet audio do të shtohen).':'Tingulli u fik.')});
})();