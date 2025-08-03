// API Configuration
const API_BASE_URL = '/api/users';

// DOM Elements
const statusDiv = document.getElementById('status');
const dataDisplay = document.getElementById('dataDisplay');

// Show status message
function showStatus(message, type = 'info') {
    statusDiv.innerHTML = `<div class="status ${type}">${message}</div>`;
}

// Load data from API
async function loadData() {
    const endpoint = API_BASE_URL;

    showStatus('🔄 Mengambil data dari backend...', 'loading');

    try {
        const response = await fetch(endpoint);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: Server Error`);
        }

        const result = await response.json();
        console.log('Response dari backend:', result);

        showStatus('✅ Data berhasil dimuat dari backend!', 'success');

        // Display data
        if (result.status === 'success' && result.data && Array.isArray(result.data)) {
            displayUserTable(result.data);
        } else {
            displayRawData(result);
        }

    } catch (error) {
        console.error('Error:', error);
        showStatus(`❌ Gagal mengambil data: ${error.message}`, 'error');
        displayError(error.message);
    }
}

// Display users in table
function displayUserTable(users) {
    if (!users || users.length === 0) {
        dataDisplay.innerHTML = `
            <div class="empty-state">
                <h3>Tidak ada data</h3>
                <p>Tidak ada pengguna yang ditemukan</p>
            </div>
        `;
        return;
    }

    let tableHTML = `
        <div class="data-table">
            <div class="table-header">
                <h3>📊 Data Pengguna dari Backend</h3>
                <p><strong>Total:</strong> ${users.length} users</p>
            </div>
            <div class="table-content">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nama</th>
                            <th>Email</th>
                            <th>Umur</th>
                            <th>Kota</th>
                            <th>Pekerjaan</th>
                            <th>Hobi</th>
                        </tr>
                    </thead>
                    <tbody>
    `;

    users.forEach(user => {
        tableHTML += `
            <tr>
                <td>${user.id}</td>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>${user.age}</td>
                <td>${user.city}</td>
                <td>${user.pekerjaan}</td>
                <td>${user.hobi}</td>
            </tr>
        `;
    });

    tableHTML += `
                    </tbody>
                </table>
            </div>
        </div>
    `;

    dataDisplay.innerHTML = tableHTML;
}

// Display raw data
function displayRawData(data) {
    dataDisplay.innerHTML = `
        <div class="api-info">
            <h3>📋 Response dari Backend</h3>
            <pre style="background: #2a2f3e; padding: 15px; border-radius: 8px; overflow-x: auto; color: #ffffff; font-size: 14px;">${JSON.stringify(data, null, 2)}</pre>
        </div>
    `;
}

// Display error
function displayError(errorMessage) {
    dataDisplay.innerHTML = `
        <div class="empty-state">
            <h3>❌ Error</h3>
            <p>${errorMessage}</p>
            <p>Pastikan backend server berjalan di ${API_BASE_URL}</p>
        </div>
    `;
}
