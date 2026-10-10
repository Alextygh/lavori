/* Lucky Sim sound engine. All sounds are synthesized with the Web Audio API,
   so no audio files are needed. Load with <script src="sounds.js"></script>.
   The on/off setting is saved in localStorage ("luckysim_sound") and shared by every page. */
(function(){
  var KEY='luckysim_sound';
  var ctx=null,master=null,noiseBuf=null;

  function enabled(){
    try{return localStorage.getItem(KEY)!=='0'}catch(e){return true}
  }
  function setEnabled(on){
    try{localStorage.setItem(KEY,on?'1':'0')}catch(e){}
    paint();
  }

  function getCtx(){
    if(ctx){return ctx}
    var AC=window.AudioContext||window.webkitAudioContext;
    if(!AC){return null}
    try{
      ctx=new AC();
      master=ctx.createGain();
      master.gain.value=0.55;
      master.connect(ctx.destination);
      var len=ctx.sampleRate;
      noiseBuf=ctx.createBuffer(1,len,ctx.sampleRate);
      var d=noiseBuf.getChannelData(0);
      for(var i=0;i<len;i++){d[i]=Math.random()*2-1}
    }catch(e){ctx=null}
    return ctx;
  }
  function ready(){
    if(!enabled()){return null}
    var c=getCtx();
    if(!c){return null}
    if(c.state==='suspended'){try{c.resume()}catch(e){}}
    return c;
  }

  /* ---- building blocks ---- */
  function tone(freq,dur,type,vol,when,slideTo){
    var c=ctx,t=c.currentTime+(when||0);
    var o=c.createOscillator(),g=c.createGain();
    o.type=type||'sine';
    o.frequency.setValueAtTime(freq,t);
    if(slideTo){o.frequency.exponentialRampToValueAtTime(slideTo,t+dur)}
    g.gain.setValueAtTime(0.0001,t);
    g.gain.exponentialRampToValueAtTime(vol||0.2,t+0.008);
    g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
    o.connect(g);g.connect(master);
    o.start(t);o.stop(t+dur+0.03);
  }
  function noise(dur,vol,freq,q,when,type){
    var c=ctx,t=c.currentTime+(when||0);
    var s=c.createBufferSource();s.buffer=noiseBuf;
    s.playbackRate.value=0.8+Math.random()*0.4;
    var f=c.createBiquadFilter();
    f.type=type||'bandpass';f.frequency.value=freq;f.Q.value=q||1;
    var g=c.createGain();
    g.gain.setValueAtTime(0.0001,t);
    g.gain.exponentialRampToValueAtTime(vol,t+0.004);
    g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
    s.connect(f);f.connect(g);g.connect(master);
    s.start(t,Math.random()*0.5);s.stop(t+dur+0.03);
  }

  /* ---- the sounds ---- */
  var S={
    click:function(){tone(700,0.03,'square',0.025)},
    tick:function(){tone(1500,0.025,'triangle',0.07)},
    chip:function(){
      noise(0.05,0.22,5200,3,0);tone(2300,0.07,'sine',0.09,0);
      noise(0.05,0.18,4300,3,0.07);tone(1900,0.08,'sine',0.08,0.07);
    },
    card:function(){noise(0.09,0.22,1700,0.8,0);noise(0.05,0.12,3200,1,0.05)},
    flip:function(){noise(0.07,0.18,2200,0.9,0)},
    shuffle:function(){for(var i=0;i<7;i++){noise(0.06,0.14,1500+Math.random()*900,0.8,i*0.055)}},
    dice:function(){
      for(var i=0;i<9;i++){
        var w=i*0.075+Math.random()*0.03;
        noise(0.04,0.2-i*0.012,900+Math.random()*900,2,w);
        tone(260+Math.random()*180,0.05,'triangle',0.06,w);
      }
    },
    tile:function(){noise(0.05,0.2,900,2,0);tone(420,0.06,'triangle',0.1,0)},
    scratch:function(){noise(0.07,0.1,5200,0.7,0,'highpass')},
    ball:function(){tone(880,0.28,'sine',0.12,0);tone(1320,0.2,'sine',0.04,0)},
    spin:function(){tone(180,0.5,'sawtooth',0.04,0,520)},
    stop:function(){tone(190,0.12,'sine',0.2,0,70);noise(0.05,0.12,700,1,0)},
    start:function(){tone(660,0.18,'square',0.07,0);tone(990,0.35,'square',0.07,0.2)},
    hoof:function(){noise(0.035,0.12,380,2,0);noise(0.035,0.1,330,2,0.09)},
    push:function(){tone(520,0.12,'sine',0.12,0);tone(520,0.14,'sine',0.1,0.14)},
    win:function(){
      [523.25,659.25,783.99,1046.5].forEach(function(f,i){tone(f,0.22,'triangle',0.16,i*0.09)});
      tone(1046.5,0.45,'sine',0.08,0.36);
    },
    big:function(){
      [523.25,659.25,783.99,1046.5,1318.5,1568].forEach(function(f,i){tone(f,0.28,'triangle',0.17,i*0.09)});
      for(var i=0;i<8;i++){tone(1800+Math.random()*1800,0.12,'sine',0.05,0.5+i*0.07)}
      tone(1046.5,0.8,'sine',0.1,0.6);
    },
    lose:function(){tone(330,0.22,'triangle',0.14,0,250);tone(247,0.4,'triangle',0.14,0.2,160)}
  };

  function play(name){
    var fn=S[name];
    if(!fn){return}
    if(!ready()){return}
    try{fn()}catch(e){}
  }
  /* play the same sound n times, gap seconds apart (for dealing several cards) */
  function repeat(name,n,gap){
    for(var i=0;i<n;i++){(function(k){setTimeout(function(){play(name)},k*gap*1000)})(i)}
  }
  /* net = profit in chips (negative for a loss), stake = what was bet.
     Big win if you made at least 4 times the stake. */
  function outcome(net,stake){
    if(net>0){play(stake>0&&net>=stake*4?'big':'win')}
    else if(net<0){play('lose')}
    else{play('push')}
  }

  /* ---- mute button (added to every page) ---- */
  var btn=null;
  function paint(){
    if(!btn){return}
    var on=enabled();
    btn.textContent=on?'🔊':'🔇';
    btn.setAttribute('aria-pressed',on?'false':'true');
    btn.setAttribute('aria-label',on?'Sound on. Click to mute.':'Sound off. Click to unmute.');
    btn.title=on?'Sound on':'Sound off';
  }
  function addButton(){
    if(btn||!document.body){return}
    btn=document.createElement('button');
    btn.type='button';
    btn.id='soundToggle';
    btn.setAttribute('data-nosound','1');
    btn.style.cssText='position:fixed;right:12px;bottom:calc(12px + env(safe-area-inset-bottom,0px));z-index:30;width:44px;height:44px;border-radius:50%;border:2px solid #b8860b;background:rgba(22,37,30,.92);color:#fff;font-size:20px;line-height:1;cursor:pointer;padding:0;box-shadow:0 2px 8px rgba(0,0,0,.35)';
    btn.addEventListener('click',function(e){
      e.stopPropagation();
      var on=!enabled();
      setEnabled(on);
      if(on){play('chip')}
    });
    document.body.appendChild(btn);
    paint();
  }
  if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',addButton)}
  else{addButton()}

  /* unlock audio on the first tap (browsers require a user gesture) */
  function unlock(){
    if(enabled()){var c=getCtx();if(c&&c.state==='suspended'){try{c.resume()}catch(e){}}}
  }
  ['pointerdown','keydown','touchstart'].forEach(function(ev){
    window.addEventListener(ev,unlock,{passive:true});
  });

  /* soft click on every button, unless the page marks it data-nosound */
  document.addEventListener('click',function(e){
    var t=e.target;
    if(!t||!t.closest){return}
    var b=t.closest('button');
    if(!b||b.disabled||b.closest('[data-nosound]')){return}
    play('click');
  },true);

  window.addEventListener('storage',function(e){if(e.key===KEY){paint()}});

  window.Sound={play:play,repeat:repeat,outcome:outcome,enabled:enabled,setEnabled:setEnabled};
})();
