document.addEventListener("DOMContentLoaded",()=>{
  if(!localStorage.getItem("admin")){ window.location.href="login.html"; }
  const db = firebase.database();
  const ordersDiv=document.getElementById("orders");
  db.ref("orders").on("value",snap=>{
    ordersDiv.innerHTML="";
    snap.forEach(o=>{
      const val=o.val();
      const div=document.createElement("div");
      div.className="order";
      div.innerHTML=`<h3>${val.id}</h3><p>${val.name} - ${val.phone}</p>
      <p>Status: <input value="${val.status}" onchange="updateOrder('${val.id}','status',this.value)" /></p>
      <p>Payment: <input value="${val.paymentStatus}" onchange="updateOrder('${val.id}','paymentStatus',this.value)" /></p>
      <button onclick="deleteOrder('${val.id}')">Delete</button>`;
      ordersDiv.appendChild(div);
    });
  });

  window.updateOrder=function(id,field,value){ db.ref("orders/"+id+"/"+field).set(value); }
  window.deleteOrder=function(id){ db.ref("orders/"+id).remove(); }
  window.logout=function(){ localStorage.removeItem("admin"); window.location.href="login.html"; }

  document.getElementById("menuForm").addEventListener("submit",e=>{
    e.preventDefault();
    const name=document.getElementById("itemName").value;
    const price=document.getElementById("itemPrice").value;
    const image=document.getElementById("itemImage").value;
    const id="M"+Date.now();
    db.ref("menu/"+id).set({id,name,price,image});
    e.target.reset();
  });
});