// script.js — customer page logic
(function(){
  // Initialize Firebase
  firebase.initializeApp(window.FB_CONFIG);
  const db = firebase.database();

  // Elements
  const productEl = document.getElementById('product');
  const qtyEl = document.getElementById('qty');
  const totalEl = document.getElementById('totalAmt');
  const form = document.getElementById('orderForm');
  const codBtn = document.getElementById('codBtn');
  const payButtons = document.querySelectorAll('.pay-btn');
  const thanksModal = document.getElementById('thanksModal');
  const popOrderIdEl = document.getElementById('popOrderId');
  const closeModal = document.getElementById('closeModal');
  const trackBtn = document.getElementById('trackBtn');
  const trackId = document.getElementById('trackId');
  const trackResult = document.getElementById('trackResult');

  // Prices
  function getUnitPrice(){
    const op = productEl.options[productEl.selectedIndex];
    return Number(op.getAttribute('data-price') || 0);
  }
  function updateTotal(){
    const total = getUnitPrice() * Number(qtyEl.value || 1);
    totalEl.textContent = '₹' + total.toFixed(2).replace(/\.00$/,'');
  }
  productEl.addEventListener('change', updateTotal);
  qtyEl.addEventListener('input', updateTotal);
  updateTotal();

  // Order ID
  function genOrderId(){
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth()+1).padStart(2,'0');
    const dd = String(d.getDate()).padStart(2,'0');
    const rand = Math.floor(Math.random()*9000)+1000;
    return `BB-${yyyy}${mm}${dd}-${rand}`;
  }

  // Save Order
  async function saveOrder(payload){
    const ref = db.ref('orders').push();
    await ref.set(payload);
    return ref.key;
  }

  // Open UPI deep link
  function openUPI(app, amount, orderId){
    const pa = encodeURIComponent('9380248566@fam');
    const pn = encodeURIComponent('Brownie Bite');
    const am = encodeURIComponent(String(amount));
    const tn = encodeURIComponent(`Order ${orderId}`);
    const tr = encodeURIComponent(orderId);

    const base = `upi://pay?pa=${pa}&pn=${pn}&am=${am}&cu=INR&tn=${tn}&tr=${tr}`;

    // Per-app wrappers (some apps prefer custom scheme; most accept generic "upi://pay")
    const appSchemes = {
      gpay: `tez://upi/pay?pa=${pa}&pn=${pn}&am=${am}&cu=INR&tn=${tn}&tr=${tr}`,
      phonepe: `phonepe://pay?pa=${pa}&pn=${pn}&am=${am}&cu=INR&tn=${tn}&tr=${tr}`,
      paytm: `paytmmp://pay?pa=${pa}&pn=${pn}&am=${am}&cu=INR&tn=${tn}&tr=${tr}`,
      fampay: base
    };

    const url = appSchemes[app] || base;

    // Try opening the chosen app
    window.location.href = url;
  }

  // Create order object common fields
  function getOrderPayload(orderId, paymentMethod, paymentStatus){
    const name = document.getElementById('name').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const address = document.getElementById('address').value.trim();
    const email = document.getElementById('email').value.trim();
    const product = productEl.value;
    const qty = Number(qtyEl.value || 1);
    const total = getUnitPrice()*qty;

    return {
      orderId,
      name, phone, address, email,
      product, qty, total,
      paymentMethod,
      paymentStatus,      // "Paid" or "Pending (COD/UPI)"
      orderStatus: "Pending",
      createdAt: Date.now()
    };
  }

  // COD click: save & show modal
  codBtn.addEventListener('click', async () => {
    if(!form.reportValidity()) return;
    const orderId = genOrderId();
    const payload = getOrderPayload(orderId, 'COD', 'Pending (COD)');
    await saveOrder(payload);
    popOrderIdEl.textContent = orderId;
    thanksModal.style.display = 'flex';
  });
  if(closeModal){
    closeModal.addEventListener('click', ()=> thanksModal.style.display='none');
  }

  // UPI app buttons
  payButtons.forEach(btn => {
    btn.addEventListener('click', async () => {
      if(!form.reportValidity()) return;
      const app = btn.getAttribute('data-app');
      const orderId = genOrderId();
      const qty = Number(qtyEl.value || 1);
      const amount = getUnitPrice()*qty;

      // Save as Pending (UPI) before redirect; admin can mark Paid after verifying
      const payload = getOrderPayload(orderId, app.toUpperCase(), 'Pending (UPI)');
      await saveOrder(payload);

      // Stash orderId so thankyou page can show it (for browsers that come back)
      sessionStorage.setItem('lastOrderId', orderId);

      // Open UPI app
      openUPI(app, amount, orderId);

      // Fallback: after a short delay, move to thankyou with orderId
      setTimeout(()=>{
        window.location.href = `thankyou.html?orderId=${encodeURIComponent(orderId)}`;
      }, 1500);
    });
  });

  // Classic submit button (optional)
  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    // If submit pressed without selecting specific pay button, treat as COD
    codBtn.click();
  });

  // Track order
  trackBtn.addEventListener('click', async ()=>{
    const id = trackId.value.trim();
    if(!id){ trackResult.textContent = 'Enter an Order ID'; return; }
    const snap = await db.ref('orders').orderByChild('orderId').equalTo(id).once('value');
    if(!snap.exists()){
      trackResult.textContent = 'Order not found.';
      return;
    }
    let status = 'Pending';
    let pay = 'Pending';
    snap.forEach(child=>{
      const v = child.val();
      status = v.orderStatus || 'Pending';
      pay = v.paymentStatus || 'Pending';
    });
    trackResult.innerHTML = `Status: <span class="badge">${status}</span> • Payment: <span class="badge ${/Paid/i.test(pay)?'paid':'pending'}">${pay}</span>`;
  });

  // If we arrive from UPI and have stored orderId, show in thankyou
  if(location.pathname.endsWith('thankyou.html')){
    const p = new URLSearchParams(location.search);
    if(!p.get('orderId')){
      const cached = sessionStorage.getItem('lastOrderId');
      if(cached){
        const sep = location.search ? '&' : '?';
        history.replaceState(null,'',location.pathname + sep + 'orderId=' + encodeURIComponent(cached));
      }
    }
  }
})();
