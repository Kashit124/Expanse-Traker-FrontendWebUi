let accountsData = [];
let currentAccountId = null;
let currentTransactions = [];
let editingTransactionId = null;

if (!localStorage.getItem("current_user")) {
    window.location.href = "login.html";
}

document.getElementById("logout-btn").addEventListener("click", () => {
    localStorage.removeItem("current_user");
    window.location.href = "login.html";
});

document.addEventListener("DOMContentLoaded", () => {
    loadAccounts();
    
    document.getElementById("account-select").addEventListener("change", (e) => {
        currentAccountId = e.target.value;
        if (currentAccountId) {
            loadTransactions(currentAccountId);
        } else {
            clearDashboard();
        }
    });
});

async function loadAccounts() {
    try {
        accountsData = await apiRequest("/accounts");
        const select = document.getElementById("account-select");
        select.innerHTML = '<option value="">-- Choose Account --</option>';
        
        accountsData.forEach(acc => {
            const opt = document.createElement("option");
            opt.value = acc.accountId;
            opt.textContent = acc.name;
            select.appendChild(opt);
        });

        if (accountsData.length > 0) {
            select.value = accountsData[0].accountId;
            currentAccountId = accountsData[0].accountId;
            loadTransactions(currentAccountId);
        }
    } catch (err) {
        console.error("Failed to load accounts", err);
    }
}

async function loadTransactions(accountId) {
    try {
        currentTransactions = await apiRequest(`/transactions/account/${accountId}`);
        renderDashboard();
    } catch (err) {
        console.error("Failed to load transactions", err);
    }
}

function renderDashboard() {
    const account = accountsData.find(a => a.accountId == currentAccountId);
    if (!account) return;

    const opening = parseFloat(account.openingBalance || 0);
    let totalIncome = 0;
    let totalExpense = 0;

    const tbody = document.getElementById("transactions-table-body");
    tbody.innerHTML = "";

    if (currentTransactions.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="p-6 text-center text-slate-400">No transactions recorded yet.</td></tr>`;
    }

    currentTransactions.forEach(tx => {
        const amt = parseFloat(tx.amount);
        if (tx.type === "INCOME") totalIncome += amt;
        if (tx.type === "EXPENSE") totalExpense += amt;

        const tr = document.createElement("tr");
        tr.className = "hover:bg-slate-700/30 transition";
        tr.innerHTML = `
            <td class="p-4 text-slate-400 text-xs">${new Date(tx.transactionDate).toLocaleDateString()}</td>
            <td class="p-4 font-medium">${tx.category}</td>
            <td class="p-4 text-slate-400">${tx.description || '-'}</td>
            <td class="p-4"><span class="px-2 py-1 rounded text-xs font-semibold ${tx.type === 'INCOME' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}">${tx.type}</span></td>
            <td class="p-4 text-right font-bold ${tx.type === 'INCOME' ? 'text-emerald-400' : 'text-rose-400'}">${tx.type === 'INCOME' ? '+' : '-'}$${amt.toFixed(2)}</td>
            <td class="p-4 text-center space-x-2">
                <button onclick="editTransaction(${tx.transactionId})" class="text-blue-400 hover:text-blue-300"><i class="fa-solid fa-pen"></i></button>
                <button onclick="deleteTransaction(${tx.transactionId})" class="text-rose-400 hover:text-rose-300"><i class="fa-solid fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    const currentBalance = opening + totalIncome - totalExpense;

    document.getElementById("summary-balance").textContent = `$${currentBalance.toFixed(2)}`;
    document.getElementById("summary-income").textContent = `$${totalIncome.toFixed(2)}`;
    document.getElementById("summary-expense").textContent = `$${totalExpense.toFixed(2)}`;
}

function clearDashboard() {
    document.getElementById("summary-balance").textContent = "$0.00";
    document.getElementById("summary-income").textContent = "$0.00";
    document.getElementById("summary-expense").textContent = "$0.00";
    document.getElementById("transactions-table-body").innerHTML = `<tr><td colspan="6" class="p-6 text-center text-slate-400">Select an account to view transactions.</td></tr>`;
}

function openAccountModal() { document.getElementById("account-modal").classList.remove("hidden"); }
function closeAccountModal() { document.getElementById("account-modal").classList.add("hidden"); }

function openTransactionModal() {
    editingTransactionId = null;
    document.getElementById("tx-modal-title").textContent = "Add Transaction";
    document.getElementById("transaction-form").reset();
    document.getElementById("transaction-modal").classList.remove("hidden");
}
function closeTransactionModal() { document.getElementById("transaction-modal").classList.add("hidden"); }

document.getElementById("account-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("acc-name").value;
    const openingBalance = document.getElementById("acc-balance").value;

    try {
        await apiRequest("/accounts", "POST", { name, openingBalance: parseFloat(openingBalance) });
        closeAccountModal();
        loadAccounts();
    } catch (err) {
        alert("Failed to create account: " + err.message);
    }
});

document.getElementById("transaction-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const type = document.getElementById("tx-type").value;
    const amount = parseFloat(document.getElementById("tx-amount").value);
    const category = document.getElementById("tx-category").value;
    const description = document.getElementById("tx-desc").value;

    const payload = { type, amount, category, description };

    try {
        if (editingTransactionId) {
            await apiRequest(`/transactions/account/${editingTransactionId}`, "PUT", payload);
        } else {
            await apiRequest(`/transactions/account/${currentAccountId}`, "POST", payload);
        }
        closeTransactionModal();
        loadTransactions(currentAccountId);
    } catch (err) {
        alert("Failed to save transaction: " + err.message);
    }
});

function editTransaction(id) {
    const tx = currentTransactions.find(t => t.transactionId === id);
    if (!tx) return;

    editingTransactionId = id;
    document.getElementById("tx-modal-title").textContent = "Edit Transaction";
    document.getElementById("tx-type").value = tx.type;
    document.getElementById("tx-amount").value = tx.amount;
    document.getElementById("tx-category").value = tx.category;
    document.getElementById("tx-desc").value = tx.description || "";
    
    document.getElementById("transaction-modal").classList.remove("hidden");
}

async function deleteTransaction(id) {
    if (!confirm("Are you sure you want to delete this transaction?")) return;

    try {
        await apiRequest(`/transactions/account/${id}`, "DELETE");
        loadTransactions(currentAccountId);
    } catch (err) {
        alert("Failed to delete transaction: " + err.message);
    }
}