// Global variables
let currentBaseUrl = 'http://10.0.2.252:5000'; // Backend private IP

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('🌟 Frontend initialized');
    console.log('🔗 Backend URL:', currentBaseUrl);
    setDefaultEndpoint();
    
    // Set active button
    const allUsersBtn = document.querySelector('button[onclick*="/api/users"]:not([onclick*="/api/users/"])');
    if (allUsersBtn) {
        allUsersBtn.classList.add('active');
    }
});

// Set API endpoint
function setEndpoint(endpoint) {
    const input = document.getElementById('apiEndpoint');
    input.value = currentBaseUrl + endpoint;
    
    // Update active filter button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    if (event && event.target) {
        event.target.classList.add('active');
    }
    
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
    
    // Create status element with proper styling
    const statusClass = type === 'error' ? 'error' : 
                       type === 'success' ? 'success' : 
                       type === 'loading' ? 'loading' : 'info';
    
    statusDiv.innerHTML = `<div class="status ${statusClass}">${message}</div>`;
    
    // Auto hide after 8 seconds for success messages only
    if (type === 'success') {
        setTimeout(() => {
            statusDiv.innerHTML = '';
        }, 8000);
    }
    
    // Keep error messages visible longer (don't auto-hide)
    // Keep loading messages until replaced
}

// Show loading state
function showLoading() {
    showStatus('⏳ Sedang memuat data...', 'loading');
}

// Main function to load data with XMLHttpRequest fallback
async function loadData() {
    const endpoint = document.getElementById('apiEndpoint').value.trim();
    
    if (!endpoint) {
        showStatus('⚠️ Silakan masukkan endpoint API terlebih dahulu', 'error');
        return;
    }
    
    showLoading();
    updateFilterButtons();
    
    try {
        console.log('🚀 Fetching from:', endpoint);
        
        // Try fetch first, fallback to XMLHttpRequest
        let data;
        try {
            const response = await fetch(endpoint, {
                method: 'GET',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
            
            console.log('📡 Fetch Response status:', response.status);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            data = await response.json();
        } catch (fetchError) {
            console.log('⚠️ Fetch failed, trying XMLHttpRequest...', fetchError.message);
            
            // Fallback to XMLHttpRequest
            data = await new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.open('GET', endpoint, true);
                xhr.setRequestHeader('Content-Type', 'application/json');
                xhr.setRequestHeader('Accept', 'application/json');
                
                xhr.onload = function() {
                    console.log('📡 XHR Response status:', xhr.status);
                    if (xhr.status >= 200 && xhr.status < 300) {
                        try {
                            const responseData = JSON.parse(xhr.responseText);
                            resolve(responseData);
                        } catch (parseError) {
                            reject(new Error('Invalid JSON response'));
                        }
                    } else {
                        reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`));
                    }
                };
                
                xhr.onerror = function() {
                    reject(new Error('Network request failed'));
                };
                
                xhr.ontimeout = function() {
                    reject(new Error('Request timeout'));
                };
                
                xhr.timeout = 10000; // 10 second timeout
                xhr.send();
            });
        }
        
        console.log('📦 Response data:', data);
        
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
        console.error('❌ Final error:', error);
        console.error('Error details:', {
            message: error.message,
            name: error.name,
            stack: error.stack
        });
        
        let errorMessage = error.message;
        let troubleshootingTips = '';
        
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
            errorMessage = 'Koneksi gagal - Network Error';
            troubleshootingTips = '<br>🔍 Troubleshooting:<br>1) Pastikan backend server running<br>2) Check Security Group port 5000<br>3) Periksa URL endpoint benar';
        } else if (error.message.includes('CORS')) {
            errorMessage = 'CORS Policy Error';
            troubleshootingTips = '<br>🔍 Backend perlu configure CORS headers';
        } else if (error.message.includes('timeout')) {
            errorMessage = 'Request timeout - Server terlalu lama respond';
        }
        
        showStatus(`❌ ${errorMessage}${troubleshootingTips}`, 'error');
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
    console.log('Frontend loaded.');
    
    // Auto load data if endpoint is already filled
    setTimeout(() => {
        const endpoint = document.getElementById('apiEndpoint').value.trim();
        if (endpoint) {
            console.log('Auto-loading data for:', endpoint);
            loadData();
        }
    }, 1000);
});
