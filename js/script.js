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
form.addEventListener("submit",function(event){
    event.preventDefault();

    const description=descriptionInput.value;
    const amount=parseFloat(amountInput.value);
    const category=categorySelect.value;
    const type=typeSelect.value;

    // Validación básica
    if(description ==="" || isNaN(amount) || !category || !type){
        alert("Por favor, completa todos los campos.");
        return;
    }

    // Crear un objeto de transacción
    const transaction={
        id: Date.now(), // ID unico 
        description,
        amount: type ==="income" ? amount : -amount, // Si es ingreso es positivo, si es gasto es negativo
        category,
        type
    };

    //Guardar y mostrar 
    transactions.push(transaction);
    addtransactionToDOM(transaction);
    updateTotalBalance();

    // Limpiar el formulario
    form.reset();
});


