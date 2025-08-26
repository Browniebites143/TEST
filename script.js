
/* Brownie Bite - Client logic */
(function(){
  if(!window.firebase || !window.firebaseConfig){
    console.error('Firebase libraries/config missing');
    alert('Setup error: Firebase not loaded.');
    return;
  }
  firebase.initializeApp(window.firebaseConfig);
  const db = firebase.database();

  const prices = { Classic:40, Walnut:50, Oreo:50, ChocoChip:50 };
  const upiId = "9380248566@fam";
  const payeeName = "Brownie Bite";

  const $ = (id)=>document.getElementById(id);
  const form = $('orderForm');
  const productSel = $('product');
  const qtyInput = $('qty');
  const totalEl = $('totalAmt');
  const thanksModal = $('thanksModal');
  const popOrderId = $('popOrderId');
  const closeModal = $('closeModal');
  const upiChooser = $('upiChooser');

  function updateTotal(){
    const p = productSel.value;
    const q = Math.max(1, parseInt(qtyInput.value || '1',10));
    const total = (prices[p]||0) * q;
    totalEl.textContent = '₹' + total;
    return total;
  }
  productSel.addEventListener('change', updateTotal);
  qtyInput.addEventListener('input', updateTotal);
  updateTotal();

  // Show/hide UPI chooser
  document.querySelectorAll('input[name="pay"]').forEach(r => {
    r.addEventListener('change', e => {
      upiChooser.style.display = (e.target.value === 'UPI') ? 'block' : 'none';
    });
  });

  // Track Order
  $('trackBtn').addEventListener('click', async () => {
    const id = $('trackId').value.trim();
    if(!id){ return; }
    const snap = await db.ref('orders/'+id).once('value');
    if(!snap.exists()){ $('trackResult').textContent = 'Order not found.'; return; }
    const o = snap.val();
    $('trackResult').textContent = `Status: ${o.orderStatus} • Payment: ${o.paymentStatus}`;
  });

  function genOrderId(){
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth()+1).padStart(2,'0');
    const day = String(d.getDate()).padStart(2,'0');
    const rand = Math.floor(Math.random()*9000)+1000;
    return `BB-${y}${m}${day}-${rand}`;
  }

  function makeUPIUri(app, {amount, orderId}){
    const base = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&am=${encodeURIComponent(amount)}&cu=INR&tn=${encodeURIComponent(orderId)}`;
    switch(app){
      case 'gpay':    return base; // intent handled by Android; iOS opens GPay if installed
      case 'phonepe': return base + '&mc=0000';
      case 'paytm':   return base;
      case 'bhim':    return base;
      case 'fampay':  return base;
      default:        return base;
    }
  }

  function openUPI(app, amount, orderId){
    const uri = makeUPIUri(app,{amount,orderId});
    // Try direct navigation; for iOS Safari deep links, target=_blank is often needed
    window.location.href = uri;
  }

  // Bind inline app buttons inside chooser (before placing order).
  upiChooser.addEventListener('click', (e)=>{
    const btn = e.target.closest('[data-upiapp]');
    if(!btn) return;
    const app = btn.getAttribute('data-upiapp');
    const amount = updateTotal();
    // Preview only: we don't open before placing order.
    alert(`Selected ${app.toUpperCase()}. Place order to continue.`);
  });

  // Place order handler
  form.addEventListener('submit', async (ev)=>{
    ev.preventDefault();
    const name = $('name').value.trim();
    const phone = $('phone').value.trim();
    const address = $('address').value.trim();
    const email = $('email').value.trim();
    const product = productSel.value;
    const qty = Math.max(1, parseInt(qtyInput.value||'1',10));
    const total = updateTotal();
    const payMethod = document.querySelector('input[name="pay"]:checked').value;
    const orderId = genOrderId();

    if(!name || !phone || !address){ alert('Please fill required fields.'); return; }

    const order = {
      orderId, name, phone, address, email: email||null,
      product, qty, total,
      createdAt: new Date().toISOString(),
      paymentMethod: payMethod,
      paymentStatus: (payMethod==='COD' ? 'COD' : 'Pending'),
      orderStatus: 'Pending'
    };

    try{
      await db.ref('orders/'+orderId).set(order);
    }catch(e){
      console.error(e);
      alert('Could not save order. Check Firebase rules / config.');
      return;
    }

    // Pop modal with Order ID
    popOrderId.textContent = orderId;
    thanksModal.style.display = 'flex';

    // If UPI, wire post-modal links
    const showUPI = (payMethod==='UPI');
    document.getElementById('postOrderUPI').style.display = showUPI ? 'block' : 'none';
    const linkIds = ['goGPay','goPhonePe','goPaytm','goBHIM','goFamPay','goGeneric'];
    const apps    = ['gpay', 'phonepe', 'paytm', 'bhim', 'fampay', 'generic'];
    linkIds.forEach((lid, idx)=>{
      const a = document.getElementById(lid);
      if(!a) return;
      const uri = makeUPIUri(apps[idx], {amount: total, orderId});
      a.setAttribute('href', uri);
    });

    // Close -> Thank you
    closeModal.onclick = ()=>{
      thanksModal.style.display = 'none';
      // go to thankyou with ID
      window.location.href = 'thankyou.html?id=' + encodeURIComponent(orderId);
    };
  });

})();
