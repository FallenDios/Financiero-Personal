//====================================
//  PROYECTO: FinanZone (Gestor Financiero)
//====================================

// Referencias al DOM
const form = document.getElementById("transaction-form");
const descriptionInput = document.getElementById("description");
const amountInput = document.getElementById("amount");
const categorySelect = document.getElementById("category");
const typeSelect = document.getElementById("type");
const transactionList = document.getElementById("transaction-list");
const totalBalance = document.getElementById("total-balance");

// Array de transacciones
let transactions = [];

//====================================
// EVENTO: Agregar nueva transacción
//====================================
form.addEventListener("submit", function (event) {
  event.preventDefault();

  const description = descriptionInput.value.trim();
  const amount = parseFloat(amountInput.value);
  const category = categorySelect.value;
  const type = typeSelect.value;

  // Validaciones
  if (description === "" || isNaN(amount) || !category || !type) {
    alert("Por favor, completa todos los campos.");
    return;
  }

  // Crear objeto transacción
  const transaction = {
    id: Date.now(),
    description,
    amount,
    category,
    type,
  };

  // Guardar y mostrar
  transactions.push(transaction);
  addtransactionToDOM(transaction);
  updateBalance();
  saveTransactions(); // ✅ Guardamos en localStorage

  // Limpiar el formulario
  form.reset();
});

//====================================
// FUNCIONES
//====================================

// Mostrar transacción en el DOM
function addtransactionToDOM(transaction) {
  const li = document.createElement("li");
  li.classList.add(transaction.type === "ingreso" ? "income" : "expense");

  const sign = transaction.type === "gasto" ? "-" : "+";

  li.innerHTML = `
    <span>${transaction.description} - <small>${transaction.category}</small></span>
    <strong>${sign}$${transaction.amount.toFixed(2)}</strong>
    <button class="delete-btn">✖</button>
  `;

  // Evento para eliminar transacción
  li.querySelector(".delete-btn").addEventListener("click", () => {
    deleteTransaction(transaction.id);
  });

  transactionList.appendChild(li);
}

// Actualizar balance total
function updateBalance() {
  let total = 0;

  transactions.forEach((t) => {
    if (t.type.toLowerCase() === "ingreso") {
      total += t.amount;
    } else if (t.type.toLowerCase() === "gasto") {
      total -= t.amount;
    }
  });

  totalBalance.textContent = `$${total.toFixed(2)}`;

  // Cambiar color según balance
  if (total > 0) {
    totalBalance.style.color = "#4caf50"; // verde
  } else if (total < 0) {
    totalBalance.style.color = "#f44336"; // rojo
  } else {
    totalBalance.style.color = "#333"; // neutro
  }
}

// Eliminar transacción
function deleteTransaction(id) {
  transactions = transactions.filter((t) => t.id !== id);
  saveTransactions();
  renderTransactions();
}

// Renderizar todas las transacciones
function renderTransactions() {
  transactionList.innerHTML = "";
  transactions.forEach((t) => addtransactionToDOM(t));
  updateBalance();
}

// Guardar en localStorage
function saveTransactions() {
  localStorage.setItem("transactions", JSON.stringify(transactions));
}

// Cargar transacciones guardadas
function loadTransactions() {
  const saved = JSON.parse(localStorage.getItem("transactions"));
  if (saved) {
    transactions = saved;
    renderTransactions();
  }
}

// Ejecutar al iniciar
loadTransactions();
