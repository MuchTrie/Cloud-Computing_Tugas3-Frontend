// API Configuration
// Backend server IP address
const API_BASE_URL = 'http://13.210.70.244:5000'; // Your EC2 backend server

// DOM Elements
const apiEndpointInput = document.getElementById('apiEndpoint');
const statusDiv = document.getElementById('status');
const dataDisplay = document.getElementById('dataDisplay');

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    // Set default endpoint
    apiEndpointInput.value = `${API_BASE_URL}/api/users`;
    
    // Load default data
    loadData();
    
    // Add filter buttons
    createFilterButtons();
});

// Create filter buttons for different endpoints
function createFilterButtons() {
    const apiSection = document.querySelector('.api-section');
    
    const filterDiv = document.createElement('div');
    filterDiv.innerHTML = `
        <div class="filter-buttons">
            <button class="filter-btn active" onclick="setEndpoint('/api/users')">All Users</button>
            <button class="filter-btn" onclick="setEndpoint('/api/users/city/jakarta')">Jakarta</button>
            <button class="filter-btn" onclick="setEndpoint('/api/users/city/bandung')">Bandung</button>
            <button class="filter-btn" onclick="setEndpoint('/api/users/job/developer')">Developers</button>
            <button class="filter-btn" onclick="setEndpoint('/api/users/job/manager')">Managers</button>
        </div>
    `;
    
    apiSection.appendChild(filterDiv);
}

// Set endpoint and update input
function setEndpoint(endpoint) {
    apiEndpointInput.value = `${API_BASE_URL}${endpoint}`;
    
    // Update active button
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    // Load data automatically
    loadData();
}

// Show status message
function showStatus(message, type = 'info') {
    statusDiv.innerHTML = `<div class="status ${type}">${message}</div>`;
    
    // Auto hide success/error messages after 5 seconds
    if (type === 'success' || type === 'error') {
        setTimeout(() => {
            statusDiv.innerHTML = '';
        }, 5000);
    }
}

// Load data from API
async function loadData() {
    const endpoint = apiEndpointInput.value.trim();
    
    if (!endpoint) {
        showStatus('⚠️ Masukkan endpoint API terlebih dahulu', 'error');
        return;
    }
    
    // Show loading status
    showStatus('🔄 Sedang memuat data...', 'loading');
    
    try {
        const response = await fetch(endpoint, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            mode: 'cors'
        });
        
        if (!response.ok) {
            if (response.status === 0 || response.status === 404) {
                throw new Error(`Server tidak dapat diakses. Pastikan backend server berjalan di ${API_BASE_URL}`);
            }
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        
        // Show success status
        showStatus('✅ Data berhasil dimuat', 'success');
        
        // Display data based on response structure
        if (result.status === 'success') {
            displayData(result.data, result.meta || result.count);
        } else {
            displayData(result);
        }
        
    } catch (error) {
        console.error('Error loading data:', error);
        
        // More specific error messages
        let errorMessage = error.message;
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            errorMessage = `Tidak dapat terhubung ke server backend di ${API_BASE_URL}. Pastikan server backend berjalan dan dapat diakses.`;
        }
        
        showStatus(`❌ Error: ${errorMessage}`, 'error');
        displayError(errorMessage);
    }
}

// Display data in different formats
function displayData(data, meta = null) {
    if (Array.isArray(data)) {
        // Display as user table
        displayUserTable(data, meta);
    } else if (data && typeof data === 'object') {
        // Display single user or object
        displayUserDetail(data);
    } else {
        // Display raw data
        displayRawData(data);
    }
}

// Display users in table format
function displayUserTable(users, meta = null) {
    if (!users || users.length === 0) {
        dataDisplay.innerHTML = `
            <div class="empty-state">
                <h3>Tidak ada data</h3>
                <p>Tidak ada pengguna yang ditemukan untuk endpoint ini</p>
            </div>
        `;
        return;
    }
    
    let metaInfo = '';
    if (meta) {
        if (typeof meta === 'number') {
            metaInfo = `<p><strong>Total:</strong> ${meta} users</p>`;
        } else if (meta.total_users) {
            metaInfo = `
                <p><strong>Total Users:</strong> ${meta.total_users}</p>
                <p><strong>Last Updated:</strong> ${meta.last_updated}</p>
                <p><strong>Data Source:</strong> ${meta.data_source}</p>
            `;
        }
    }
    
    const tableHTML = `
        <div class="data-table">
            <div class="table-header">
                <h3>📊 Data Pengguna</h3>
                ${metaInfo}
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
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${users.map(user => `
                            <tr>
                                <td>${user.id}</td>
                                <td>${user.name}</td>
                                <td>${user.email}</td>
                                <td>${user.age}</td>
                                <td>${user.city}</td>
                                <td>${user.pekerjaan}</td>
                                <td>${user.hobi}</td>
                                <td>
                                    <button class="btn-view" onclick="viewUserDetail(${user.id})">👁️ Detail</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    dataDisplay.innerHTML = tableHTML;
}

// Display single user detail
function displayUserDetail(user) {
    const detailHTML = `
        <div class="user-detail-card">
            <h3>👤 Detail Pengguna</h3>
            <div class="user-detail-grid">
                <div class="detail-item">
                    <strong>ID</strong>
                    <span>${user.id}</span>
                </div>
                <div class="detail-item">
                    <strong>Nama</strong>
                    <span>${user.name}</span>
                </div>
                <div class="detail-item">
                    <strong>Email</strong>
                    <span>${user.email}</span>
                </div>
                <div class="detail-item">
                    <strong>Umur</strong>
                    <span>${user.age} tahun</span>
                </div>
                <div class="detail-item">
                    <strong>Kota</strong>
                    <span>${user.city}</span>
                </div>
                <div class="detail-item">
                    <strong>Pekerjaan</strong>
                    <span>${user.pekerjaan}</span>
                </div>
                <div class="detail-item">
                    <strong>Hobi</strong>
                    <span>${user.hobi}</span>
                </div>
            </div>
            <div style="margin-top: 20px;">
                <button class="btn btn-primary" onclick="goBack()">⬅️ Kembali ke Daftar</button>
            </div>
        </div>
    `;
    
    dataDisplay.innerHTML = detailHTML;
}

// Display raw data (for API info, etc.)
function displayRawData(data) {
    const rawHTML = `
        <div class="api-info">
            <h3>📋 Response Data</h3>
            <pre style="background: #2a2f3e; padding: 15px; border-radius: 8px; overflow-x: auto; color: #ffffff; font-size: 14px;">${JSON.stringify(data, null, 2)}</pre>
        </div>
    `;
    
    dataDisplay.innerHTML = rawHTML;
}

// Display error message
function displayError(errorMessage) {
    dataDisplay.innerHTML = `
        <div class="empty-state">
            <h3>❌ Error</h3>
            <p>${errorMessage}</p>
            <p>Periksa endpoint API dan koneksi server backend</p>
        </div>
    `;
}

// View user detail by ID
async function viewUserDetail(userId) {
    const detailEndpoint = `${API_BASE_URL}/api/users/${userId}`;
    
    showStatus('🔄 Memuat detail pengguna...', 'loading');
    
    try {
        const response = await fetch(detailEndpoint, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            mode: 'cors'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        
        showStatus('✅ Detail pengguna berhasil dimuat', 'success');
        
        if (result.status === 'success') {
            displayUserDetail(result.data);
        } else {
            throw new Error(result.message || 'Failed to load user detail');
        }
        
    } catch (error) {
        console.error('Error loading user detail:', error);
        showStatus(`❌ Error: ${error.message}`, 'error');
    }
}

// Go back to user list
function goBack() {
    apiEndpointInput.value = `${API_BASE_URL}/api/users`;
    loadData();
}

// Test API connection
async function testConnection() {
    showStatus('🔄 Testing connection to backend server...', 'loading');
    
    try {
        const response = await fetch(`${API_BASE_URL}/health`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            mode: 'cors'
        });
        
        if (response.ok) {
            const result = await response.json();
            showStatus(`✅ Connected to backend server at ${API_BASE_URL}`, 'success');
            console.log('API Health Check:', result);
        } else {
            throw new Error(`Server responded with status ${response.status}`);
        }
        
    } catch (error) {
        showStatus(`❌ Cannot connect to backend server at ${API_BASE_URL}. Make sure the server is running and accessible.`, 'error');
        console.error('Connection test failed:', error);
    }
}

// Utility function to format data for display
function formatDisplayData(data) {
    if (typeof data === 'string') {
        try {
            return JSON.parse(data);
        } catch {
            return data;
        }
    }
    return data;
}

// Add keyboard shortcut for loading data
document.addEventListener('keydown', function(event) {
    if (event.ctrlKey && event.key === 'Enter') {
        loadData();
    }
});

// Test connection on page load
window.addEventListener('load', function() {
    setTimeout(testConnection, 1000);
});
