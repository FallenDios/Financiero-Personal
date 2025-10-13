//====================================
//  PROYECTO: Financiero Personal
//====================================

// Referencia a los elementos del DOM

const form=document.getElementById("transaction-form");
const descriptionInput=document.getElementById("description");
const amountInput=document.getElementById("amount");
const categorySelect=document.getElementById("category");
const typeSelect=document.getElementById("type");
const transactionList=document.getElementById("transaction-list");
const totalBalance=document.getElementById("total-balance");


// Array para almacenar las transacciones
let transactions=[];


//====================================
// EVENTO: Se agrega una nueva transacción
//====================================
form.addEventListener("submit", function (event) {
  event.preventDefault();

  const description = descriptionInput.value;
  const amount = parseFloat(amountInput.value);
  const category = categorySelect.value;
  const type = typeSelect.value;

    // Validación básica
   if (description === "" || isNaN(amount) || !category || !type) {
    alert("Por favor, completa todos los campos.");
    return;
  }

    // Crear un objeto de transacción
    const transaction = {
    id: Date.now(), // ID unico
    description,
    amount,
    category,
    type,
  };

    //Guardar y mostrar 
    transactions.push(transaction);
  addtransactionToDOM(transaction);
  updateBalance();

    // Limpiar el formulario
    form.reset();
});



//====================================
//         FUNCIONES
//====================================


// Mostrar transacción en la lista

function addtransactionToDOM(transaction) {
  const li = document.createElement("li");
  li.classList.add(transaction.type === "ingreso" ? "income" : "expense");

  const sign = transaction.type === "gasto" ? "-" : "+";

  li.innerHTML = `
    <span>${transaction.description} - <small>${transaction.category}</small></span>
    <strong>${sign}$${transaction.amount.toFixed(2)}</strong>
    <button class="deletebtn">X</button>
  `;


  // Evento para eliminar la transacción
    li.querySelector(".deletebtn").addEventListener("click",() => {
        deleteTransaction(transaction.id);
    });


  transactionList.appendChild(li);
}


// Actualizar el balance total
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
}

//Color segun balance
// Cambia color según el balance
if (total > 0) {
  totalBalance.style.color = "#4caf50"; // verde
} else if (total < 0) {
  totalBalance.style.color = "#f44336"; // rojo
} else {
  totalBalance.style.color = "#333"; // neutro
}



// Eliminar una transacción
function deleteTransaction(id) {

    //Filtramos el array para quitar la transaccion con ese ID
    transactions = transactions.filter((t) => t.id !== id);

    //Guardamos y actualizamos todo 
    saveTransactions();
    renderTransactions();
}



//====================================
//         LOCAL STORAGE
//====================================

// Guardar transacciones 

function saveTransactions() {
    localStorage.setItem("transactions", JSON.stringify(transactions));
}

// Cargar las transacciones al iniciar
function loadTransactions() {
    const saved = JSON.parse(localStorage.getItem("transactions"));
    if (saved) {
        transactions = saved;
        transactions.forEach((t) => addtransactionToDOM(t));
        updateBalance();
    }
}

loadTransactions();