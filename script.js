const nav=document.querySelector('.nav');
const progress=document.querySelector('.scroll-progress span');
const sectionLabel=document.querySelector('.section-label');
const flash=document.querySelector('.film-flash');
const titleCard=document.querySelector('.film-title-card');
const dot=document.querySelector('.cursor-dot');
const ring=document.querySelector('.cursor-ring');

function updateScroll(){
  nav.classList.toggle('scrolled',scrollY>30);
  const max=document.documentElement.scrollHeight-innerHeight;
  if(progress) progress.style.height=`${max>0?(scrollY/max)*100:0}%`;
  const sections=[...document.querySelectorAll('section[data-section]')];
  let current='01 / HERO';
  sections.forEach((s,i)=>{
    if(s.getBoundingClientRect().top<=innerHeight*.45)
      current=`${String(i+1).padStart(2,'0')} / ${s.dataset.section.toUpperCase()}`;
  });
  if(sectionLabel) sectionLabel.textContent=current;
}
addEventListener('scroll',updateScroll,{passive:true});

/* Every section gets an intentional entrance, not one generic fade. */
const sectionObserver=new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if(!e.isIntersecting)return;
    e.target.classList.add('is-visible');
    if (e.target.id === 'crew') {
      e.target.querySelector('.people')?.classList.add('is-visible');
    }
    sectionObserver.unobserve(e.target);
  });
},{threshold:.12,rootMargin:'0px 0px -8% 0px'});
document.querySelectorAll('.section-reveal').forEach(s=>sectionObserver.observe(s));

/* Films stagger independently. */
const filmObserver=new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if(!e.isIntersecting)return;
    e.target.classList.add('is-visible');
    filmObserver.unobserve(e.target);
  });
},{threshold:.18});
document.querySelectorAll('.film-scene').forEach(f=>filmObserver.observe(f));

/* Cinematic poster interaction: subtle 3D tilt. */
if(matchMedia('(pointer:fine)').matches){
  document.querySelectorAll('.film-scene .poster').forEach(card=>{
    card.addEventListener('mousemove',e=>{
      const r=card.getBoundingClientRect();
      const x=(e.clientX-r.left)/r.width-.5;
      const y=(e.clientY-r.top)/r.height-.5;
      card.style.transform=`perspective(900px) rotateY(${x*3}deg) rotateX(${-y*3}deg) scale(1.01)`;
    });
    card.addEventListener('mouseleave',()=>card.style.transform='');
  });

  document.querySelector('.contact')?.addEventListener('mousemove',e=>{
    const r=e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--spot-x',`${e.clientX-r.left}px`);
    e.currentTarget.style.setProperty('--spot-y',`${e.clientY-r.top}px`);
  });

  let mx=innerWidth/2,my=innerHeight/2,rx=mx,ry=my;
  addEventListener('mousemove',e=>{
    mx=e.clientX;my=e.clientY;
    if(dot){dot.style.left=mx+'px';dot.style.top=my+'px'}
  });
  function cursor(){
    rx+=(mx-rx)*.14;ry+=(my-ry)*.14;
    if(ring){ring.style.left=rx+'px';ring.style.top=ry+'px'}
    requestAnimationFrame(cursor);
  }
  cursor();
  document.querySelectorAll('a').forEach(a=>{
    a.addEventListener('mouseenter',()=>ring?.classList.add('active'));
    a.addEventListener('mouseleave',()=>ring?.classList.remove('active'));
  });
}

/* Film links get a very short cinema transition before leaving the site. */
document.querySelectorAll('.film-scene .poster,.film-info>a').forEach(link=>{
  link.addEventListener('click',e=>{
    if(!link.href.includes('youtu')) return;
    e.preventDefault();
    const name=link.closest('.film-scene')?.querySelector('h3')?.innerText.replace('\\n',' ') || 'FILM';
    if(titleCard){
      titleCard.querySelector('b').textContent=name;
      titleCard.classList.add('show');
    }
    flash?.classList.add('play');
    setTimeout(()=>window.open(link.href,'_blank','noopener'),650);
    setTimeout(()=>{
      titleCard?.classList.remove('show');
      flash?.classList.remove('play');
    },950);
  });
});

document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{
  const target=document.querySelector(a.getAttribute('href'));
  if(!target)return;
  e.preventDefault();
  target.scrollIntoView({behavior:'smooth'});
}));

updateScroll();


/* Cinematic intro: always release into the actual website. */
window.addEventListener('load',()=>{
  const intro=document.getElementById('intro');
  if(!intro) return;
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduced){
    intro.remove();
    return;
  }
  setTimeout(()=>intro.classList.add('intro-exit'),3000);
  setTimeout(()=>intro.remove(),4200);
});
