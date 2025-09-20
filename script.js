const API_URL = "https://orders.levelup-store.tn"; // backend server
let token = localStorage.getItem("token");
let editingOrderId = null; // Track which order is being edited

// Elements
const loginDiv = document.getElementById("loginDiv");
const ordersDiv = document.getElementById("ordersDiv");
const loginForm = document.getElementById("loginForm");
const loginError = document.getElementById("loginError");
const logoutBtn = document.getElementById("logoutBtn");
const orderForm = document.getElementById("orderForm");

// ------------------
// Check if token exists
// ------------------
if (token) {
  showOrders();
}

// ------------------
// Login Form
// ------------------
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  try {
    const res = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();
    if (res.ok) {
      token = data.token;
      localStorage.setItem("token", token);
      showOrders();
    } else {
      loginError.textContent = data.message || "Login failed";
    }
  } catch (err) {
    loginError.textContent = "Server error";
  }
});

// ------------------
// Logout
// ------------------
logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("token");
  token = null;
  ordersDiv.style.display = "none";
  loginDiv.style.display = "block";
});

// ------------------
// Show Orders Section
// ------------------
function showOrders() {
  loginDiv.style.display = "none";
  ordersDiv.style.display = "block";
  loadOrders();
}

// ------------------
// Add / Update Order
// ------------------
orderForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const orderData = {
    productName: document.getElementById("productName").value,
    quantity: document.getElementById("quantity").value,
    clientName: document.getElementById("clientName").value,
    clientNumber: document.getElementById("clientNumber").value,
    clientAddress: document.getElementById("clientAddress").value,
  };

  if (editingOrderId) {
    // Update existing order
    const res = await fetch(`${API_URL}/orders/${editingOrderId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(orderData)
    });

    if (res.ok) {
      alert("✅ Order updated successfully!");
      orderForm.reset();
      editingOrderId = null;
      loadOrders();
    } else {
      const err = await res.json();
      alert("❌ Error: " + err.message);
    }

  } else {
    // Add new order
    const res = await fetch(`${API_URL}/orders/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(orderData)
    });

    if (res.ok) {
      alert("✅ Order added successfully!");
      orderForm.reset();
      loadOrders();
    } else {
      const err = await res.json();
      alert("❌ Error: " + err.message);
    }
  }
});

// ------------------
// Load Orders
// ------------------
async function loadOrders() {
  const res = await fetch(`${API_URL}/orders`, {
    headers: { "Authorization": `Bearer ${token}` }
  });

  if (!res.ok) {
    alert("❌ Failed to load orders");
    return;
  }

  const orders = await res.json();
  const tbody = document.getElementById("ordersTableBody");
  tbody.innerHTML = "";

  orders.forEach(order => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${order.productName}</td>
      <td>${order.quantity}</td>
      <td>${order.clientName}</td>
      <td>${order.clientNumber}</td>
      <td>${order.clientAddress}</td>
      <td>
        <button class="editBtn">Edit</button>
        <button class="deleteBtn">Delete</button>
      </td>
    `;
    tbody.appendChild(row);

    // ------------------
    // Delete Order
    // ------------------
    row.querySelector(".deleteBtn").addEventListener("click", async () => {
      if (!confirm("Are you sure you want to delete this order?")) return;

      const res = await fetch(`${API_URL}/orders/${order._id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (res.ok) {
        loadOrders();
      } else {
        const err = await res.json();
        alert("❌ Error: " + err.message);
      }
    });

    // ------------------
    // Edit Order
    // ------------------
    row.querySelector(".editBtn").addEventListener("click", () => {
      document.getElementById("productName").value = order.productName;
      document.getElementById("quantity").value = order.quantity;
      document.getElementById("clientName").value = order.clientName;
      document.getElementById("clientNumber").value = order.clientNumber;
      document.getElementById("clientAddress").value = order.clientAddress;

      editingOrderId = order._id; // mark this order for update
    });
  });
}
