/* ---------- carrito de compras ---------- */
/* Estado en memoria: se reinicia al recargar la página.
   Si más adelante conectas una base de datos, aquí es donde
   guardarías/leerías el carrito en vez de en la variable "cart". */

const WHATSAPP_NUMBER = "5216460000000"; // reemplaza por tu número real, formato 52 + 10 dígitos

let cart = []; // [{id, qty}]

function fmtMoney(n){ return "$" + n.toLocaleString("es-MX"); }

function findProduct(id){ return PRODUCTS.find(p => p.id === id); }

function addToCart(id, qty = 1){
  const line = cart.find(l => l.id === id);
  if(line){ line.qty += qty; } else { cart.push({ id, qty }); }
  renderCart();
  openCart();
}

function removeFromCart(id){
  cart = cart.filter(l => l.id !== id);
  renderCart();
}

function changeQty(id, delta){
  const line = cart.find(l => l.id === id);
  if(!line) return;
  line.qty += delta;
  if(line.qty <= 0){ removeFromCart(id); return; }
  renderCart();
}

function clearCart(){
  cart = [];
  renderCart();
}

function cartCount(){
  return cart.reduce((sum, l) => sum + l.qty, 0);
}

function cartSubtotal(){
  return cart.reduce((sum, l) => {
    const p = findProduct(l.id);
    return p ? sum + p.price * l.qty : sum;
  }, 0);
}

function openCart(){
  document.getElementById('cartDrawer').classList.add('open');
  document.getElementById('cartOverlay').classList.add('open');
}
function closeCart(){
  document.getElementById('cartDrawer').classList.remove('open');
  document.getElementById('cartOverlay').classList.remove('open');
}

function renderCart(){
  document.getElementById('cartCount').textContent = cartCount();

  const itemsBox = document.getElementById('cartItems');
  const footer = document.getElementById('cartFooter');

  if(cart.length === 0){
    itemsBox.innerHTML = `
      <div class="cart-empty">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 6h2l2.4 12.2a2 2 0 0 0 2 1.6h7.6a2 2 0 0 0 2-1.6L21 8H6"/><circle cx="10" cy="21" r="1"/><circle cx="17" cy="21" r="1"/></svg>
        <p>Tu carrito está vacío.<br>Agrega productos desde el catálogo.</p>
      </div>`;
    footer.style.display = 'none';
    return;
  }

  footer.style.display = 'block';
  itemsBox.innerHTML = cart.map(line => {
    const p = findProduct(line.id);
    if(!p) return '';
    return `
      <div class="cart-item">
        <img src="${p.img}" alt="${p.name}">
        <div class="cart-item-info">
          <span class="cart-item-brand">${p.brand}</span>
          <span class="cart-item-name">${p.name}</span>
          <div class="qty-stepper">
            <button data-action="dec" data-id="${p.id}" aria-label="Quitar uno">−</button>
            <span>${line.qty}</span>
            <button data-action="inc" data-id="${p.id}" aria-label="Agregar uno">+</button>
          </div>
          <span class="cart-item-price">${fmtMoney(p.price * line.qty)}</span>
        </div>
        <button class="cart-item-remove" data-action="remove" data-id="${p.id}">Quitar</button>
      </div>`;
  }).join('');

  document.getElementById('cartSubtotal').textContent = fmtMoney(cartSubtotal());
}

function buildWhatsAppMessage(){
  const lines = cart.map(line => {
    const p = findProduct(line.id);
    return `• ${line.qty} x ${p.brand} — ${p.name} (${fmtMoney(p.price)} c/u)`;
  });
  const total = `\nTotal estimado: ${fmtMoney(cartSubtotal())}`;
  const msg = `Hola, quiero pedir lo siguiente en Luna Distribuidores:\n\n${lines.join('\n')}${total}`;
  return encodeURIComponent(msg);
}

function initCart(){
  document.getElementById('cartBtn').addEventListener('click', openCart);
  document.getElementById('cartClose').addEventListener('click', closeCart);
  document.getElementById('cartOverlay').addEventListener('click', closeCart);

  document.getElementById('cartItems').addEventListener('click', e => {
    const btn = e.target.closest('button[data-action]');
    if(!btn) return;
    const id = Number(btn.dataset.id);
    if(btn.dataset.action === 'inc') changeQty(id, 1);
    if(btn.dataset.action === 'dec') changeQty(id, -1);
    if(btn.dataset.action === 'remove') removeFromCart(id);
  });

  document.getElementById('checkoutBtn').addEventListener('click', () => {
    if(cart.length === 0) return;
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${buildWhatsAppMessage()}`;
    window.open(url, '_blank');
    clearCart();
    closeCart();
  });

  renderCart();
}
