let apartmentsCache = [];
let currentActiveTab = 'overview';

document.addEventListener('DOMContentLoaded', () => {
  setupTabs();
  loadAllData();
});

// Tab Switching
function setupTabs() {
  const navBtns = document.querySelectorAll('.nav-btn');
  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.getAttribute('data-tab');
      if (!tabId) return;

      navBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
      });

      const targetTab = document.getElementById(`tab-${tabId}`);
      if (targetTab) {
        targetTab.classList.add('active');
        currentActiveTab = tabId;
        updateHeaderTitle(tabId);
        loadTabData(tabId);
      }
    });
  });
}

function updateHeaderTitle(tabId) {
  const titles = {
    overview: 'Tổng quan Hệ thống Quản lý Chung cư',
    apartments: 'Danh mục Căn hộ Tòa nhà',
    residents: 'Quản lý Hồ sơ Cư dân Lưu trú',
    fees: 'Quản lý Hóa đơn & Phí Dịch vụ Tòa nhà',
    announcements: 'Bảng Tin & Thông báo Tòa nhà',
    complaints: 'Tiếp nhận & Xử lý Ý kiến Cư dân',
    devops: 'Trung tâm DevOps & Giám sát Hệ thống'
  };
  document.getElementById('header-title').innerText = titles[tabId] || 'Hệ thống Quản lý Chung cư';
}

function refreshCurrentTab() {
  loadTabData(currentActiveTab);
}

function loadAllData() {
  loadStats();
  loadApartments();
  loadResidents();
  loadFees();
  loadAnnouncements();
  loadComplaints();
}

function loadTabData(tabId) {
  if (tabId === 'overview') {
    loadStats();
    loadAnnouncements();
  } else if (tabId === 'apartments') {
    loadApartments();
  } else if (tabId === 'residents') {
    loadResidents();
  } else if (tabId === 'fees') {
    loadFees();
  } else if (tabId === 'announcements') {
    loadAnnouncements();
  } else if (tabId === 'complaints') {
    loadComplaints();
  }
}

// 1. Stats
async function loadStats() {
  try {
    const res = await fetch('/api/stats');
    const json = await res.json();
    if (!json.success) return;
    const { stats } = json;

    document.getElementById('stat-apartments').innerText = `${stats.apartments.occupied} / ${stats.apartments.total}`;
    document.getElementById('stat-residents').innerText = stats.residents;
    document.getElementById('stat-unpaid-fees').innerText = `${stats.fees.unpaid_count} căn`;
    document.getElementById('stat-unpaid-amount').innerText = `${formatVND(stats.fees.unpaid_amount)} cần thu`;
    document.getElementById('stat-complaints').innerText = `${stats.complaints.pending + stats.complaints.in_progress} vụ việc`;
  } catch (err) {
    console.error('Stats fetch error:', err);
  }
}

// 2. Apartments
async function loadApartments() {
  try {
    const res = await fetch('/api/apartments');
    const json = await res.json();
    if (!json.success) return;
    apartmentsCache = json.data;
    populateApartmentSelects(apartmentsCache);

    const tbody = document.getElementById('apartments-table-body');
    if (!tbody) return;
    tbody.innerHTML = apartmentsCache.map(a => `
      <tr>
        <td><strong>${a.room_number}</strong></td>
        <td>Tầng ${a.floor}</td>
        <td>${a.area} m²</td>
        <td>${a.bedrooms} phòng ngủ</td>
        <td>${renderAptStatus(a.status)}</td>
      </tr>
    `).join('');
  } catch (err) {
    console.error('Apartments error:', err);
  }
}

function renderAptStatus(status) {
  if (status === 'OCCUPIED') return '<span class="badge badge-success">Đang có người ở</span>';
  if (status === 'VACANT') return '<span class="badge badge-info">Phòng trống</span>';
  return '<span class="badge badge-warning">Đang sửa chữa</span>';
}

function populateApartmentSelects(apartments) {
  const aptSelects = [document.getElementById('resident-apt'), document.getElementById('comp-apt')];
  aptSelects.forEach(select => {
    if (!select) return;
    select.innerHTML = apartments.map(a => `<option value="${a.id}">Căn ${a.room_number} (Tầng ${a.floor})</option>`).join('');
  });
}

// 3. Residents
async function loadResidents() {
  try {
    const res = await fetch('/api/residents');
    const json = await res.json();
    if (!json.success) return;

    const tbody = document.getElementById('residents-table-body');
    if (!tbody) return;
    tbody.innerHTML = json.data.map(r => `
      <tr>
        <td><span class="badge badge-purple">${r.room_number || 'Chưa gán'}</span></td>
        <td><strong>${escapeHtml(r.full_name)}</strong></td>
        <td>${escapeHtml(r.phone)}</td>
        <td><code>${escapeHtml(r.identity_card)}</code></td>
        <td>${r.residency_type === 'PERMANENT' ? '<span class="badge badge-success">Thường trú</span>' : '<span class="badge badge-info">Tạm trú</span>'}</td>
        <td>${r.moved_in_date ? r.moved_in_date.split('T')[0] : 'N/A'}</td>
        <td>
          <button class="btn-danger btn-sm" onclick="deleteResident(${r.id})">Xóa</button>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    console.error('Residents error:', err);
  }
}

async function submitResident(e) {
  e.preventDefault();
  const data = {
    apartment_id: document.getElementById('resident-apt').value,
    full_name: document.getElementById('resident-name').value,
    phone: document.getElementById('resident-phone').value,
    identity_card: document.getElementById('resident-idcard').value,
    residency_type: document.getElementById('resident-type').value,
  };

  try {
    const res = await fetch('/api/residents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (json.success) {
      closeModal('modal-resident');
      document.getElementById('form-resident').reset();
      loadResidents();
      loadStats();
    } else {
      alert('Lỗi: ' + json.message);
    }
  } catch (err) {
    alert('Không thể lưu cư dân: ' + err.message);
  }
}

async function deleteResident(id) {
  if (!confirm('Bạn có chắc chắn muốn xóa hồ sơ cư dân này khỏi hệ thống?')) return;
  try {
    await fetch(`/api/residents/${id}`, { method: 'DELETE' });
    loadResidents();
    loadStats();
  } catch (err) {
    alert('Lỗi khi xóa: ' + err.message);
  }
}

// 4. Service Fees
async function loadFees() {
  try {
    const res = await fetch('/api/fees');
    const json = await res.json();
    if (!json.success) return;

    const tbody = document.getElementById('fees-table-body');
    if (!tbody) return;
    tbody.innerHTML = json.data.map(f => `
      <tr>
        <td><strong>${f.room_number}</strong></td>
        <td>${f.billing_month}</td>
        <td>${formatVND(f.electricity_fee)}</td>
        <td>${formatVND(f.water_fee)}</td>
        <td>${formatVND(f.management_fee)}</td>
        <td>${formatVND(f.parking_fee)}</td>
        <td><strong style="color: #2563eb;">${formatVND(f.total_amount)}</strong></td>
        <td>${f.payment_status === 'PAID' ? '<span class="badge badge-success">Đã nộp</span>' : '<span class="badge badge-danger">Chưa nộp</span>'}</td>
        <td>
          ${f.payment_status === 'UNPAID' ? `<button class="btn-success btn-sm" onclick="payFee(${f.id})">Nộp phí</button>` : `<span style="font-size: 11px; color: #10b981;">Hoàn tất</span>`}
        </td>
      </tr>
    `).join('');
  } catch (err) {
    console.error('Fees error:', err);
  }
}

async function payFee(id) {
  try {
    const res = await fetch(`/api/fees/${id}/pay`, { method: 'PUT' });
    const json = await res.json();
    if (json.success) {
      loadFees();
      loadStats();
    }
  } catch (err) {
    alert('Lỗi thanh toán: ' + err.message);
  }
}

// 5. Announcements
async function loadAnnouncements() {
  try {
    const res = await fetch('/api/announcements');
    const json = await res.json();
    if (!json.success) return;

    const grid = document.getElementById('announcements-grid');
    const overviewGrid = document.getElementById('overview-announcements');

    const html = json.data.map(a => `
      <div class="news-card">
        <div>
          <div class="news-meta">
            ${renderPriorityBadge(a.priority)}
            <span class="badge badge-info">${a.category}</span>
          </div>
          <h4 class="news-title">${escapeHtml(a.title)}</h4>
          <p class="news-body">${escapeHtml(a.content)}</p>
        </div>
        <div class="news-author">
          Đăng bởi: <strong>${escapeHtml(a.created_by)}</strong> • ${new Date(a.created_at).toLocaleDateString('vi-VN')}
        </div>
      </div>
    `).join('');

    if (grid) grid.innerHTML = html;
    if (overviewGrid) overviewGrid.innerHTML = html;
  } catch (err) {
    console.error('Announcements error:', err);
  }
}

function renderPriorityBadge(priority) {
  if (priority === 'URGENT') return '<span class="badge badge-danger">KHẨN CẤP</span>';
  if (priority === 'HIGH') return '<span class="badge badge-warning">ƯU TIÊN CAO</span>';
  return '<span class="badge badge-info">THƯỜNG</span>';
}

async function submitAnnouncement(e) {
  e.preventDefault();
  const data = {
    title: document.getElementById('ann-title').value,
    category: document.getElementById('ann-category').value,
    priority: document.getElementById('ann-priority').value,
    content: document.getElementById('ann-content').value,
    created_by: 'Lê Hoàng Quân (BQL Chung Cư)'
  };

  try {
    const res = await fetch('/api/announcements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (json.success) {
      closeModal('modal-announcement');
      document.getElementById('form-announcement').reset();
      loadAnnouncements();
    }
  } catch (err) {
    alert('Không thể tạo thông báo: ' + err.message);
  }
}

// 6. Complaints
async function loadComplaints() {
  try {
    const res = await fetch('/api/complaints');
    const json = await res.json();
    if (!json.success) return;

    const tbody = document.getElementById('complaints-table-body');
    if (!tbody) return;

    tbody.innerHTML = json.data.map(c => `
      <tr>
        <td><strong>${c.room_number || 'N/A'}</strong></td>
        <td>${escapeHtml(c.resident_name)}</td>
        <td>
          <strong>${escapeHtml(c.title)}</strong><br>
          <small style="color: #64748b;">${escapeHtml(c.description)}</small>
        </td>
        <td><span class="badge badge-info">${c.category}</span></td>
        <td>${renderComplaintStatus(c.status)}</td>
        <td><small>${c.response ? escapeHtml(c.response) : '<em>Chưa có phản hồi</em>'}</small></td>
        <td>
          ${c.status !== 'RESOLVED' ? `
            <button class="btn-success btn-sm" onclick="resolveComplaint(${c.id})">Đã xử lý</button>
          ` : '<span style="font-size:11px; color:#10b981;">✓ Xong</span>'}
        </td>
      </tr>
    `).join('');
  } catch (err) {
    console.error('Complaints error:', err);
  }
}

function renderComplaintStatus(status) {
  if (status === 'RESOLVED') return '<span class="badge badge-success">Đã giải quyết</span>';
  if (status === 'IN_PROGRESS') return '<span class="badge badge-warning">Đang xử lý</span>';
  return '<span class="badge badge-danger">Chờ tiếp nhận</span>';
}

async function resolveComplaint(id) {
  const response = prompt('Nhập nội dung phản hồi / cách giải quyết của BQL:', 'Ban quản lý đã kiểm tra và xử lý thỏa đáng yêu cầu của cư dân.');
  if (response === null) return;

  try {
    await fetch(`/api/complaints/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'RESOLVED', response })
    });
    loadComplaints();
    loadStats();
  } catch (err) {
    alert('Lỗi cập nhật: ' + err.message);
  }
}

async function submitComplaint(e) {
  e.preventDefault();
  const data = {
    apartment_id: document.getElementById('comp-apt').value,
    resident_name: document.getElementById('comp-name').value,
    category: document.getElementById('comp-cat').value,
    title: document.getElementById('comp-title').value,
    description: document.getElementById('comp-desc').value,
  };

  try {
    const res = await fetch('/api/complaints', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (json.success) {
      closeModal('modal-complaint');
      document.getElementById('form-complaint').reset();
      loadComplaints();
      loadStats();
    }
  } catch (err) {
    alert('Lỗi gửi phản ánh: ' + err.message);
  }
}

// 7. DevOps Actions
async function triggerTestError() {
  try {
    const res = await fetch('/api/test-error');
    const json = await res.json();
    alert(`[KẾT QUẢ TEST LOGQL] Đã sinh mã lỗi HTTP 500 thành công!\nThông điệp: ${json.message}\nLoki & Promtail sẽ ghi nhận log lỗi này.`);
  } catch (err) {
    alert('Đã kích hoạt lỗi: ' + err.message);
  }
}

// Modals
function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.add('active');
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove('active');
}

// Utility
function formatVND(amount) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
}

function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
