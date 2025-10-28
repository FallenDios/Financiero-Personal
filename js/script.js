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
    <strong>${sign}${formatCurrency(transaction.amount)}</strong>
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

    totalBalance.textContent = formatCurrency(total);


    // Cambiar color según balance
    if (total > 0) {
  totalBalance.style.color = document.body.classList.contains("dark-mode") ? "#6bfb88ff" : "#4caf50";
} else if (total < 0) {
  totalBalance.style.color = document.body.classList.contains("dark-mode") ? "#ff8e8e" : "#f44336";
} else {
  totalBalance.style.color = document.body.classList.contains("dark-mode") ? "#ccc" : "#333";
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


// ==================================
// FILTROS POR MES Y CATEGORÍA
// ==================================
const filterMonth = document.getElementById("filter-month");
const filterCategory = document.getElementById("filter-category");

filterMonth.addEventListener("change", applyFilters);
filterCategory.addEventListener("change", applyFilters);

function applyFilters() {
  const monthFilter = filterMonth.value;
  const categoryFilter = filterCategory.value;

  // Filtrar transacciones según mes y categoría
  let filtered = transactions.filter((t) => {
    const date = new Date(t.id);
    const month = date.getMonth();

    const matchMonth = monthFilter === "all" || parseInt(monthFilter) === month;
    const matchCategory = categoryFilter === "all" || t.category === categoryFilter;

    return matchMonth && matchCategory;
  });

  // Renderizar solo las filtradas
  renderFilteredTransactions(filtered);
  updateFilteredCharts(filtered);
}

// Mostrar solo las transacciones filtradas
function renderFilteredTransactions(filtered) {
  transactionList.innerHTML = "";
  filtered.forEach((t) => addtransactionToDOM(t));

  // Actualizar balance de las filtradas
  let total = 0;
  filtered.forEach((t) => {
    if (t.type === "ingreso") total += t.amount;
    else total -= t.amount;
  });
  totalBalance.textContent = formatCurrency(total);

}

// Actualizar gráficos con los datos filtrados
function updateFilteredCharts(filtered) {
  // Gráfico circular
  const expenseTransactions = filtered.filter(t => t.type === "gasto");
  const categoryTotals = {};
  expenseTransactions.forEach(t => {
    categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
  });

  const categories = Object.keys(categoryTotals);
  const values = Object.values(categoryTotals);

  if (expenseChart) expenseChart.destroy();

  const ctx1 = document.getElementById('expenseChart').getContext('2d');
  expenseChart = new Chart(ctx1, {
    type: 'doughnut',
    data: {
      labels: categories,
      datasets: [{
        data: values,
        backgroundColor: ["#ffd6e8","#a8c6ff","#b5e5cf","#ffedb3","#e2c6ff","#ffc6c6"],
        borderColor: "#fff",
        borderWidth: 2,
      }]
    },
    options: { plugins: { legend: { position: 'bottom' } } }
  });

  // Gráfico mensual filtrado (reutiliza la misma función pero con filtro)
  updateMonthlyChart();
}


//====================================
// FUNCION DE FORMATO NUMERICO
//====================================

function formatCurrency(num) {
  return Number(num).toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2
  });
}



// ============================
// MODO OSCURO / CLARO
// ============================
const themeSwitch = document.getElementById("theme-switch");
const modeIcon = document.querySelector(".mode-icon");

// Cargar tema guardado
const currentTheme = localStorage.getItem("theme");

if (currentTheme === "dark") {
  document.body.classList.add("dark-mode");
  themeSwitch.checked = true;
  modeIcon.textContent = "☀️";
}

// Escuchar cambios
themeSwitch.addEventListener("change", () => {
  if (themeSwitch.checked) {
    document.body.classList.add("dark-mode");
    modeIcon.textContent = "☀️";
    localStorage.setItem("theme", "dark");
  } else {
    document.body.classList.remove("dark-mode");
    modeIcon.textContent = "🌙";
    localStorage.setItem("theme", "light");
  }
});


// ============================
// ENVÍO DE RESUMEN POR WHATSAPP
// ============================

document.getElementById("share-whatsapp").addEventListener("click", () => {
  if (transactions.length === 0) {
    alert("No hay movimientos registrados para enviar.");
    return;
  }

  // Calcular balance total
  let total = 0;
  transactions.forEach((t) => {
    total += t.type === "ingreso" ? t.amount : -t.amount;
  });

  // Crear resumen de movimientos
  let message = "💸 *Resumen de FinanZone* 💸%0A%0A";
  message += `*Balance total:* ${formatCurrency(total)}%0A%0A`;

  transactions.slice(-5).forEach((t) => {
    const sign = t.type === "ingreso" ? "➕" : "➖";
    message += `${sign} ${t.description} (${t.category}) – ${formatCurrency(t.amount)}%0A`;
  });

  message += "%0A📊 FinanZone App – Gestor de Finanzas";

  // Enlace de WhatsApp
  const whatsappURL = `https://wa.me/?text=${message}`;
  window.open(whatsappURL, "_blank");
});
