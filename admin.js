// admin.js — admin panel logic
(function(){
  if(sessionStorage.getItem('adminLoggedIn') !== 'true'){
    window.location.href = 'login.html';
    return;
  }

  firebase.initializeApp(window.FB_CONFIG);
  const db = firebase.database();
  const tbody = document.getElementById('ordersBody');
  const logoutBtn = document.getElementById('logoutBtn');
  logoutBtn.addEventListener('click', ()=>{
    sessionStorage.removeItem('adminLoggedIn');
    window.location.href = 'login.html';
  });

  function fmt(t){
    const d = new Date(t);
    const pad = n=>String(n).padStart(2,'0');
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  function rowTemplate(key, v){
    const paidClass = /Paid/i.test(v.paymentStatus||'') ? 'paid':'pending';
    return `<tr data-key="${key}">
      <td>${v.orderId||'-'}</td>
      <td>${v.name||'-'}</td>
      <td>${v.phone||'-'}</td>
      <td>${v.address||'-'}</td>
      <td>${v.product||'-'}</td>
      <td>${v.qty||0}</td>
      <td>${(v.total||0).toFixed? v.total.toFixed(2).replace(/\.00$/,'') : v.total}</td>
      <td>
        <select class="paySel">
          <option ${v.paymentStatus==='Pending (COD)'?'selected':''}>Pending (COD)</option>
          <option ${v.paymentStatus==='Pending (UPI)'?'selected':''}>Pending (UPI)</option>
          <option ${v.paymentStatus==='Paid'?'selected':''}>Paid</option>
        </select>
        <span class="badge ${paidClass}" style="margin-left:6px">${v.paymentStatus||'-'}</span>
      </td>
      <td>
        <select class="statSel">
          <option ${v.orderStatus==='Pending'?'selected':''}>Pending</option>
          <option ${v.orderStatus==='Preparing'?'selected':''}>Preparing</option>
          <option ${v.orderStatus==='Prepared'?'selected':''}>Prepared</option>
          <option ${v.orderStatus==='Out for Delivery'?'selected':''}>Out for Delivery</option>
          <option ${v.orderStatus==='Delivered'?'selected':''}>Delivered</option>
          <option ${v.orderStatus==='Cancelled'?'selected':''}>Cancelled</option>
        </select>
      </td>
      <td>${v.createdAt? fmt(v.createdAt): '-'}</td>
      <td>
        <button class="btn btn-secondary saveBtn">Save</button>
        <button class="btn btn-danger delBtn">Delete</button>
      </td>
    </tr>`;
  }

  function bindRow(tr, key){
    const paySel = tr.querySelector('.paySel');
    const statSel = tr.querySelector('.statSel');
    const saveBtn = tr.querySelector('.saveBtn');
    const delBtn = tr.querySelector('.delBtn');
    const badge = tr.querySelector('.badge');

    paySel.addEventListener('change', ()=>{
      badge.textContent = paySel.value;
      badge.className = 'badge ' + (/Paid/i.test(paySel.value)?'paid':'pending');
    });

    saveBtn.addEventListener('click', async ()=>{
      const updates = {
        paymentStatus: paySel.value,
        orderStatus: statSel.value
      };
      await db.ref('orders/'+key).update(updates);
      saveBtn.textContent = 'Saved';
      setTimeout(()=> saveBtn.textContent='Save', 1200);
    });

    delBtn.addEventListener('click', async ()=>{
      if(confirm('Delete this order?')){
        await db.ref('orders/'+key).remove();
      }
    });
  }

  function render(snapshot){
    tbody.innerHTML='';
    const arr = [];
    snapshot.forEach(ch=> arr.push({key: ch.key, val: ch.val()}));
    // newest first
    arr.sort((a,b)=> (b.val.createdAt||0) - (a.val.createdAt||0));
    for(const {key,val} of arr){
      const tmp = document.createElement('tbody');
      tmp.innerHTML = rowTemplate(key,val);
      const tr = tmp.firstElementChild;
      tbody.appendChild(tr);
      bindRow(tr, key);
    }
  }

  // Live updates
  db.ref('orders').on('value', render);
})();
