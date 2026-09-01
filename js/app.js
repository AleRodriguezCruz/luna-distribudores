/* ---------- estado de filtros del catálogo ---------- */
let state = { cats:new Set(), brands:new Set(), sizes:new Set(), maxPrice:1000, sort:"relevance", query:"" };

function cardInnerHTML(p){
  return `
      <div class="card-media">
        ${p.old ? `<span class="card-tag">REBAJA</span>` : ''}
        <img src="${p.img}" alt="${p.brand} — ${p.name}" loading="lazy">
        <button class="card-add" data-id="${p.id}">Agregar al carrito</button>
      </div>
      <div class="card-body">
        <div class="card-brand">${p.brand}</div>
        <div class="card-name">${p.name}</div>
        <div class="card-price-row">
          <span class="card-price">${fmtMoney(p.price)}</span>
          ${p.old ? `<span class="card-price-old">${fmtMoney(p.old)}</span>` : ''}
        </div>
        <div class="card-sizes">Tallas: ${p.sizes.join(' · ')}</div>
      </div>`;
}

function productCardHTML(p){
  return `<div class="card">${cardInnerHTML(p)}</div>`;
}

/* ---------- filtros ---------- */
function buildFilters(){
  const catBox = document.getElementById('catFilters');
  CATS.forEach(c=>{
    const count = PRODUCTS.filter(p=>p.cat===c.id).length;
    const row = document.createElement('label');
    row.className='filter-option';
    row.innerHTML = `<span><input type="checkbox" data-type="cat" value="${c.id}"> ${c.label}</span><span class="count">${count}</span>`;
    catBox.appendChild(row);
  });

  const brandBox = document.getElementById('brandFilters');
  BRANDS.forEach(b=>{
    const count = PRODUCTS.filter(p=>p.brand===b).length;
    const row = document.createElement('label');
    row.className='filter-option';
    row.innerHTML = `<span><input type="checkbox" data-type="brand" value="${b}"> ${b}</span><span class="count">${count}</span>`;
    brandBox.appendChild(row);
  });

  const sizeBox = document.getElementById('sizeFilters');
  SIZES.forEach(s=>{
    const el = document.createElement('button');
    el.className='size-pill'; el.textContent=s; el.dataset.size=s;
    el.addEventListener('click', ()=>{
      el.classList.toggle('active');
      state.sizes.has(s) ? state.sizes.delete(s) : state.sizes.add(s);
      renderCatalog();
    });
    sizeBox.appendChild(el);
  });

  const maxAvailable = Math.max(...PRODUCTS.map(p=>p.price));
  state.maxPrice = maxAvailable;
  const priceRange = document.getElementById('priceRange');
  priceRange.max = maxAvailable;
  priceRange.value = maxAvailable;
  document.getElementById('priceLabel').textContent = `Hasta ${fmtMoney(maxAvailable)}`;

  catBox.addEventListener('change', e=>{
    if(e.target.dataset.type==='cat'){
      e.target.checked ? state.cats.add(e.target.value) : state.cats.delete(e.target.value);
      renderCatalog();
    }
  });
  brandBox.addEventListener('change', e=>{
    if(e.target.dataset.type==='brand'){
      e.target.checked ? state.brands.add(e.target.value) : state.brands.delete(e.target.value);
      syncBrandChips();
      renderCatalog();
    }
  });
}

function syncBrandChips(){
  document.querySelectorAll('.brand-chip').forEach(chip=>{
    chip.classList.toggle('active', state.brands.has(chip.dataset.brand));
  });
}

function filteredProducts(){
  const q = state.query.trim().toLowerCase();
  let list = PRODUCTS.filter(p=>{
    if(state.cats.size && !state.cats.has(p.cat)) return false;
    if(state.brands.size && !state.brands.has(p.brand)) return false;
    if(state.sizes.size && !p.sizes.some(s=>state.sizes.has(s))) return false;
    if(p.price > state.maxPrice) return false;
    if(q && !(`${p.brand} ${p.name}`.toLowerCase().includes(q))) return false;
    return true;
  });
  if(state.sort==='price-asc') list.sort((a,b)=>a.price-b.price);
  if(state.sort==='price-desc') list.sort((a,b)=>b.price-a.price);
  if(state.sort==='name') list.sort((a,b)=>a.name.localeCompare(b.name));
  return list;
}

function renderCatalog(){
  const grid = document.getElementById('productGrid');
  const list = filteredProducts();

  grid.innerHTML = list.length
    ? list.map(productCardHTML).join('')
    : `<div class="empty-state"><h3>No encontramos productos con esos filtros</h3><p>Intenta quitar alguno de los filtros seleccionados.</p></div>`;

  const countText = `${list.length} producto${list.length===1?'':'s'}`;
  document.getElementById('resultCount').textContent = `Mostrando ${countText}`;
  document.getElementById('toolbarCount').textContent = countText;
}

/* ---------- carrusel de destacados ---------- */
function renderCarousel(){
  const track = document.getElementById('carouselTrack');
  const featured = PRODUCTS.filter(p=>p.featured);
  track.innerHTML = featured.map(p=>`<div class="carousel-card">${cardInnerHTML(p)}</div>`).join('');

  const dotsBox = document.getElementById('carouselDots');
  dotsBox.innerHTML = featured.map((_,i)=>`<button class="carousel-dot ${i===0?'active':''}" data-index="${i}"></button>`).join('');

  const cards = track.querySelectorAll('.carousel-card');
  const dots = dotsBox.querySelectorAll('.carousel-dot');

  function updateDots(){
    const scrollLeft = track.scrollLeft;
    let closest = 0, closestDist = Infinity;
    cards.forEach((card,i)=>{
      const dist = Math.abs(card.offsetLeft - scrollLeft);
      if(dist < closestDist){ closestDist = dist; closest = i; }
    });
    dots.forEach((d,i)=> d.classList.toggle('active', i===closest));
  }

  let scrollTimeout;
  track.addEventListener('scroll', ()=>{
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(updateDots, 80);
  });

  dots.forEach((dot,i)=>{
    dot.addEventListener('click', ()=>{
      cards[i].scrollIntoView({behavior:'smooth', inline:'start', block:'nearest'});
    });
  });

  document.getElementById('carouselPrev').addEventListener('click', ()=>{
    track.scrollBy({left:-260, behavior:'smooth'});
  });
  document.getElementById('carouselNext').addEventListener('click', ()=>{
    track.scrollBy({left:260, behavior:'smooth'});
  });
}

/* ---------- eventos globales de "agregar al carrito" ---------- */
function wireAddToCart(){
  document.addEventListener('click', e=>{
    const btn = e.target.closest('.card-add');
    if(!btn) return;
    const id = Number(btn.dataset.id);
    addToCart(id, 1);
    const original = btn.textContent;
    btn.textContent = 'Agregado ✓';
    setTimeout(()=>{ btn.textContent = original; }, 1000);
  });
}

/* ---------- controles de la barra de herramientas ---------- */
function wireToolbar(){
  document.getElementById('sortSelect').addEventListener('change', e=>{
    state.sort = e.target.value; renderCatalog();
  });

  document.getElementById('priceRange').addEventListener('input', e=>{
    state.maxPrice = Number(e.target.value);
    document.getElementById('priceLabel').textContent = `Hasta ${fmtMoney(state.maxPrice)}`;
    renderCatalog();
  });

  document.getElementById('clearFilters').addEventListener('click', ()=>{
    const maxAvailable = Math.max(...PRODUCTS.map(p=>p.price));
    state = {cats:new Set(), brands:new Set(), sizes:new Set(), maxPrice:maxAvailable, sort:state.sort};
    document.querySelectorAll('#catFilters input, #brandFilters input').forEach(i=>i.checked=false);
    document.querySelectorAll('.size-pill').forEach(s=>s.classList.remove('active'));
    document.getElementById('priceRange').value = maxAvailable;
    document.getElementById('priceLabel').textContent = `Hasta ${fmtMoney(maxAvailable)}`;
    syncBrandChips();
    renderCatalog();
  });

  document.querySelectorAll('.brand-chip').forEach(chip=>{
    chip.addEventListener('click', ()=>{
      const b = chip.dataset.brand;
      state.brands.has(b) ? state.brands.delete(b) : state.brands.add(b);
      document.querySelectorAll(`#brandFilters input[value="${CSS.escape(b)}"]`).forEach(i=>i.checked = state.brands.has(b));
      syncBrandChips();
      renderCatalog();
      document.getElementById('catalogo').scrollIntoView({behavior:'smooth'});
    });
  });

  document.querySelectorAll('nav.primary a[data-cat]').forEach(a=>{
    a.addEventListener('click', ()=>{
      const cat = a.dataset.cat;
      state.cats = new Set([cat]);
      document.querySelectorAll('#catFilters input').forEach(i=> i.checked = i.value===cat);
      renderCatalog();
    });
  });

  document.getElementById('filtersToggle').addEventListener('click', ()=>{
    document.getElementById('filters').classList.toggle('open');
  });

  document.getElementById('menuToggle').addEventListener('click', ()=>{
    const nav = document.querySelector('nav.primary');
    const isOpen = nav.style.display === 'flex';
    nav.style.display = isOpen ? 'none' : 'flex';
    nav.style.flexDirection = 'column';
    nav.style.position='absolute'; nav.style.top='100%'; nav.style.left='0'; nav.style.right='0';
    nav.style.background='#fff'; nav.style.padding='16px 24px'; nav.style.borderTop='1px solid var(--line)';
  });
}

/* ---------- buscador ---------- */
function searchMatches(q){
  const query = q.trim().toLowerCase();
  if(!query) return [];
  return PRODUCTS.filter(p => `${p.brand} ${p.name}`.toLowerCase().includes(query)).slice(0, 6);
}

function renderSearchResults(q){
  const box = document.getElementById('searchResults');
  const query = q.trim();

  if(!query){
    box.classList.remove('has-results');
    box.innerHTML = '';
    return;
  }

  const matches = searchMatches(query);
  box.classList.add('has-results');

  if(matches.length === 0){
    box.innerHTML = `<div class="search-empty">Sin resultados para "${query}". Intenta con otra marca o prenda.</div>`;
    return;
  }

  box.innerHTML = matches.map(p => `
    <a class="search-result-row" href="#catalogo" data-id="${p.id}">
      <img src="${p.img}" alt="">
      <div class="search-result-info">
        <div class="search-result-brand">${p.brand}</div>
        <div class="search-result-name">${p.name}</div>
      </div>
      <div class="search-result-price">${fmtMoney(p.price)}</div>
    </a>
  `).join('') + `<div class="search-see-all" id="searchSeeAll">Ver los ${matches.length < filteredCountFor(query) ? 'primeros' : 'los'} resultados en el catálogo →</div>`;
}

function filteredCountFor(query){
  return PRODUCTS.filter(p => `${p.brand} ${p.name}`.toLowerCase().includes(query.toLowerCase())).length;
}

function openSearch(){
  document.getElementById('searchBar').classList.add('open');
  setTimeout(()=> document.getElementById('searchInput').focus(), 150);
}
function closeSearch(){
  document.getElementById('searchBar').classList.remove('open');
  document.getElementById('searchInput').value = '';
  state.query = '';
  renderSearchResults('');
  renderCatalog();
}

function wireSearch(){
  const searchBar = document.getElementById('searchBar');
  const input = document.getElementById('searchInput');

  document.getElementById('searchBtn').addEventListener('click', ()=>{
    searchBar.classList.contains('open') ? closeSearch() : openSearch();
  });
  document.getElementById('searchClose').addEventListener('click', closeSearch);

  input.addEventListener('input', e=>{
    state.query = e.target.value;
    renderSearchResults(state.query);
    renderCatalog();
  });

  input.addEventListener('keydown', e=>{
    if(e.key === 'Enter'){
      closeSearchDropdownOnly();
      document.getElementById('catalogo').scrollIntoView({behavior:'smooth'});
    }
    if(e.key === 'Escape'){ closeSearch(); }
  });

  document.getElementById('searchResults').addEventListener('click', e=>{
    const row = e.target.closest('.search-result-row, #searchSeeAll');
    if(!row) return;
    closeSearchDropdownOnly();
  });

  function closeSearchDropdownOnly(){
    document.getElementById('searchResults').classList.remove('has-results');
  }
}

/* ---------- arranque ---------- */
document.addEventListener('DOMContentLoaded', ()=>{
  buildFilters();
  wireToolbar();
  wireAddToCart();
  wireSearch();
  renderCatalog();
  renderCarousel();
  initCart();
});
