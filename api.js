// Global variables
let currentBaseUrl = 'http://10.0.2.252:5000'; // Backend private IP

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    updateFilterButtons();
    setDefaultEndpoint();
});

// Set API endpoint
function setEndpoint(endpoint) {
    const input = document.getElementById('apiEndpoint');
    const baseUrl = input.value ? getBaseUrl(input.value) : currentBaseUrl;
    input.value = baseUrl + endpoint;
    
    // Update active filter button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Auto load data after setting endpoint
    loadData();
}

// Set default endpoint when page loads
function setDefaultEndpoint() {
    const input = document.getElementById('apiEndpoint');
    if (!input.value.trim()) {
        input.value = currentBaseUrl + '/api/users';
    }
}

// Get base URL from current input
function getBaseUrl(url) {
    try {
        const urlObj = new URL(url);
        return `${urlObj.protocol}//${urlObj.host}`;
    } catch (e) {
        return 'http://localhost:5000';
    }
}

// Update base URL and filter buttons
function updateFilterButtons() {
    const input = document.getElementById('apiEndpoint');
    const url = input.value;
    
    // Extract base URL
    try {
        const urlObj = new URL(url);
        currentBaseUrl = `${urlObj.protocol}//${urlObj.host}`;
    } catch (e) {
        currentBaseUrl = 'http://localhost:5000';
    }
}

// Show status message
function showStatus(message, type) {
    const statusDiv = document.getElementById('status');
    statusDiv.innerHTML = `<div class="status ${type}">${message}</div>`;
    
    // Auto hide after 5 seconds
    setTimeout(() => {
        statusDiv.innerHTML = '';
    }, 5000);
}

// Show loading state
function showLoading() {
    showStatus('⏳ Sedang memuat data...', 'loading');
}

// Main function to load data
async function loadData() {
    const endpoint = document.getElementById('apiEndpoint').value.trim();
    
    if (!endpoint) {
        showStatus('⚠️ Silakan masukkan endpoint API terlebih dahulu', 'error');
        return;
    }
    
    showLoading();
    updateFilterButtons();
    
    try {
        const response = await fetch(endpoint);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Determine what type of data we got and display accordingly
        if (endpoint.includes('/api/users') && !endpoint.match(/\/api\/users\/\d+$/)) {
            // Multiple users
            if (data.status === 'success' && Array.isArray(data.data)) {
                showStatus(`✅ Berhasil memuat ${data.total} data pengguna`, 'success');
                displayUsersData(data.data, data.total);
            } else {
                throw new Error('Format data tidak valid');
            }
        } else if (endpoint.match(/\/api\/users\/\d+$/)) {
            // Single user
            if (data.status === 'success' && data.data) {
                showStatus(`✅ ${data.message}`, 'success');
                displaySingleUser(data.data);
            } else {
                showStatus(`❌ ${data.message}`, 'error');
                clearDataDisplay();
            }
        } else {
            // API info or other
            showStatus('✅ Data berhasil dimuat', 'success');
            displayApiInfo(data);
        }
        
    } catch (error) {
        showStatus(`❌ Gagal memuat data: ${error.message}`, 'error');
        clearDataDisplay();
    }
}

// Clear data display
function clearDataDisplay() {
    document.getElementById('dataDisplay').innerHTML = `
        <div class="empty-state">
            <h3>Tidak ada data</h3>
            <p>Silakan coba endpoint yang berbeda</p>
        </div>
    `;
}

// Display multiple users as file-like cards
function displayUsersData(users, total) {
    const html = `
        <div class="data-table">
            <div class="table-header">
                <span>📊 Total: ${total} files</span>
            </div>
            <div class="file-grid">
                ${users.map(user => `
                    <div class="file-card">
                        <div class="file-header">
                            <div class="file-icon">👤</div>
                            <div class="file-info">
                                <h4>${user.name}</h4>
                            </div>
                        </div>
                        <div class="file-meta">
                            <div class="meta-item">
                                <span class="meta-icon">🆔</span>
                                <span>ID: ${user.id}</span>
                            </div>
                            <div class="meta-item">
                                <span class="meta-icon">📧</span>
                                <span>${user.email}</span>
                            </div>
                            <div class="meta-item">
                                <span class="meta-icon">🎂</span>
                                <span>${user.age} tahun</span>
                            </div>
                            <div class="meta-item">
                                <span class="meta-icon">🏙️</span>
                                <span>${user.city}</span>
                            </div>
                            <div class="meta-item">
                                <span class="meta-icon">💼</span>
                                <span>${user.pekerjaan}</span>
                            </div>
                            <div class="meta-item">
                                <span class="meta-icon">🎯</span>
                                <span>${user.hobi}</span>
                            </div>
                        </div>
                        <div class="file-actions">
                            <button class="btn-download" onclick="viewUserDetail(${user.id})">📄 Detail</button>
                            <button class="btn-view" onclick="downloadUserData(${user.id})">💾 Export</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    document.getElementById('dataDisplay').innerHTML = html;
}

// Display single user detail
function displaySingleUser(user) {
    const html = `
        <div class="user-detail-card">
            <h3>👤 Detail Pengguna</h3>
            <div class="user-detail-grid">
                <div class="detail-item">
                    <strong>ID</strong>
                    <span>${user.id}</span>
                </div>
                <div class="detail-item">
                    <strong>Nama Lengkap</strong>
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
        </div>
    `;
    
    document.getElementById('dataDisplay').innerHTML = html;
}

// Display API information
function displayApiInfo(data) {
    const html = `
        <div class="api-info">
            <h3>ℹ️ Informasi API</h3>
            <p><strong>Message:</strong> ${data.message || 'N/A'}</p>
            <p><strong>Status:</strong> ${data.status || 'N/A'}</p>
            ${data.data_info ? `<p><strong>Total Users:</strong> ${data.data_info.total_users}</p>` : ''}
            
            ${data.endpoints ? `
                <h4>📋 Available Endpoints:</h4>
                <ul class="endpoint-list">
                    ${Object.entries(data.endpoints).map(([endpoint, desc]) => 
                        `<li><strong>${endpoint}</strong> - ${desc}</li>`
                    ).join('')}
                </ul>
            ` : ''}
            
            ${data.usage_examples ? `
                <h4>🔗 Usage Examples:</h4>
                <ul class="endpoint-list">
                    ${Object.entries(data.usage_examples).map(([key, url]) => 
                        `<li><strong>${key}:</strong> ${url}</li>`
                    ).join('')}
                </ul>
            ` : ''}
        </div>
    `;
    
    document.getElementById('dataDisplay').innerHTML = html;
}

// View user detail (helper function)
function viewUserDetail(userId) {
    const input = document.getElementById('apiEndpoint');
    input.value = `${currentBaseUrl}/api/users/${userId}`;
    
    // Update active filter
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    loadData();
}

// Download user data (placeholder function)
function downloadUserData(userId) {
    showStatus(`💾 Downloading data for user ID ${userId}...`, 'loading');
    
    // Simulate download
    setTimeout(() => {
        showStatus(`✅ Data user ID ${userId} berhasil didownload`, 'success');
    }, 1500);
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Enter key to load data
    if (e.key === 'Enter' && document.activeElement.id === 'apiEndpoint') {
        loadData();
    }
    
    // Ctrl/Cmd + Enter to load data from anywhere
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        loadData();
    }
});

// Auto-load data when page loads
window.addEventListener('load', function() {
    // Don't auto load data, let user input endpoint first
    console.log('Frontend loaded. Please enter API endpoint to load data.');
});
