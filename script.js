(() => {
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const scenes = ['hero','treeScene','galleryScene','poemScene','letterScene'];
  let currentScene = 'hero';
  const toast = (msg) => { const el=$('#toast'); el.textContent=msg; el.classList.add('show'); clearTimeout(toast.t); toast.t=setTimeout(()=>el.classList.remove('show'),2300); };
  function goTo(id) {
    if (!scenes.includes(id)) return;
    currentScene=id;
    $$('.scene').forEach(s=>s.classList.toggle('active',s.id===id));
    $$('.nav-dot').forEach(b=>b.classList.toggle('selected',b.dataset.goto===id));
    if (window.gsap) gsap.fromTo('#'+id+' .reveal, #'+id+' .section-head, #'+id+' .poem-card, #'+id+' .letter-wrap',{y:18,opacity:0},{y:0,opacity:1,duration:.8,stagger:.08,ease:'power2.out',clearProps:'transform'});
    if(id==='treeScene'){
      const startTree=()=>{if(!$('#treeScene').classList.contains('active'))return;if(treeReady){growTree();}else setTimeout(startTree,120);};
      startTree();
    }
    if(id==='galleryScene') galleryBirthdayGlow(50,18,18);
  }
  $('#beginBtn').addEventListener('click',()=>goTo('treeScene'));
  $$('[data-next]').forEach(b=>b.addEventListener('click',()=>goTo(b.dataset.next)));
  $$('.nav-dot').forEach(b=>b.addEventListener('click',()=>goTo(b.dataset.goto)));
  $('#restartBtn').addEventListener('click',()=>{goTo('hero');$('#envelope').classList.remove('open');});
  // Soft original romantic instrumental. Playback starts only after a user tap (mobile-browser policy).
  const backgroundMusic = new Audio('soft-love-song.mp3');
  backgroundMusic.loop = true;
  backgroundMusic.preload = 'auto';
  backgroundMusic.volume = 0.42;
  let musicOn = false;
  async function toggleMusic(){
    try{
      if(!musicOn){
        await backgroundMusic.play();
        musicOn = true;
        $('#soundLabel').textContent = 'SOUND ON';
        $('#soundBtn').classList.add('playing');
        toast('Soft music is playing ♡');
      } else {
        backgroundMusic.pause();
        musicOn = false;
        $('#soundLabel').textContent = 'SOUND OFF';
        $('#soundBtn').classList.remove('playing');
        toast('Music paused');
      }
    }catch(e){ toast('Tap SOUND again to start the music ♡'); }
  }
  $('#soundBtn').addEventListener('click', toggleMusic);
  backgroundMusic.addEventListener('ended', () => { musicOn=false; $('#soundLabel').textContent='SOUND OFF'; $('#soundBtn').classList.remove('playing'); });
  // Poems
  const defaultPoems=[
    'If every star could speak your name,<br>the night would never look the same.',
    'May gentle mornings find your door,<br>and leave you happier than before.',
    'If flowers could keep a wish for you,<br>they would bloom in every color true.',
    'No grandest sky, no ocean blue,<br>could hold all the good I wish for you.',
    'You are the calm in busy days,<br>a little light in countless ways.',
    'If time could gift one thing to me,<br>it would be more moments shared with thee.',
    'May every dream you softly keep,<br>grow into wonders bright and deep.',
    'And if the stars forget to shine,<br>my warmest wishes will still be thine.'
  ];
  let poems=loadLocal('mim-poems',defaultPoems);
  let poemIndex=0;
  function renderPoem(){
    const text=$('#poemText');
    if(window.gsap)gsap.fromTo(text,{opacity:0,y:10},{opacity:1,y:0,duration:.45,ease:'power2.out'});
    text.innerHTML=poems[poemIndex]; const card=$('.poem-card'); if(card){card.dataset.poem=String(poemIndex%8);card.classList.remove('poem-bloom');void card.offsetWidth;card.classList.add('poem-bloom');}
    $('#poemCount').textContent=String(poemIndex+1).padStart(2,'0')+' — '+String(poems.length).padStart(2,'0');
    $('#poemDots').innerHTML=poems.map((_,i)=>`<span class="${i===poemIndex?'active':''}"></span>`).join('');
  }
  function movePoem(dir){poemIndex=(poemIndex+dir+poems.length)%poems.length;renderPoem();}
  $('#nextPoem').addEventListener('click',()=>movePoem(1));$('#prevPoem').addEventListener('click',()=>movePoem(-1));renderPoem();
  let touchStartX=0;
  $('#poemScene').addEventListener('touchstart',e=>{touchStartX=e.changedTouches[0].clientX;},{passive:true});
  $('#poemScene').addEventListener('touchend',e=>{const dx=e.changedTouches[0].clientX-touchStartX;if(Math.abs(dx)>55)movePoem(dx<0?1:-1);},{passive:true});
  // Birthday dimension: each portal opens a unique, fully generated animated scene.
  // Keep the card selector defined so this section never interrupts the tree animation setup.
  const flowerButtons=()=>$$('.flower-card');
  let activePortal=0;
  const activityLabels=['Release a sunrise wish ☼','Blow out the candles ✦','Open your cosmic gift ◇','Launch birthday fireworks ✧','Charge the heart reactor ♥','Wake the aurora ∞'];
  const memoryThemes=[
    {cls:'theme-sunrise',icon:'☼',title:'Solar Wish',message:'May your new year orbit around joy, wonder, and every dream you are brave enough to follow.',anim:'memory-sunrise',label:'A NEW ORBIT OF JOY'},
    {cls:'theme-cake',icon:'♕',title:'Cake Nebula',message:'Close your eyes, make a wish, and let the universe keep a little magic just for you.',anim:'memory-cake',label:'MAKE A WISH, MIM'},
    {cls:'theme-gift',icon:'◇',title:'Gift Dimension',message:'If happiness could be wrapped, this whole universe would be your birthday present.',anim:'memory-gift',label:'A GIFT FROM THE STARS'},
    {cls:'theme-confetti',icon:'✧',title:'Stardust Finale',message:'May the sky celebrate you with a thousand tiny lights, today and every day after.',anim:'memory-confetti',label:'THE SKY IS CELEBRATING YOU'},
    {cls:'theme-rose',icon:'♥',title:'Heart Reactor',message:'One small heart, an infinite amount of love. You make this universe brighter just by being you.',anim:'memory-rose',label:'LOVE REACTOR · 100%'},
  ];
  function openFlower(index){
    index=Number(index);
    if(!Number.isInteger(index)||index<0||index>=memoryThemes.length) return;
    const theme=memoryThemes[index];
    $('#memoryAction').dataset.activity=String(index);
    $('#memoryAction').textContent=['Release a birthday wish ☀','Blow out the candles ✨','Open your birthday gift 🎁','Start the fireworks 🎆','Send love from the heart ♥'][index];
    $('#memoryAction').className='memory-action activity-'+(index%6);
    $('#memoryAction').disabled=false;
    activePortal=index;
    $('#modalCaption').textContent=theme.title;
    $('#modalMessage').textContent=theme.message;
    const stage=$('#memoryStage');stage.className='memory-stage '+theme.cls+' '+theme.anim;
    stage.querySelector('.memory-object').textContent=['☀','🎂','🎁','🎆','♥'][index];
    stage.querySelector('.memory-video-label').textContent=theme.label;
    stage.classList.remove('reactor-charged','aurora-awake','activity-run','activity-play-0','activity-play-1','activity-play-2','activity-play-3','activity-play-4','activity-play-5');
    $('#photoModal').classList.remove('memory-rose','memory-sunrise','memory-ocean','memory-cake','memory-gift','memory-balloon','memory-firefly','memory-confetti','memory-moon');
    $('#photoModal').classList.add('open',theme.anim);
    galleryBirthdayGlow(50,48,34+index*5);
    if(window.gsap){gsap.fromTo('#memoryStage',{y:35,opacity:0,scale:.82,rotationX:12},{y:0,opacity:1,scale:1,rotationX:0,duration:.9,ease:'power4.out'});gsap.fromTo('#modalCaption,#modalMessage',{y:15,opacity:0},{y:0,opacity:1,duration:.65,stagger:.12,delay:.18,ease:'power3.out'});}
  }
  flowerButtons().forEach(b=>b.addEventListener('click',()=>openFlower(Number(b.dataset.index))));
  // One activity control per portal: avoids duplicate buttons and conflicting handlers.
  const activityMessages=[
    ['Sunrise wish released!','A new little sunrise is rising just for Mim.'],
    ['Birthday wish made!','The candles glow brighter as your wish travels into the stars.'],
    ['Cosmic gift opened!','A tiny universe of happiness was hiding inside your present.'],
    ['The sky is celebrating!','Birthday stardust bursts across the night sky for Mim.'],
    ['A little love, just for you!','Sending you the warmest birthday hug and a heart full of good wishes.']
  ];
  function runPortalActivity(index){
    index=Number(index);
    if(!Number.isInteger(index)||index<0||index>=memoryThemes.length) return;
    const stage=$('#memoryStage');
    const obj=stage && stage.querySelector('.memory-object');
    if(!stage||!obj||!$('#photoModal').classList.contains('open')) return;
    activePortal=index;
    stage.classList.remove('activity-run','activity-play-0','activity-play-1','activity-play-2','activity-play-3','activity-play-4','activity-play-5','reactor-charged','aurora-awake');
    void stage.offsetWidth;
    stage.classList.add('activity-run','activity-play-'+index);
    if(index===0){obj.textContent='☀';galleryBirthdayGlow(50,42,48);}
    else if(index===1){obj.textContent='🕯️';galleryBirthdayGlow(50,42,28);setTimeout(()=>{if($('#photoModal').classList.contains('open')&&activePortal===index){obj.textContent='🎂';galleryBirthdayGlow(50,35,38);}},750);}
    else if(index===2){obj.textContent='🎁';obj.classList.remove('gift-opening');void obj.offsetWidth;obj.classList.add('gift-opening');setTimeout(()=>{if($('#photoModal').classList.contains('open')&&activePortal===index){obj.textContent='💝';galleryBirthdayGlow(50,42,48);}},650);}
    else if(index===3){obj.textContent='✧';galleryBirthdayGlow(50,35,60);setTimeout(()=>galleryBirthdayGlow(30,40,32),250);setTimeout(()=>galleryBirthdayGlow(70,40,32),500);}
    else if(index===4){obj.textContent='💗';stage.classList.add('reactor-charged');galleryBirthdayGlow(50,48,55);}
    $('#modalCaption').textContent=activityMessages[index][0];
    $('#modalMessage').textContent=activityMessages[index][1];
    $('#memoryAction').textContent=['Send another wish ☀','Make another wish ✨','Open another gift 🎁','Celebrate again 🎆','Send more love ♥'][index];
    if(window.gsap)gsap.fromTo('#modalCaption,#modalMessage',{opacity:0,y:10,scale:.98},{opacity:1,y:0,scale:1,duration:.55,stagger:.08,ease:'power2.out'});
  }
  $('#memoryAction').addEventListener('click',()=>runPortalActivity(Number($('#memoryAction').dataset.activity)));
  function galleryBirthdayGlow(originX=50,originY=48,count=24){
    document.querySelectorAll('.gallery-birthday-particle').forEach(el=>el.remove());
    const symbols=['♡','✦','✧','✷','⋆','✺','🎂','✴'];
    for(let i=0;i<count;i++){
      const el=document.createElement('span');el.className='gallery-birthday-particle';el.textContent=symbols[Math.floor(Math.random()*symbols.length)];
      el.style.left=(originX+(Math.random()-.5)*54)+'%';el.style.top=(originY+(Math.random()-.5)*30)+'%';
      el.style.setProperty('--dx',(-100+Math.random()*200)+'px');el.style.setProperty('--delay',(Math.random()*.65)+'s');el.style.setProperty('--size',(10+Math.random()*22)+'px');$('#photoModal').appendChild(el);setTimeout(()=>el.remove(),3000);
    }
  }
  $('#galleryScene').addEventListener('pointerdown',e=>{if(e.target.closest('button'))return;galleryBirthdayGlow(50,55,12);});
  $('#closeModal').addEventListener('click',()=>{$('#photoModal').classList.remove('open');document.querySelectorAll('.gallery-birthday-particle').forEach(el=>el.remove());});
  $('#photoModal').addEventListener('click',e=>{if(e.target.id==='photoModal'){$('#photoModal').classList.remove('open');document.querySelectorAll('.gallery-birthday-particle').forEach(el=>el.remove());}});

  // Envelope
  function openLetter(){const el=$('#envelope');el.classList.toggle('open');$('#openLetterBtn').textContent=el.classList.contains('open')?'Close your letter ♡':'Open your letter ♡';if(el.classList.contains('open'))toast('A little note, just for you.');}
  $('#envelope').addEventListener('click',openLetter);$('#envelope').addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openLetter();}});$('#openLetterBtn').addEventListener('click',openLetter);
  // Typewriter birthday title: independent of the tree canopy, positioned at the upper-right.
  const birthdayTypeText=$('#birthdayTypeText');
  if(birthdayTypeText){
    const birthdayPhrase='HAPPY BIRTHDAY MIM'; let typeIndex=0;
    birthdayTypeText.textContent='';
    const typeTimer=setInterval(()=>{
      if(!$('#treeScene').classList.contains('active')) return;
      if(typeIndex<birthdayPhrase.length){birthdayTypeText.textContent+=birthdayPhrase[typeIndex++];birthdayTypeText.parentElement.classList.add('typing');}
      else {clearInterval(typeTimer);birthdayTypeText.parentElement.classList.remove('typing');birthdayTypeText.parentElement.classList.add('typed');}
    },82);
  }

  // Three.js tree with procedural trunk, branches, heart-shaped leaves and floating motes.
  let renderer,scene,camera,treeGroup,leafMeshes=[],branchMeshes=[],motes=[],raycaster,mouse,treeReady=false,treeGrown=false,treeGrowTimer=null;
  function makeHeartShape(){
    const s=new THREE.Shape();s.moveTo(0,.12);s.bezierCurveTo(-.04,.18,-.15,.18,-.16,.08);s.bezierCurveTo(-.18,-.02,-.08,-.09,0,-.17);s.bezierCurveTo(.08,-.09,.18,-.02,.16,.08);s.bezierCurveTo(.15,.18,.04,.18,0,.12);return s;
  }
  function addBranch(parent,start,end,radius,material){
    const a=new THREE.Vector3(...start),b=new THREE.Vector3(...end),d=new THREE.Vector3().subVectors(b,a);
    const mesh=new THREE.Mesh(new THREE.CylinderGeometry(radius*.55,radius,d.length(),7),material);
    mesh.position.copy(a).add(b).multiplyScalar(.5);mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());parent.add(mesh);branchMeshes.push(mesh);return mesh;
  }
  function initTree(){
    const canvas=$('#treeCanvas');if(!window.THREE)return;
    try{
      renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:!matchMedia('(max-width:600px)').matches,powerPreference:'low-power'});
      renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.6));renderer.setSize(canvas.clientWidth,canvas.clientHeight,false);renderer.outputColorSpace=THREE.SRGBColorSpace;
      scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(42,canvas.clientWidth/canvas.clientHeight,.1,100);camera.position.set(0,1.1,9.5);
      scene.add(new THREE.AmbientLight(0xb4a4ff,1.5));
      const light=new THREE.PointLight(0xffa4d9,24,18);light.position.set(1,3,4);scene.add(light);
      const rim=new THREE.PointLight(0x6a9eff,14,15);rim.position.set(-4,1,1);scene.add(rim);
      treeGroup=new THREE.Group();treeGroup.position.set(.55,-2.45,0);treeGroup.scale.setScalar(1.16);scene.add(treeGroup);
      const bark=new THREE.MeshStandardMaterial({color:0x573a32,roughness:.86,metalness:.02});
      const barkLight=new THREE.MeshStandardMaterial({color:0x795044,roughness:.9});
      const roots=[[[0,-.28,0],[-.62,-.55,.02],.13],[[0,-.28,0],[.58,-.55,.02],.13],[[ -.05,-.25,0],[-.32,-.68,.02],.085],[[.04,-.25,0],[.34,-.7,.02],.085]];
      roots.forEach(r=>addBranch(treeGroup,r[0],r[1],r[2],bark));
      const trunk=addBranch(treeGroup,[0,-.3,0],[0,2.35,0],.29,bark);trunk.userData.isTrunk=true;
      addBranch(treeGroup,[-.08,.15,.08],[.06,1.45,.08],.14,barkLight);
      // Broad, organic heart-tree silhouette inspired by the supplied reference.
      const branches=[
        [[0,.05,0],[-1.55,.72,.05],.19],[[0,.28,0],[1.62,.88,0],.19],
        [[-.08,.55,0],[-1.05,1.65,.05],.16],[[.12,.72,0],[1.18,1.82,-.05],.16],
        [[-1.2,.82,0],[-2.35,1.28,.05],.12],[[1.18,1.02,0],[2.32,1.55,.05],.12],
        [[-.82,1.42,0],[-1.75,2.15,.05],.12],[[.82,1.55,0],[1.78,2.25,-.05],.12],
        [[-1.72,1.18,0],[-2.55,1.78,.05],.085],[[1.7,1.5,0],[2.58,1.98,.05],.085],
        [[-1.05,1.75,0],[-1.55,2.7,.05],.095],[[1.08,1.82,0],[1.55,2.75,-.05],.095],
        [[-.42,1.95,0],[-.82,3.02,.05],.095],[[.38,2.12,0],[.72,3.18,-.05],.095],
        [[-2.1,1.55,0],[-2.72,2.22,.05],.06],[[2.1,1.72,0],[2.75,2.35,.05],.06],
        [[-1.55,2.15,0],[-2.05,2.75,.05],.065],[[1.55,2.2,0],[2.05,2.82,.05],.065],
        [[-.72,2.35,0],[-1.12,3.28,.05],.065],[[.7,2.45,0],[1.08,3.3,.05],.065],
        [[-2.25,1.28,0],[-2.85,1.42,.05],.045],[[2.25,1.65,0],[2.9,1.72,.05],.045],
        [[-.2,1.2,.05],[-.32,2.15,.2],.08],[[.2,1.45,.05],[.55,2.25,.2],.07]
      ];
      branches.forEach(b=>addBranch(treeGroup,b[0],b[1],b[2],bark));
      const heart=new THREE.ShapeGeometry(makeHeartShape(),8);
      const colors=[0xff4f91,0xff8ec8,0xc49bff,0x5dd9cf,0xffa04d,0xffd95f,0xf879a9,0x9ce66b,0x9b70d6];
      // Structured canopy clusters follow the branch tips for a fuller, balanced silhouette.
      const canopyAnchors=[
        [-2.55,1.55],[-2.2,2.05],[-1.8,2.55],[-1.35,2.95],[-.85,3.15],[-.25,2.85],
        [.45,3.0],[1.05,3.15],[1.55,2.75],[2.05,2.45],[2.55,2.05],[2.7,1.65],
        [-1.65,1.55],[-1.0,1.95],[-.45,2.15],[.3,2.25],[.95,1.95],[1.65,1.75],
        [-2.35,1.25],[2.25,1.55],[0,1.65],
        [-2.85,1.95],[-2.55,2.42],[-2.05,2.85],[-1.55,3.08],[-1.05,3.35],[-.52,3.42],[0,3.25],
        [.52,3.42],[1.05,3.35],[1.55,3.08],[2.05,2.85],[2.55,2.42],[2.85,1.95],
        [-2.65,1.45],[-2.15,1.72],[-1.78,2.02],[-1.28,2.28],[-.82,2.48],[-.35,2.65],
        [.35,2.65],[.82,2.48],[1.28,2.28],[1.78,2.02],[2.15,1.72],[2.65,1.45]
      ];
      for(let i=0;i<720;i++){
        const anchor=canopyAnchors[i%canopyAnchors.length];
        const spread=.12+(i%5)*.035;
        const x=anchor[0]+(Math.random()-.5)*spread*2;
        const y=anchor[1]+(Math.random()-.5)*spread*2;
        const mat=new THREE.MeshStandardMaterial({color:colors[Math.floor(Math.random()*colors.length)],emissive:colors[Math.floor(Math.random()*colors.length)],emissiveIntensity:.65,roughness:.4,side:THREE.DoubleSide});
        const leaf=new THREE.Mesh(heart,mat);leaf.position.set(x,y,(Math.random()-.5)*.9);const scale=.15+Math.random()*.27;leaf.scale.set(scale,scale,scale);leaf.rotation.set((Math.random()-.5)*.6,(Math.random()-.5)*.8,(Math.random()-.5)*1.2);leaf.userData={baseY:y,phase:Math.random()*6.28,baseScale:scale};leaf.scale.setScalar(0);leaf.visible=false;treeGroup.add(leaf);leafMeshes.push(leaf);
      }
      const moteGeo=new THREE.SphereGeometry(.018,6,6);
      for(let i=0;i<65;i++){
        const m=new THREE.Mesh(moteGeo,new THREE.MeshBasicMaterial({color:colors[i%colors.length],transparent:true,opacity:.45+Math.random()*.4}));
        m.position.set((Math.random()-.5)*7,Math.random()*5-1,(Math.random()-.5)*2);m.userData={phase:Math.random()*6.28,speed:.2+Math.random()*.5};scene.add(m);motes.push(m);
      }
      branchMeshes.forEach(b=>{b.userData.baseScaleY=1;b.scale.y=.001;});
      raycaster=new THREE.Raycaster();mouse=new THREE.Vector2();treeReady=true;
      const resize=()=>{if(!renderer)return;const w=canvas.clientWidth,h=canvas.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();};
      window.addEventListener('resize',resize);
      canvas.addEventListener('pointerdown',onTreeTap);
      const clock=new THREE.Clock();
      function animate(){requestAnimationFrame(animate);const t=clock.getElapsedTime();leafMeshes.forEach(l=>{l.rotation.z+=Math.sin(t+l.userData.phase)*.0008;l.position.y=l.userData.baseY+Math.sin(t*1.1+l.userData.phase)*.025;});motes.forEach(m=>{m.position.y+=Math.sin(t*m.userData.speed+m.userData.phase)*.0015;m.position.x+=Math.cos(t*.2+m.userData.phase)*.001;});treeGroup.rotation.y=Math.sin(t*.16)*.06;renderer.render(scene,camera);}
      animate();
    }catch(err){console.warn('3D scene unavailable:',err);canvas.style.background='radial-gradient(ellipse at 65% 50%,#4b2c53,#0a0915 65%)';}
  }
  function growTree(){
    if(!treeReady)return;
    if(!window.gsap){branchMeshes.forEach(b=>b.scale.y=1);leafMeshes.forEach(l=>{l.visible=true;l.scale.setScalar(l.userData.baseScale);});treeGrown=true;return;}
    clearTimeout(treeGrowTimer);treeGrown=false;
    branchMeshes.forEach(b=>{b.scale.y=.001;});leafMeshes.forEach(l=>{l.visible=false;l.scale.setScalar(0);});
    const trunk=branchMeshes.find(b=>b.userData.isTrunk)||branchMeshes[0];
    gsap.to(trunk.scale,{y:1,duration:1.15,ease:'power3.out'});
    const others=branchMeshes.filter(b=>b!==trunk);
    gsap.to(others.map(b=>b.scale),{y:1,duration:.72,stagger:.09,delay:.8,ease:'back.out(1.25)',onComplete:()=>{
      leafMeshes.forEach(l=>{l.visible=true;});
      gsap.to(leafMeshes.map(l=>l.scale),{x:(i)=>leafMeshes[i].userData.baseScale,y:(i)=>leafMeshes[i].userData.baseScale,z:(i)=>leafMeshes[i].userData.baseScale,duration:.65,stagger:{each:.012,from:'random'},delay:.05,ease:'back.out(1.7)',onComplete:()=>{treeGrown=true;}});
    }});
  }
  function onTreeTap(e){
    if(!treeReady)return;
    const rect=$('#treeCanvas').getBoundingClientRect();mouse.x=((e.clientX-rect.left)/rect.width)*2-1;mouse.y=-((e.clientY-rect.top)/rect.height)*2+1;raycaster.setFromCamera(mouse,camera);
    const hits=raycaster.intersectObjects(leafMeshes);
    if(hits.length){
      const leaf=hits[0].object;
      if(window.gsap){gsap.to(leaf.scale,{x:leaf.userData.baseScale*1.75,y:leaf.userData.baseScale*1.75,z:leaf.userData.baseScale*1.75,duration:.24,yoyo:true,repeat:1,ease:'elastic.out(1,.45)'});gsap.to(leaf.material,{emissiveIntensity:2.4,duration:.22,yoyo:true,repeat:1});}
      const notes=['Mim, you make ordinary days feel magical. ♡','Your smile is my favorite kind of sunshine. ☀','You deserve every gentle, beautiful thing. ✨','If I could, I would gift you a sky full of stars. 🌙','You are loved more than words can hold. 💗','Tomar hashitei amar din shundor hoy. ♡','You make the world feel softer. 🌸','A little reminder: you are truly special. 💫','May your dreams bloom beautifully. 🌷','You are my favorite notification. 💌','A thousand tiny wishes, just for you. ♡','Every petal carries a little thought of you. 🌺'];
      const bubble=document.createElement('div');bubble.className='leaf-love-note';bubble.textContent=notes[Math.floor(Math.random()*notes.length)];
      bubble.style.left=Math.min(68,Math.max(8,(e.clientX/innerWidth*100)-18))+'%';bubble.style.top=Math.min(68,Math.max(18,(e.clientY/innerHeight*100)-4))+'%';
      document.body.appendChild(bubble);setTimeout(()=>bubble.remove(),3900);toast('A tiny love message just for you ♡');
    } else {leafMeshes.forEach((l,i)=>{if(i%5===0&&window.gsap)gsap.to(l.position,{y:l.position.y+.18,duration:.3,yoyo:true,repeat:1,delay:Math.random()*.15});});toast('Tap a heart-shaped leaf for a special message ✨');}
  }
  // Gentle auto-intro and tree setup
  document.addEventListener('DOMContentLoaded',()=>{});
  if(window.gsap)gsap.from('.hero .reveal',{y:20,opacity:0,duration:1,stagger:.13,delay:.2,ease:'power2.out'});
  initTree();
  // Local admin studio: available only when the URL contains ?admin=1.
  function loadLocal(key,fallback){try{const v=localStorage.getItem(key);return v?JSON.parse(v):fallback;}catch(e){return fallback;}}
  function saveLocal(key,value){try{localStorage.setItem(key,JSON.stringify(value));return true;}catch(e){toast('Browser storage is full. Try smaller photos.');return false;}}
  function safeTextHTML(value){return String(value).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch])).replace(/\n/g,'<br>');}
  function refreshPoems(){const stored=loadLocal('mim-poems',defaultPoems);poems=stored.length?stored:defaultPoems;poemIndex=0;renderPoem();}
  function openAdmin(){const panel=$('#adminPanel');panel.classList.add('open');panel.setAttribute('aria-hidden','false');}
  function closeAdmin(){const panel=$('#adminPanel');panel.classList.remove('open');panel.setAttribute('aria-hidden','true');}
  if(new URLSearchParams(location.search).get('admin')==='1'){$('#adminOpen').hidden=false;$('#adminOpen').addEventListener('click',openAdmin);}
  $('#adminClose').addEventListener('click',closeAdmin);
  $('#savePoem').addEventListener('click',()=>{const value=$('#adminPoem').value.trim();if(!value){toast('Write a poem first ♡');return;}const current=loadLocal('mim-poems',defaultPoems);current.push(safeTextHTML(value));if(saveLocal('mim-poems',current)){refreshPoems();$('#adminPoem').value='';toast('Your poem has been added ♡');}});
  $('#saveBirthday').addEventListener('click',()=>{const msg=$('#adminBirthday').value.trim();if(!msg){toast('Write a birthday wish first ♡');return;}if(saveLocal('mim-birthday',msg)){applyBirthdayMessage();toast('Birthday wish saved ♡');}});
  function applyBirthdayMessage(){const msg=loadLocal('mim-birthday','');if(msg)$('#birthdayMessage').textContent=msg;}
  applyBirthdayMessage();
  $('#resetLocalContent').addEventListener('click',()=>{if(!confirm('Reset locally saved poems and birthday text?'))return;['mim-poems','mim-birthday'].forEach(k=>localStorage.removeItem(k));refreshPoems();$('#birthdayMessage').textContent='May your next chapter be softer, brighter, and filled with the kind of magic you give to everyone around you.';toast('Local edits reset.');});
  // Floating multilingual love bubbles, triggered by the heart-shaped play control.
  const loveLines=['I love you','Ami tomake bhalobashi','Je t’aime','Te amo','Tum meri duniya ho','You are my universe','Ты — моё счастье','사랑해','You make life softer','Forever cheering for you','তুমি আমার প্রিয় মানুষ'];
  let lovePlayTimer=null;
  function releaseLove(){const layer=$('#loveParticles');const count=18;for(let i=0;i<count;i++){setTimeout(()=>{const bubble=document.createElement('div');bubble.className='love-bubble';bubble.style.left=(5+Math.random()*90)+'%';bubble.style.setProperty('--duration',(4.2+Math.random()*2.8)+'s');bubble.style.setProperty('--drift',(-45+Math.random()*90)+'px');bubble.innerHTML='<span class="bubble-heart">'+(['♡','♥','ღ','❥'][Math.floor(Math.random()*4)])+'</span><span class="bubble-word"></span>';bubble.querySelector('.bubble-word').textContent=loveLines[Math.floor(Math.random()*loveLines.length)];layer.appendChild(bubble);setTimeout(()=>bubble.remove(),7500);},i*150);}toast('A thousand tiny love notes for Mim ♡');}
  $('#lovePlay').addEventListener('click',()=>{releaseLove();$('#lovePlay').classList.add('is-playing');setTimeout(()=>$('#lovePlay').classList.remove('is-playing'),1800);});
  // Birthday scene: gentle star confetti, not a loud party effect.
  function birthdayBurst(count=44){const symbols=['✦','✧','♡','✷','⋆','❀','✿'];for(let i=0;i<count;i++){const el=document.createElement('span');el.className='birthday-spark';el.textContent=symbols[Math.floor(Math.random()*symbols.length)];el.style.left=Math.random()*100+'%';el.style.top=(-5-Math.random()*35)+'%';el.style.color=['#ffb6dc','#d5c2ff','#ffe3a4','#a7e9ee','#ffffff'][Math.floor(Math.random()*5)];el.style.fontSize=(12+Math.random()*20)+'px';el.style.animationDelay=(Math.random()*.9)+'s';document.body.appendChild(el);setTimeout(()=>el.remove(),3900);}}
  $('#birthdayBtn').addEventListener('click',()=>{birthdayBurst(60);$('#birthdayOverlay').classList.add('open');$('#birthdayOverlay').setAttribute('aria-hidden','false');if(window.gsap)gsap.fromTo('.birthday-card .eyebrow,.birthday-card h2,.birthday-card>p,.birthday-card .primary-btn',{y:12,opacity:0},{y:0,opacity:1,duration:.65,stagger:.12,ease:'power2.out'});});
  function closeBirthday(){$('#birthdayOverlay').classList.remove('open');$('#birthdayOverlay').setAttribute('aria-hidden','true');}
  $('#closeBirthday').addEventListener('click',closeBirthday);
  $('#birthdayOverlay').addEventListener('click',e=>{if(e.target.id==='birthdayOverlay')closeBirthday();});
  $('#birthdayWishBtn').addEventListener('click',()=>{birthdayBurst(90);toast('Wish sent into the stars ✨');});

  // keyboard escape + basic wheel scene navigation
  document.addEventListener('keydown',e=>{if(e.key==='Escape')$('#photoModal').classList.remove('open');});
  let wheelLock=false;
  window.addEventListener('wheel',e=>{if(wheelLock||$('#photoModal').classList.contains('open'))return;const i=scenes.indexOf(currentScene);if(Math.abs(e.deltaY)<25)return;wheelLock=true;goTo(scenes[Math.max(0,Math.min(scenes.length-1,i+(e.deltaY>0?1:-1)))]);setTimeout(()=>wheelLock=false,1000);},{passive:true});
  let startX=0,startY=0;
  document.addEventListener('touchstart',e=>{if(e.target.closest('button,label,.photo-modal,.gallery-scene,.letter-scene'))return;startX=e.changedTouches[0].clientX;startY=e.changedTouches[0].clientY;},{passive:true});
  document.addEventListener('touchend',e=>{if(e.target.closest('button,label,.photo-modal,.gallery-scene,.letter-scene'))return;const dx=e.changedTouches[0].clientX-startX,dy=e.changedTouches[0].clientY-startY;if(Math.abs(dx)>70&&Math.abs(dx)>Math.abs(dy)*1.3){const i=scenes.indexOf(currentScene);goTo(scenes[Math.max(0,Math.min(scenes.length-1,i+(dx<0?1:-1)))]);}},{passive:true});
})();