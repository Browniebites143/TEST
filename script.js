document.addEventListener("DOMContentLoaded", () => {
  const db = firebase.database();
  const menuDiv = document.getElementById("menu-items");
  const form = document.getElementById("orderForm");

  // Load menu from DB
  db.ref("menu").on("value", snapshot => {
    menuDiv.innerHTML = "";
    snapshot.forEach(item => {
      const val = item.val();
      const div = document.createElement("div");
      div.className = "menu-item";
      div.innerHTML = `<h3>${val.name}</h3><p>₹${val.price}</p>
        <button onclick="addToCart('${item.key}','${val.name}',${val.price})">Add</button>`;
      menuDiv.appendChild(div);
    });
  });

  window.cart = [];

  window.addToCart = function(id,name,price){
    cart.push({id,name,price});
    alert(name+" added to cart");
  }

  form.addEventListener("submit", e => {
    e.preventDefault();
    const orderId = "BB" + Date.now();
    localStorage.setItem("lastOrderId", orderId);
    const order = {
      id: orderId,
      name: document.getElementById("name").value,
      phone: document.getElementById("phone").value,
      email: document.getElementById("email").value,
      address: document.getElementById("address").value,
      items: cart,
      status: "Preparing",
      paymentMethod: document.getElementById("paymentMethod").value,
      paymentStatus: "Pending",
      time: new Date().toLocaleString()
    };
    db.ref("orders/"+orderId).set(order).then(()=>{
      window.location.href="thankyou.html";
    });
  });
});