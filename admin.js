
/* Brownie Bite - Admin logic */
(function(){
  if(sessionStorage.getItem('adminLoggedIn')!=='true'){
    window.location.href = 'login.html';
    return;
  }
  if(!window.firebase || !window.firebaseConfig){
    alert('Firebase not loaded');
    return;
  }
  firebase.initializeApp(window.firebaseConfig);
  const db = firebase.database();

  const $ = (sel,root=document)=>root.querySelector(sel);
  const tbody = $('#ordersTable tbody');
  const logoutBtn = $('#logoutBtn');
  logoutBtn.addEventListener('click', ()=>{
    sessionStorage.removeItem('adminLoggedIn');
    location.href = 'login.html';
  });

  function row(o){
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${new Date(o.createdAt).toLocaleString()}</td>
      <td><code>${o.orderId}</code></td>
      <td>${o.name}</td>
      <td>${o.phone}</td>
      <td style="max-width:280px">${o.address}</td>
      <td>${o.product}</td>
      <td>${o.qty}</td>
      <td>₹${o.total}</td>
      <td>
        <select data-field="paymentStatus">
          <option ${o.paymentStatus==='Pending'?'selected':''}>Pending</option>
          <option ${o.paymentStatus==='Paid'?'selected':''}>Paid</option>
          <option ${o.paymentStatus==='COD'?'selected':''}>COD</option>
        </select>
      </td>
      <td>
        <select data-field="orderStatus">
          <option ${o.orderStatus==='Pending'?'selected':''}>Pending</option>
          <option ${o.orderStatus==='Preparing'?'selected':''}>Preparing</option>
          <option ${o.orderStatus==='Prepared'?'selected':''}>Prepared</option>
          <option ${o.orderStatus==='Out for delivery'?'selected':''}>Out for delivery</option>
          <option ${o.orderStatus==='Delivered'?'selected':''}>Delivered</option>
          <option ${o.orderStatus==='Cancelled'?'selected':''}>Cancelled</option>
        </select>
      </td>
      <td>
        <button class="btn-secondary" data-act="save">Save</button>
        <button class="btn-danger" data-act="del">Delete</button>
      </td>
    `;
    tr.dataset.id = o.orderId;
    return tr;
  }

  // live listener
  db.ref('orders').on('value', snap => {
    tbody.innerHTML = '';
    const data = snap.val() || {};
    // sort by createdAt desc
    const list = Object.values(data).sort((a,b)=> new Date(b.createdAt)-new Date(a.createdAt));
    list.forEach(o => tbody.appendChild(row(o)));
  });

  // actions
  tbody.addEventListener('click', async (e)=>{
    const tr = e.target.closest('tr');
    if(!tr) return;
    const id = tr.dataset.id;
    if(e.target.matches('[data-act="del"]')){
      if(confirm('Delete order '+id+'?')){
        await db.ref('orders/'+id).remove();
      }
      return;
    }
    if(e.target.matches('[data-act="save"]')){
      const selects = tr.querySelectorAll('select');
      const upd = {};
      selects.forEach(s => upd[s.getAttribute('data-field')] = s.value);
      await db.ref('orders/'+id).update(upd);
      alert('Saved.');
      return;
    }
  });

})();
