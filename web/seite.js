/* Seitenlogik ohne Animation: Nav, FAQ, Kalender-Attrappe, Formular-Attrappe.
   Alles Bewegte liegt in bewegung.js. */
(function(){
'use strict';
var $  = function(s,c){return (c||document).querySelector(s);};
var $$ = function(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s));};

var nav = $('#nav'), burger = $('#burger'), mob = $('#mobmenu');
function navPruefen(){ nav.classList.toggle('nav--fest', window.scrollY > 40); }
navPruefen(); window.addEventListener('scroll', navPruefen, {passive:true});
if (burger) {
  burger.addEventListener('click', function(){
    var auf = mob.classList.toggle('mobmenu--auf');
    burger.classList.toggle('burger--auf', auf);
    burger.setAttribute('aria-expanded', auf ? 'true':'false');
    document.body.style.overflow = auf ? 'hidden' : '';
  });
  $$('#mobmenu a').forEach(function(a){ a.addEventListener('click', function(){
    mob.classList.remove('mobmenu--auf'); burger.classList.remove('burger--auf');
    burger.setAttribute('aria-expanded','false'); document.body.style.overflow='';
  });});
}

$$('#faqListe .f-item').forEach(function(item){
  var q = $('.f-q', item), a = $('.f-a', item), inn = $('.f-a__in', item);
  q.addEventListener('click', function(){
    var auf = item.classList.contains('f-item--auf');
    $$('#faqListe .f-item').forEach(function(o){
      o.classList.remove('f-item--auf'); $('.f-a', o).style.height = '0px'; $('.f-q', o).setAttribute('aria-expanded','false');
    });
    if(!auf){ item.classList.add('f-item--auf'); a.style.height = inn.offsetHeight + 'px'; q.setAttribute('aria-expanded','true'); }
  });
});
window.addEventListener('resize', function(){
  var offen = $('#faqListe .f-item--auf');
  if(offen){ $('.f-a', offen).style.height = $('.f-a__in', offen).offsetHeight + 'px'; }
});

$$('#slots .slot').forEach(function(s){
  s.addEventListener('click', function(){
    $$('#slots .slot').forEach(function(o){ o.classList.remove('slot--an'); });
    s.classList.add('slot--an'); $('#slotBtn').textContent = s.dataset.t + ' bestätigen';
  });
});
var dl = $('#dlForm');
if (dl) dl.addEventListener('submit', function(e){ e.preventDefault(); var b = $('#dlForm button'); b.textContent = 'Unterwegs ✓'; b.disabled = true; });
})();
