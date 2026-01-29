// ============================
// AUTHENTICATION SYSTEM
// ============================

let CURRENT_USER = null;

// Initialize users with default admin account
const USERS = JSON.parse(localStorage.getItem('users')) || [
    {
        id: 1,
        fullname: 'Administrator',
        username: 'admin',
        email: 'admin@cbrtextiles.com',
        password: 'admin123', // In production, this should be hashed
        role: 'admin',
        createdAt: new Date().toISOString()
    }
];

// Save users to localStorage
function saveUsers() {
    localStorage.setItem('users', JSON.stringify(USERS));
}

// Login user
function loginUser(username, password, rememberMe) {
    const user = USERS.find(u => (u.username === username || u.email === username) && u.password === password);
    
    if (user) {
        CURRENT_USER = {
            id: user.id,
            fullname: user.fullname,
            username: user.username,
            email: user.email,
            role: user.role
        };
        
        // Store session
        sessionStorage.setItem('currentUser', JSON.stringify(CURRENT_USER));
        
        // Remember me functionality
        if (rememberMe) {
            localStorage.setItem('rememberedUser', username);
        } else {
            localStorage.removeItem('rememberedUser');
        }
        
        return { success: true, message: 'Login successful!' };
    }
    
    return { success: false, message: 'Invalid username or password!' };
}

// Register new user
function registerUser(fullname, email, username, password) {
    // Validate inputs
    if (!fullname || !email || !username || !password) {
        return { success: false, message: 'All fields are required!' };
    }
    
    if (password.length < 6) {
        return { success: false, message: 'Password must be at least 6 characters!' };
    }
    
    // Check if user already exists
    if (USERS.find(u => u.username === username || u.email === email)) {
        return { success: false, message: 'Username or email already exists!' };
    }
    
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return { success: false, message: 'Invalid email address!' };
    }
    
    // Create new user
    const newUser = {
        id: USERS.length + 1,
        fullname: fullname,
        username: username,
        email: email,
        password: password, // In production, should be hashed
        role: 'user',
        createdAt: new Date().toISOString()
    };
    
    USERS.push(newUser);
    saveUsers();
    
    return { success: true, message: 'Account created successfully! Please login.' };
}

// Logout user
function logoutUser() {
    CURRENT_USER = null;
    sessionStorage.removeItem('currentUser');
    localStorage.removeItem('rememberedUser');
}

// Check if user is logged in
function isUserLoggedIn() {
    const stored = sessionStorage.getItem('currentUser');
    if (stored) {
        CURRENT_USER = JSON.parse(stored);
        return true;
    }
    return false;
}

// ============================
// DATA STORAGE (LOCAL STORAGE)
// ============================

const DATA = {
    workers: JSON.parse(localStorage.getItem('workers')) || [],
    attendance: JSON.parse(localStorage.getItem('attendance')) || [],
    inventory: JSON.parse(localStorage.getItem('inventory')) || [],
    movements: JSON.parse(localStorage.getItem('movements')) || [],
};

// Save data to localStorage
function saveData() {
    localStorage.setItem('workers', JSON.stringify(DATA.workers));
    localStorage.setItem('attendance', JSON.stringify(DATA.attendance));
    localStorage.setItem('inventory', JSON.stringify(DATA.inventory));
    localStorage.setItem('movements', JSON.stringify(DATA.movements));
}

// ============================
// MODULE SWITCHING
// ============================

document.querySelectorAll('.nav-link, .menu-item').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const module = link.dataset.module;
        switchModule(module);
    });
});

function switchModule(moduleName) {
    // Hide all modules
    document.querySelectorAll('.module').forEach(m => m.classList.remove('active'));
    
    // Show selected module
    const moduleElement = document.getElementById(`${moduleName}-module`);
    if (moduleElement) {
        moduleElement.classList.add('active');
    }

    // Update nav links
    document.querySelectorAll('.nav-link, .menu-item').forEach(link => {
        link.classList.remove('active');
        if (link.dataset.module === moduleName) {
            link.classList.add('active');
        }
    });

    // Initialize module data
    if (moduleName === 'home') {
        updateDashboard();
    } else if (moduleName === 'workers') {
        displayWorkers();
    } else if (moduleName === 'attendance') {
        initAttendanceModule();
    } else if (moduleName === 'payroll') {
        displayPayroll();
    } else if (moduleName === 'inventory') {
        displayInventory();
    } else if (moduleName === 'inward-outward') {
        initMovementModule();
    }
}

// Default to home module
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

// Initialize application
function initializeApp() {
    // Check if user is logged in
    if (isUserLoggedIn()) {
        showApp();
        switchModule('home');
        setupEventListeners();
    } else {
        showAuthPage();
        setupAuthEventListeners();
    }
}

// Show app (hide auth)
function showApp() {
    document.getElementById('auth-container').classList.add('hidden');
    document.getElementById('app-container').classList.remove('hidden');
    updateUserDisplay();
}

// Show auth page (hide app)
function showAuthPage() {
    document.getElementById('auth-container').classList.remove('hidden');
    document.getElementById('app-container').classList.add('hidden');
    document.getElementById('login-form-container').classList.add('active');
    document.getElementById('register-form-container').classList.remove('active');
}

// Update user display in navbar
function updateUserDisplay() {
    if (CURRENT_USER) {
        document.getElementById('current-user').textContent = CURRENT_USER.fullname;
    }
}

// Setup authentication event listeners
function setupAuthEventListeners() {
    // Login form
    document.getElementById('login-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;
        const rememberMe = document.getElementById('remember-me').checked;
        
        const result = loginUser(username, password, rememberMe);
        
        if (result.success) {
            showNotification(result.message, 'success');
            setTimeout(() => {
                showApp();
                switchModule('home');
                setupEventListeners();
                document.getElementById('login-form').reset();
            }, 1000);
        } else {
            showNotification(result.message, 'error');
        }
    });
    
    // Registration form
    document.getElementById('register-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const fullname = document.getElementById('register-fullname').value;
        const email = document.getElementById('register-email').value;
        const username = document.getElementById('register-username').value;
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-confirm-password').value;
        
        if (password !== confirmPassword) {
            showNotification('Passwords do not match!', 'error');
            return;
        }
        
        const result = registerUser(fullname, email, username, password);
        
        if (result.success) {
            showNotification(result.message, 'success');
            setTimeout(() => {
                document.getElementById('register-form').reset();
                document.getElementById('login-form-container').classList.add('active');
                document.getElementById('register-form-container').classList.remove('active');
                document.getElementById('login-username').value = username;
            }, 1000);
        } else {
            showNotification(result.message, 'error');
        }
    });
    
    // Switch to registration
    document.getElementById('show-register-link')?.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('login-form-container').classList.remove('active');
        document.getElementById('register-form-container').classList.add('active');
    });
    
    // Switch to login
    document.getElementById('show-login-link')?.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('register-form-container').classList.remove('active');
        document.getElementById('login-form-container').classList.add('active');
    });
}


// ============================
// DASHBOARD FUNCTIONS
// ============================

function updateDashboard() {
    const totalWorkers = DATA.workers.length;
    const presentToday = DATA.attendance.filter(a => 
        a.date === new Date().toISOString().split('T')[0] && 
        a.status === 'Present'
    ).length;
    
    const monthlyPayroll = calculateMonthlyPayroll();
    const inventoryItems = DATA.inventory.length;

    document.getElementById('total-workers').textContent = totalWorkers;
    document.getElementById('present-today').textContent = presentToday;
    document.getElementById('monthly-payroll').textContent = '₹' + monthlyPayroll.toFixed(2);
    document.getElementById('inventory-items').textContent = inventoryItems;
}

function calculateMonthlyPayroll() {
    const currentMonth = new Date().toISOString().slice(0, 7);
    let total = 0;

    DATA.workers.forEach(worker => {
        const daysWorked = DATA.attendance.filter(a => 
            a.workerId === worker.id && 
            a.date.startsWith(currentMonth) &&
            a.status === 'Present'
        ).length;
        
        total += daysWorked * worker.dailyWage;
    });

    return total;
}

// ============================
// WORKER MANAGEMENT
// ============================

document.getElementById('btn-add-worker')?.addEventListener('click', () => {
    document.getElementById('worker-form-section').style.display = 'block';
    document.getElementById('worker-form').reset();
});

document.getElementById('btn-cancel-worker')?.addEventListener('click', () => {
    document.getElementById('worker-form-section').style.display = 'none';
});

document.getElementById('worker-form')?.addEventListener('submit', (e) => {
    e.preventDefault();

    const worker = {
        id: Date.now(),
        code: document.getElementById('worker-code').value,
        name: document.getElementById('worker-name').value,
        role: document.getElementById('worker-role').value,
        contact: document.getElementById('worker-contact').value,
        dailyWage: parseFloat(document.getElementById('worker-daily-wage').value),
        shiftWage: parseFloat(document.getElementById('worker-shift-wage').value) || 0,
    };

    DATA.workers.push(worker);
    saveData();
    
    document.getElementById('worker-form-section').style.display = 'none';
    displayWorkers();
    updateDashboard();
    showNotification('Worker added successfully!', 'success');
});

function displayWorkers() {
    const tbody = document.getElementById('workers-table-body');
    
    if (DATA.workers.length === 0) {
        tbody.innerHTML = '<tr class="empty-state"><td colspan="7">No workers added yet. Click "Add New Worker" to get started.</td></tr>';
        return;
    }

    tbody.innerHTML = DATA.workers.map(worker => `
        <tr>
            <td><strong>${worker.code}</strong></td>
            <td>${worker.name}</td>
            <td>${worker.role}</td>
            <td>${worker.contact || '-'}</td>
            <td>₹${worker.dailyWage.toFixed(2)}</td>
            <td>₹${worker.shiftWage.toFixed(2)}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-delete" onclick="deleteWorker(${worker.id})">Delete</button>
                </div>
            </td>
        </tr>
    `).join('');
}

function deleteWorker(id) {
    if (confirm('Are you sure you want to delete this worker?')) {
        DATA.workers = DATA.workers.filter(w => w.id !== id);
        saveData();
        displayWorkers();
        updateDashboard();
        showNotification('Worker deleted successfully!', 'success');
    }
}

// ============================
// ATTENDANCE MANAGEMENT
// ============================

function initAttendanceModule() {
    // Populate worker dropdown
    const workerSelect = document.getElementById('attendance-worker');
    workerSelect.innerHTML = '<option value="">Choose Worker</option>' + 
        DATA.workers.map(w => `<option value="${w.id}">${w.code} - ${w.name}</option>`).join('');
    
    // Set today's date as default
    document.getElementById('attendance-date').valueAsDate = new Date();
}

document.getElementById('btn-mark-attendance')?.addEventListener('click', () => {
    document.getElementById('attendance-form-section').style.display = 'block';
    document.getElementById('attendance-date').valueAsDate = new Date();
});

document.getElementById('btn-cancel-attendance')?.addEventListener('click', () => {
    document.getElementById('attendance-form-section').style.display = 'none';
});

document.getElementById('attendance-form')?.addEventListener('submit', (e) => {
    e.preventDefault();

    const attendance = {
        id: Date.now(),
        workerId: parseInt(document.getElementById('attendance-worker').value),
        date: document.getElementById('attendance-date').value,
        status: document.getElementById('attendance-status').value,
        notes: document.getElementById('attendance-notes').value,
    };

    DATA.attendance.push(attendance);
    saveData();
    
    document.getElementById('attendance-form-section').style.display = 'none';
    displayAttendance();
    updateDashboard();
    showNotification('Attendance recorded successfully!', 'success');
});

function displayAttendance() {
    const tbody = document.getElementById('attendance-table-body');
    
    if (DATA.attendance.length === 0) {
        tbody.innerHTML = '<tr class="empty-state"><td colspan="5">No attendance records found.</td></tr>';
        return;
    }

    tbody.innerHTML = DATA.attendance.map(record => {
        const worker = DATA.workers.find(w => w.id === record.workerId);
        return `
            <tr>
                <td>${record.date}</td>
                <td>${worker ? worker.name : 'Unknown'}</td>
                <td>
                    <span class="status-badge ${record.status.toLowerCase()}">
                        ${record.status}
                    </span>
                </td>
                <td>${record.notes || '-'}</td>
                <td>
                    <button class="btn btn-delete" onclick="deleteAttendance(${record.id})">Delete</button>
                </td>
            </tr>
        `;
    }).join('');
}

function deleteAttendance(id) {
    if (confirm('Delete this attendance record?')) {
        DATA.attendance = DATA.attendance.filter(a => a.id !== id);
        saveData();
        displayAttendance();
        updateDashboard();
    }
}

// ============================
// PAYROLL MANAGEMENT
// ============================

document.getElementById('btn-calculate-payroll')?.addEventListener('click', () => {
    displayPayroll();
});

function displayPayroll() {
    const period = document.getElementById('payroll-period').value;
    const tbody = document.getElementById('payroll-table-body');
    
    let startDate = new Date();
    let endDate = new Date();

    if (period === 'daily') {
        startDate = new Date();
        endDate = new Date();
    } else if (period === 'weekly') {
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
    } else if (period === 'monthly') {
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);
    }

    const payrollData = DATA.workers.map(worker => {
        const relevantAttendance = DATA.attendance.filter(a => {
            const aDate = new Date(a.date);
            return a.workerId === worker.id && 
                   aDate >= startDate && 
                   aDate <= endDate &&
                   a.status === 'Present';
        });

        const daysWorked = relevantAttendance.length;
        const totalWages = daysWorked * worker.dailyWage;

        return {
            ...worker,
            daysWorked,
            totalWages
        };
    });

    if (payrollData.length === 0) {
        tbody.innerHTML = '<tr class="empty-state"><td colspan="7">No payroll data available. Mark attendance first.</td></tr>';
        return;
    }

    const totalPayroll = payrollData.reduce((sum, p) => sum + p.totalWages, 0);
    const avgPayroll = payrollData.length > 0 ? totalPayroll / payrollData.length : 0;

    document.getElementById('payroll-total-workers').textContent = payrollData.length;
    document.getElementById('payroll-total-amount').textContent = '₹' + totalPayroll.toFixed(2);
    document.getElementById('payroll-avg-amount').textContent = '₹' + avgPayroll.toFixed(2);

    tbody.innerHTML = payrollData.map(p => `
        <tr>
            <td>${p.code}</td>
            <td>${p.name}</td>
            <td>${p.role}</td>
            <td>${p.daysWorked}</td>
            <td>₹${p.dailyWage.toFixed(2)}</td>
            <td><strong>₹${p.totalWages.toFixed(2)}</strong></td>
            <td><span class="status-badge paid">Calculated</span></td>
        </tr>
    `).join('');
}

// ============================
// INVENTORY MANAGEMENT
// ============================

document.getElementById('btn-add-item')?.addEventListener('click', () => {
    document.getElementById('inventory-form-section').style.display = 'block';
    document.getElementById('inventory-form').reset();
});

document.getElementById('btn-cancel-item')?.addEventListener('click', () => {
    document.getElementById('inventory-form-section').style.display = 'none';
});

document.getElementById('inventory-form')?.addEventListener('submit', (e) => {
    e.preventDefault();

    const item = {
        id: Date.now(),
        code: document.getElementById('item-code').value,
        name: document.getElementById('item-name').value,
        type: document.getElementById('item-type').value,
        unit: document.getElementById('item-unit').value,
        quantity: parseFloat(document.getElementById('item-quantity').value),
        unitCost: parseFloat(document.getElementById('item-cost').value),
        description: document.getElementById('item-description').value,
    };

    DATA.inventory.push(item);
    saveData();
    
    document.getElementById('inventory-form-section').style.display = 'none';
    displayInventory();
    updateDashboard();
    showNotification('Item added successfully!', 'success');
});

function displayInventory() {
    const tbody = document.getElementById('inventory-table-body');
    
    if (DATA.inventory.length === 0) {
        tbody.innerHTML = '<tr class="empty-state"><td colspan="8">No inventory items found.</td></tr>';
        return;
    }

    tbody.innerHTML = DATA.inventory.map(item => {
        const totalValue = item.quantity * item.unitCost;
        return `
            <tr>
                <td><strong>${item.code}</strong></td>
                <td>${item.name}</td>
                <td>${item.type}</td>
                <td>${item.quantity.toFixed(2)}</td>
                <td>${item.unit}</td>
                <td>₹${item.unitCost.toFixed(2)}</td>
                <td>₹${totalValue.toFixed(2)}</td>
                <td>
                    <button class="btn btn-delete" onclick="deleteItem(${item.id})">Delete</button>
                </td>
            </tr>
        `;
    }).join('');

    // Update movement dropdowns
    updateMovementItemDropdown();
}

function deleteItem(id) {
    if (confirm('Delete this inventory item?')) {
        DATA.inventory = DATA.inventory.filter(i => i.id !== id);
        saveData();
        displayInventory();
        updateDashboard();
    }
}

// ============================
// INWARD/OUTWARD MANAGEMENT
// ============================

function initMovementModule() {
    updateMovementItemDropdown();
}

document.getElementById('btn-add-inward')?.addEventListener('click', () => {
    document.getElementById('movement-form-section').style.display = 'block';
    document.getElementById('movement-type').value = 'Inward';
    document.getElementById('movement-date').valueAsDate = new Date();
    document.getElementById('movement-form').reset();
});

document.getElementById('btn-add-outward')?.addEventListener('click', () => {
    document.getElementById('movement-form-section').style.display = 'block';
    document.getElementById('movement-type').value = 'Outward';
    document.getElementById('movement-date').valueAsDate = new Date();
    document.getElementById('movement-form').reset();
});

document.getElementById('btn-cancel-movement')?.addEventListener('click', () => {
    document.getElementById('movement-form-section').style.display = 'none';
});

document.getElementById('movement-form')?.addEventListener('submit', (e) => {
    e.preventDefault();

    const movement = {
        id: Date.now(),
        type: document.getElementById('movement-type').value,
        date: document.getElementById('movement-date').value,
        itemId: parseInt(document.getElementById('movement-item').value),
        quantity: parseFloat(document.getElementById('movement-quantity').value),
        reference: document.getElementById('movement-reference').value,
        notes: document.getElementById('movement-notes').value,
    };

    // Update inventory quantity
    const item = DATA.inventory.find(i => i.id === movement.itemId);
    if (item) {
        if (movement.type === 'Inward') {
            item.quantity += movement.quantity;
        } else {
            item.quantity -= movement.quantity;
            if (item.quantity < 0) {
                showNotification('Warning: Inventory quantity went negative!', 'warning');
                item.quantity = 0;
            }
        }
    }

    DATA.movements.push(movement);
    saveData();
    
    document.getElementById('movement-form-section').style.display = 'none';
    displayMovements();
    displayInventory();
    updateDashboard();
    showNotification('Stock movement recorded!', 'success');
});

function displayMovements() {
    const tbody = document.getElementById('movement-table-body');
    
    if (DATA.movements.length === 0) {
        tbody.innerHTML = '<tr class="empty-state"><td colspan="7">No stock movements recorded.</td></tr>';
        return;
    }

    tbody.innerHTML = DATA.movements.map(movement => {
        const item = DATA.inventory.find(i => i.id === movement.itemId);
        return `
            <tr>
                <td>${movement.date}</td>
                <td><span class="status-badge ${movement.type.toLowerCase()}">${movement.type}</span></td>
                <td>${item ? item.name : 'Unknown'}</td>
                <td>${movement.quantity.toFixed(2)}</td>
                <td>${movement.reference || '-'}</td>
                <td>${movement.notes || '-'}</td>
                <td>
                    <button class="btn btn-delete" onclick="deleteMovement(${movement.id})">Delete</button>
                </td>
            </tr>
        `;
    }).join('');
}

function deleteMovement(id) {
    if (confirm('Delete this stock movement?')) {
        const movement = DATA.movements.find(m => m.id === id);
        if (movement) {
            // Reverse the quantity change
            const item = DATA.inventory.find(i => i.id === movement.itemId);
            if (item) {
                if (movement.type === 'Inward') {
                    item.quantity -= movement.quantity;
                } else {
                    item.quantity += movement.quantity;
                }
            }
        }
        DATA.movements = DATA.movements.filter(m => m.id !== id);
        saveData();
        displayMovements();
        displayInventory();
    }
}

function updateMovementItemDropdown() {
    const select = document.getElementById('movement-item');
    select.innerHTML = '<option value="">Select Item</option>' + 
        DATA.inventory.map(i => `<option value="${i.id}">${i.code} - ${i.name}</option>`).join('');
}

// ============================
// REPORTS
// ============================

document.getElementById('btn-generate-report')?.addEventListener('click', () => {
    // Placeholder for report generation
    showNotification('Report generation functionality can be expanded!', 'info');
});

document.getElementById('btn-attendance-report')?.addEventListener('click', () => {
    generateAttendanceReport();
});

function generateAttendanceReport() {
    document.getElementById('report-results').style.display = 'block';
    document.getElementById('report-title').textContent = 'Attendance Report';
    
    const reportContent = document.getElementById('report-content');
    let html = '<table class="data-table"><thead><tr><th>Worker</th><th>Present</th><th>Half Day</th><th>Absent</th><th>Leave</th><th>Total Days</th></tr></thead><tbody>';

    DATA.workers.forEach(worker => {
        const records = DATA.attendance.filter(a => a.workerId === worker.id);
        const present = records.filter(r => r.status === 'Present').length;
        const halfDay = records.filter(r => r.status === 'Half Day').length;
        const absent = records.filter(r => r.status === 'Absent').length;
        const leave = records.filter(r => r.status === 'Leave').length;

        html += `<tr>
            <td>${worker.name}</td>
            <td>${present}</td>
            <td>${halfDay}</td>
            <td>${absent}</td>
            <td>${leave}</td>
            <td>${records.length}</td>
        </tr>`;
    });

    html += '</tbody></table>';
    reportContent.innerHTML = html;
}

// ============================
// UTILITY FUNCTIONS
// ============================

function showNotification(message, type = 'info') {
    // Create a simple notification (can be enhanced with toast library)
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 4px;
        color: white;
        font-weight: 500;
        z-index: 1000;
        animation: slideInRight 0.3s ease;
    `;

    if (type === 'success') {
        notification.style.backgroundColor = '#27ae60';
    } else if (type === 'error') {
        notification.style.backgroundColor = '#e74c3c';
    } else if (type === 'warning') {
        notification.style.backgroundColor = '#f39c12';
    } else {
        notification.style.backgroundColor = '#3498db';
    }

    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// ============================
// EVENT LISTENERS SETUP
// ============================

function setupEventListeners() {
    document.getElementById('logout-btn')?.addEventListener('click', () => {
        if (confirm('Are you sure you want to logout?')) {
            logoutUser();
            showNotification('Logged out successfully!', 'success');
            setTimeout(() => {
                showAuthPage();
                setupAuthEventListeners();
            }, 1000);
        }
    });
}

// Add status badge styles
const style = document.createElement('style');
style.textContent = `
    .status-badge {
        display: inline-block;
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 0.8em;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .status-badge.present {
        background-color: #d5f4e6;
        color: #27ae60;
    }

    .status-badge.absent {
        background-color: #fadbd8;
        color: #e74c3c;
    }

    .status-badge.half {
        background-color: #fef5e7;
        color: #f39c12;
    }

    .status-badge.leave {
        background-color: #d6eaf8;
        color: #3498db;
    }

    .status-badge.paid {
        background-color: #d5f4e6;
        color: #27ae60;
    }

    .status-badge.inward {
        background-color: #d6eaf8;
        color: #3498db;
    }

    .status-badge.outward {
        background-color: #fadbd8;
        color: #e74c3c;
    }

    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);
