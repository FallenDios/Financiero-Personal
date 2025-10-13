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
    saveTransactions(); //  Guardamos en localStorage
    updateExpenseChart(); //  actualiza el gráfico al agregar una transacción
    updateMonthlyChart(); //  actualiza el gráfico mensual


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
    updateExpenseChart(); // Actualizar gráfica al eliminar
    updateMonthlyChart(); // Actualizar gráfica mensual al eliminar
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
    updateExpenseChart(); // Actualizar gráfica al cargar
    updateMonthlyChart(); // Actualizar gráfica mensual al cargar
}

document.addEventListener("DOMContentLoaded", () => {
  loadTransactions();
  updateExpenseChart();
  updateMonthlyChart();
});



//====================================
//  GRÁFICA DE GASTOS (Chart.js)
//====================================


let expenseChart;

function updateExpenseChart() {
  // Filtrar solo gastos
  const expenseTransactions = transactions.filter(t => t.type === 'gasto');

  // Agrupar gastos por categoría
  const categoryTotals = {};
  expenseTransactions.forEach(t => {
    categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
  });

  const categories = Object.keys(categoryTotals);
  const values = Object.values(categoryTotals);

  // Si ya existe, destruir antes de crear
  if (expenseChart) {
    expenseChart.destroy();
  }

  const ctx = document.getElementById('expenseChart').getContext('2d');

  expenseChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: categories,
      datasets: [
        {
          data: values,
          backgroundColor: [
            "#ffd6e8",
            "#a8c6ff",
            "#b5e5cf",
            "#ffedb3",
            "#e2c6ff",
            "#ffc6c6",
          ],
          borderColor: '#fff',
          borderWidth: 2,
        },
      ],
    },
    options: {
      plugins: { 
        legend: {
          position: 'bottom',
          labels: {
            color: "#555",
            font: { size: 14 },
          },
        },
      },
    },
  });
}



//============================================
// GRÁFICA DE INGRESOS VS GASTOS MENSUAL
//============================================

let monthlyChart;

function updateMonthlyChart() {
    // Crear un mapa por mes
    const months =[
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];
    
    // Inicializamos los tatales
    const incomeByMonth = Array(12).fill(0);
    const expenseByMonth = Array(12).fill(0);

    //Recorremos las transacciones
    transactions.forEach(t => {
        const date = new Date(t.id); // Usamos el ID como timestamp
        const monthIndex = date.getMonth();

        if (t.type === 'ingreso') {
            incomeByMonth[monthIndex] += t.amount;
        } else if (t.type === 'gasto') {
            expenseByMonth[monthIndex] += t.amount;
        }
    });

    // Si ya existe, destruir antes de crear
    if (monthlyChart) {
        monthlyChart.destroy();
    }
    const ctx = document.getElementById('monthlyChart').getContext('2d');

    monthlyChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: months,
            datasets: [
                {
                    label: 'Ingresos',
                    data: incomeByMonth,
                    backgroundColor: "rgba(100,200,150,0.7)",
                },
                {
                    label: 'Gastos',
                    data: expenseByMonth,
                    backgroundColor: 'rgba(255,150,150,0.7)',
                },
            ],
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { color: "#555"  },
                },
                x: { ticks: { color: "#555" }  },
            },
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: "#555",
                        font: { size: 14 },
                    },
                },
            },
        },
    });
}