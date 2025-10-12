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
    amount: type === "ingreso" ? amount : -amount,
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

function addtransactionToDOM(transaction){
    const li=document.createElement("li");
    li.classList.add(transaction.type === "ingreso" ? "income" : "expense");
    li.innerHTML=`
      <span>${transaction.description} - <small>${transaction.category}</small></span>
      <strong>${transaction.type === "gasto" ? "-" : "+"}$${transaction.amount.toFixed(2)}</strong>
    `;
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

