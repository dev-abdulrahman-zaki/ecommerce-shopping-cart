"use strict";
//
const openCartBtn = document.querySelector(".cart-btn");
const closeCartBtn = document.querySelector(".cart-close");
const cartOverlay = document.querySelector(".cart-overlay");
const cartSidebar = document.querySelector(".cart");
let productsList;
let cartList = [];

//
openCartBtn.addEventListener("click", () => {
    cartOverlay.classList.add("show");
    cartSidebar.classList.add("show");
});
closeCartBtn.addEventListener("click", () => {
    cartOverlay.classList.remove("show");
    cartSidebar.classList.remove("show");
});
cartOverlay.addEventListener("click", () => {
  cartOverlay.classList.remove("show");
  cartSidebar.classList.remove("show");
});

//
async function getProductsData() {
    try {
      let response = await fetch(
        `https://fakestoreapi.com/products`
      );
      if (!response.ok) {
        throw new Error("Network response was not OK");
      }
      let productsData = await response.json();
      displayProducts(productsData);
      productsList = [...productsData];
      // console.log(productsData);
    } catch (error) {
      console.error("There has been a problem with your fetch operation:", error);
    }
}

function displayProducts(data) { 
if (data) {
    let dataContainer = "";
    for (let i = 0; i < data.length; i++) {
    dataContainer += `
    <div class="product">
    <img src="${data[i].image}" alt="${data[i].title}">
    <h3>${data[i].title}</h3>
    <h5>$${(data[i].price).toFixed(2)}</h5>
    <button data-id="${data[i].id}" onclick="addCartItem(event)">Add to Cart</button>
  </div>
    `;
    }
    document.getElementById("productsContainer").innerHTML = dataContainer;
}
}

//
getProductsData().then(()=>{
  console.log("productsList:", productsList);
  displayCartItems(cartList);
  if (cartList.length){calculateCartTotal();} 
  updateAddCartItemBtn();
  updateCartBadge();
})

// Handle Add to Cart
cartList = (localStorage.getItem("cartList") != null) ? JSON.parse(localStorage.getItem("cartList")) : [];
function addCartItem(e){
  // console.log(e.target);
    let cartItem = {
      id: e.target.dataset.id,
      qty: 1,
    }
    // console.log(cartItem);
    cartList.push(cartItem);
    localStorage.setItem("cartList", JSON.stringify(cartList));
    displayCartItems(cartList);
    calculateCartTotal();
    updateAddCartItemBtn();
    updateCartBadge();
}

// Handle Display Cart Items
function displayCartItems(cartList){
  let cartItemsContainer = "";
  console.log("cartList:", cartList);
  if (cartList.length){
    for (var i=0; i<cartList.length; i++){
      let productIdToFind = cartList[i].id;
      let foundProduct = productsList.find(product => product.id == productIdToFind);
      if (foundProduct) {
        // console.log(foundProduct);    
      cartItemsContainer += `
        <div class="cart-item" data-id="${foundProduct.id}">
        <img src="${foundProduct.image}" alt="${foundProduct.title}">
        <div class="cart-item-detail">
          <h3>${foundProduct.title}</h3>
          <h5>$${foundProduct.price}</h5>
          <div class="cart-item-amount">
            <i class="bi bi-dash-lg" data-btn="decr" onclick="decCartItemQty(event)"></i>
            <span class="qty">${cartList[i].qty}</span>
            <i class="bi bi-plus-lg" data-btn="incr" onclick="incCartItemQty(event)"></i>  
            <span class="cart-item-price">
              $${(foundProduct.price * cartList[i].qty).toFixed(2)}
            </span>
          </div>
        </div>
      </div>
      `;
    }
    }
  }else{
    cartItemsContainer = `
    <div class="cart-empty">Your cart is empty.</div>
    `;
  }
  document.getElementById("cartItemsContainer").innerHTML = cartItemsContainer;
  // tableCaption.innerHTML = `Products Count: <span>${cartList.length}</span>`
}

//
function updateAddCartItemBtn(){
  $('.product button[data-id]').prop('disabled', false);
  $('.product button[data-id]').html('Add to Cart');  
  let productsIDs = cartList.map(item => item.id);
  productsIDs.forEach(id => {
    document.querySelector(`button[data-id="${id}"]`).disabled = true;
    document.querySelector(`button[data-id="${id}"]`).innerHTML = "Added to Cart";
  })
  // if (!btn.disabled){
  //   btn.disabled = true;
  //   btn.innerHTML = "Added to Cart";
  // }
  // else{
  //   btn.disabled = false;
  //   btn.innerHTML = "Add to Cart";
  // }
}

//
function incCartItemQty(e){
  let cartItemID = $(e.target).parents("div[data-id]").attr("data-id");
  let cartItemIndex = cartList.findIndex(item => item.id === cartItemID);
  cartList[cartItemIndex].qty+=1;
  localStorage.setItem("cartList", JSON.stringify(cartList));
  displayCartItems(cartList);
  calculateCartTotal();
  // console.log(cartList[cartItemIndex]);
}

//
function decCartItemQty(e){
  let cartItemID = $(e.target).parents("div[data-id]").attr("data-id");
  let cartItemIndex = cartList.findIndex(item => item.id === cartItemID);
  if(cartList[cartItemIndex].qty > 1){
    cartList[cartItemIndex].qty-=1;
    localStorage.setItem("cartList", JSON.stringify(cartList));
    displayCartItems(cartList);
    calculateCartTotal();
  }
  else{
    deleteCartItem(cartItemIndex);
  }
  // console.log(cartList[cartItemIndex]);
}

// Handle Delete Cart Item
function deleteCartItem(index){
  cartList.splice(index,1);
  // overwrite/update localStorage
  localStorage.setItem("cartList", JSON.stringify(cartList));
  displayCartItems(cartList);
  calculateCartTotal();
  updateAddCartItemBtn();
  updateCartBadge();
}

//
function clearCart() {
  cartList = [];
  localStorage.setItem("cartList", JSON.stringify(cartList));
  displayCartItems(cartList);
  updateAddCartItemBtn();
  updateCartBadge();
  document.querySelector(".cart-total").innerHTML = "0";
}

//
function updateCartBadge(){
  document.querySelector(".cart-qty").innerHTML = cartList.length;
}

//
function calculateCartTotal(){
  let cartItemsPrice = Array.from(document.querySelectorAll(".cart-item-price"));
  let cartItemsPriceParseed = cartItemsPrice.map(e => parseFloat(e.innerHTML.trim().replace('$', '')));
  document.querySelector(".cart-total").innerHTML = `$${cartItemsPriceParseed.reduce((a,b)=>a+b).toFixed(2)}`;
}