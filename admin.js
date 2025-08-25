if(!localStorage.getItem("adminLoggedIn")){
  window.location.href="login.html";
}
function logout(){
  localStorage.removeItem("adminLoggedIn");
  window.location.href="login.html";
}
const ordersDiv = document.getElementById("orders");
firebase.database().ref("orders").on("value", snapshot => {
  ordersDiv.innerHTML = "";
  snapshot.forEach(orderSnap => {
    const order = orderSnap.val();
    const div = document.createElement("div");
    div.innerHTML = `<h3>${order.orderId}</h3>
      <p>${order.name} - ${order.phone}</p>
      <p>Address: ${order.address}</p>
      <p>Status: ${order.status}</p>
      <p>Payment: ${order.paymentStatus}</p>
      <button onclick="updateStatus('${order.orderId}','Preparing')">Preparing</button>
      <button onclick="updateStatus('${order.orderId}','Out for Delivery')">Out for Delivery</button>
      <button onclick="updateStatus('${order.orderId}','Delivered')">Delivered</button>
      <button onclick="updatePayment('${order.orderId}','Paid')">Mark Paid</button>
      <button onclick="deleteOrder('${order.orderId}')">Delete</button>`;
    ordersDiv.appendChild(div);
  });
});

function updateStatus(orderId,status){
  firebase.database().ref("orders/"+orderId).update({status});
}
function updatePayment(orderId,paymentStatus){
  firebase.database().ref("orders/"+orderId).update({paymentStatus});
}
function deleteOrder(orderId){
  firebase.database().ref("orders/"+orderId).remove();
}

document.getElementById("menuForm").addEventListener("submit", function(e){
  e.preventDefault();
  const name = document.getElementById("itemName").value;
  const price = document.getElementById("itemPrice").value;
  const image = document.getElementById("itemImage").value;
  const id = "M"+Date.now();
  firebase.database().ref("menu/"+id).set({name,price,image});
});