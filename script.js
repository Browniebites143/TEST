firebase.database().ref("menu").on("value", snapshot => {
  const menuDiv = document.getElementById("menu");
  menuDiv.innerHTML = "";
  snapshot.forEach(itemSnap => {
    const item = itemSnap.val();
    const div = document.createElement("div");
    div.innerHTML = `<strong>${item.name}</strong> - ₹${item.price}`;
    if(item.image){ div.innerHTML += `<br><img src='${item.image}' width='100'>`; }
    menuDiv.appendChild(div);
  });
});

document.getElementById("orderForm").addEventListener("submit", function(e){
  e.preventDefault();
  const name = document.getElementById("name").value;
  const phone = document.getElementById("phone").value;
  const email = document.getElementById("email").value;
  const address = document.getElementById("address").value;
  const paymentMethod = document.getElementById("paymentMethod").value;

  const orderId = "BB" + Date.now();
  const orderData = {
    name, phone, email, address,
    paymentMethod, status:"Preparing", paymentStatus:"Pending", orderId
  };
  firebase.database().ref("orders/"+orderId).set(orderData).then(()=>{
    localStorage.setItem("lastOrderId", orderId);
    if(paymentMethod === "cod"){
      window.location.href="thankyou.html";
    } else {
      const amount = 100; // example static amount
      const upiMap = {
        gpay:"upi://pay?pa=9380248566@okaxis&pn=BrownieBites",
        phonepe:"upi://pay?pa=9380248566@ybl&pn=BrownieBites",
        paytm:"upi://pay?pa=9380248566@paytm&pn=BrownieBites",
        fampay:"upi://pay?pa=9380248566@fam&pn=BrownieBites",
        bhim:"upi://pay?pa=9380248566@upi&pn=BrownieBites"
      };
      const url = upiMap[paymentMethod] + `&am=${amount}&cu=INR&tn=Order-${orderId}`;
      window.location.href = url;
      setTimeout(()=> window.location.href="thankyou.html", 5000);
    }
  });
});