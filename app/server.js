const express = require('express');
const { Pool } = require('pg');
const client = require('prom-client');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.APP_PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Structured JSON Logger
function log(level, message, meta = {}) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    service: 'apartment-app',
    topic: 'De-36-Apartment-Management',
    level,
    message,
    ...meta
  };
  console.log(JSON.stringify(logEntry));
}

// Database Connection Pool
const pool = new Pool({
  host: process.env.DB_HOST || 'apartment-db',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'SecretApartment2026!',
  database: process.env.DB_NAME || 'apartment_db',
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// Test and reconnect logic
async function verifyDatabaseConnection() {
  let retries = 5;
  while (retries > 0) {
    try {
      const res = await pool.query('SELECT NOW()');
      log('INFO', 'PostgreSQL Database Connected Successfully', { db_time: res.rows[0].now });
      return;
    } catch (err) {
      log('WARN', `Database connection failed, retrying in 3 seconds... (${retries} left)`, { error: err.message });
      retries -= 1;
      await new Promise(r => setTimeout(r, 3000));
    }
  }
  log('ERROR', 'Could not establish connection to PostgreSQL database after multiple retries');
}

// Prometheus Observability Setup
const register = new client.Registry();
client.collectDefaultMetrics({ register, prefix: 'apartment_' });

const httpRequestsTotal = new client.Counter({
  name: 'apartment_http_requests_total',
  help: 'Total number of HTTP requests processed by Apartment Management App',
  labelNames: ['method', 'route', 'status_code'],
});
register.registerMetric(httpRequestsTotal);

const httpRequestDuration = new client.Histogram({
  name: 'apartment_http_request_duration_seconds',
  help: 'Histogram of HTTP request durations in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5],
});
register.registerMetric(httpRequestDuration);

const residentsGauge = new client.Gauge({
  name: 'apartment_residents_total',
  help: 'Total number of registered residents in the building',
});
register.registerMetric(residentsGauge);

const unpaidFeesGauge = new client.Gauge({
  name: 'apartment_unpaid_fees_count',
  help: 'Number of unpaid service fee invoices',
});
register.registerMetric(unpaidFeesGauge);

const activeComplaintsGauge = new client.Gauge({
  name: 'apartment_active_complaints_count',
  help: 'Number of unresolved complaints from residents',
});
register.registerMetric(activeComplaintsGauge);

// Request metric & logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route ? req.route.path : req.path;
    httpRequestsTotal.inc({ method: req.method, route, status_code: res.statusCode });
    httpRequestDuration.observe({ method: req.method, route, status_code: res.statusCode }, duration);

    const logLevel = res.statusCode >= 500 ? 'ERROR' : res.statusCode >= 400 ? 'WARN' : 'INFO';
    log(logLevel, `${req.method} ${req.originalUrl} - ${res.statusCode}`, {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration_sec: duration,
      client_ip: req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress
    });
  });
  next();
});

// Periodic Gauge Updater
async function updateGauges() {
  try {
    const resCount = await pool.query('SELECT COUNT(*) FROM residents');
    residentsGauge.set(parseInt(resCount.rows[0].count, 10));

    const unpaidCount = await pool.query("SELECT COUNT(*) FROM service_fees WHERE payment_status = 'UNPAID'");
    unpaidFeesGauge.set(parseInt(unpaidCount.rows[0].count, 10));

    const compCount = await pool.query("SELECT COUNT(*) FROM complaints WHERE status != 'RESOLVED'");
    activeComplaintsGauge.set(parseInt(compCount.rows[0].count, 10));
  } catch (err) {
    // Ignore initial gauge error if DB not ready
  }
}
setInterval(updateGauges, 15000);

// --- ROUTES ---

// Healthcheck endpoint for Docker & Kubernetes
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.status(200).json({
      status: 'UP',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      database: 'CONNECTED',
      service: 'Apartment Management System (De 36)'
    });
  } catch (err) {
    res.status(503).json({
      status: 'DOWN',
      error: err.message,
      database: 'DISCONNECTED'
    });
  }
});

// Prometheus Scrape Endpoint
app.get('/metrics', async (req, res) => {
  try {
    await updateGauges();
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (err) {
    res.status(500).end(err.message);
  }
});

// Dashboard Statistics API
app.get('/api/stats', async (req, res) => {
  try {
    const aptRes = await pool.query('SELECT COUNT(*) AS total, SUM(CASE WHEN status = \'OCCUPIED\' THEN 1 ELSE 0 END) AS occupied FROM apartments');
    const residentRes = await pool.query('SELECT COUNT(*) AS total FROM residents');
    const feeRes = await pool.query('SELECT COUNT(*) AS total, SUM(CASE WHEN payment_status = \'UNPAID\' THEN 1 ELSE 0 END) AS unpaid, SUM(CASE WHEN payment_status = \'UNPAID\' THEN total_amount ELSE 0 END) AS unpaid_amount FROM service_fees');
    const complaintRes = await pool.query('SELECT COUNT(*) AS total, SUM(CASE WHEN status = \'PENDING\' THEN 1 ELSE 0 END) AS pending, SUM(CASE WHEN status = \'IN_PROGRESS\' THEN 1 ELSE 0 END) AS in_progress FROM complaints');

    res.json({
      success: true,
      stats: {
        apartments: {
          total: parseInt(aptRes.rows[0].total || 0, 10),
          occupied: parseInt(aptRes.rows[0].occupied || 0, 10)
        },
        residents: parseInt(residentRes.rows[0].total || 0, 10),
        fees: {
          total_invoices: parseInt(feeRes.rows[0].total || 0, 10),
          unpaid_count: parseInt(feeRes.rows[0].unpaid || 0, 10),
          unpaid_amount: parseFloat(feeRes.rows[0].unpaid_amount || 0)
        },
        complaints: {
          total: parseInt(complaintRes.rows[0].total || 0, 10),
          pending: parseInt(complaintRes.rows[0].pending || 0, 10),
          in_progress: parseInt(complaintRes.rows[0].in_progress || 0, 10)
        }
      }
    });
  } catch (err) {
    log('ERROR', 'Failed to retrieve stats', { error: err.message });
    res.status(500).json({ success: false, error: err.message });
  }
});

// Residents API
app.get('/api/residents', async (req, res) => {
  try {
    const query = `
      SELECT r.*, a.room_number, a.floor
      FROM residents r
      LEFT JOIN apartments a ON r.apartment_id = a.id
      ORDER BY r.id DESC
    `;
    const result = await pool.query(query);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    log('ERROR', 'Error fetching residents', { error: err.message });
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/residents', async (req, res) => {
  const { apartment_id, full_name, phone, identity_card, email, residency_type } = req.body;
  if (!full_name || !phone || !identity_card) {
    return res.status(400).json({ success: false, message: 'Missing required resident information' });
  }
  try {
    const result = await pool.query(
      `INSERT INTO residents (apartment_id, full_name, phone, identity_card, email, residency_type)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [apartment_id || null, full_name, phone, identity_card, email || null, residency_type || 'PERMANENT']
    );
    log('INFO', `Resident created: ${full_name}`, { resident_id: result.rows[0].id });
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    log('ERROR', 'Error creating resident', { error: err.message });
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/residents/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM residents WHERE id = $1', [req.params.id]);
    log('INFO', `Resident deleted ID: ${req.params.id}`);
    res.json({ success: true, message: 'Resident removed successfully' });
  } catch (err) {
    log('ERROR', 'Error deleting resident', { error: err.message });
    res.status(500).json({ success: false, error: err.message });
  }
});

// Apartments API
app.get('/api/apartments', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM apartments ORDER BY room_number ASC');
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Service Fees API
app.get('/api/fees', async (req, res) => {
  try {
    const query = `
      SELECT f.*, a.room_number
      FROM service_fees f
      JOIN apartments a ON f.apartment_id = a.id
      ORDER BY f.id DESC
    `;
    const result = await pool.query(query);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    log('ERROR', 'Error fetching service fees', { error: err.message });
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/fees/:id/pay', async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE service_fees SET payment_status = 'PAID', paid_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }
    log('INFO', `Service fee paid for invoice ID: ${req.params.id}`, { invoice_id: req.params.id });
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    log('ERROR', 'Error updating fee payment', { error: err.message });
    res.status(500).json({ success: false, error: err.message });
  }
});

// Announcements API
app.get('/api/announcements', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM announcements ORDER BY priority = \'URGENT\' DESC, created_at DESC');
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/announcements', async (req, res) => {
  const { title, category, content, priority, created_by } = req.body;
  if (!title || !content) {
    return res.status(400).json({ success: false, message: 'Title and content are required' });
  }
  try {
    const result = await pool.query(
      `INSERT INTO announcements (title, category, content, priority, created_by)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [title, category || 'GENERAL', content, priority || 'NORMAL', created_by || 'Ban Quản trị Tòa nhà']
    );
    log('INFO', `New announcement published: ${title}`);
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Complaints API
app.get('/api/complaints', async (req, res) => {
  try {
    const query = `
      SELECT c.*, a.room_number
      FROM complaints c
      LEFT JOIN apartments a ON c.apartment_id = a.id
      ORDER BY c.status = 'PENDING' DESC, c.created_at DESC
    `;
    const result = await pool.query(query);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/complaints', async (req, res) => {
  const { apartment_id, resident_name, title, category, description } = req.body;
  if (!resident_name || !title || !description) {
    return res.status(400).json({ success: false, message: 'Resident name, title and description required' });
  }
  try {
    const result = await pool.query(
      `INSERT INTO complaints (apartment_id, resident_name, title, category, description, status)
       VALUES ($1, $2, $3, $4, $5, 'PENDING') RETURNING *`,
      [apartment_id || null, resident_name, title, category || 'OTHER', description]
    );
    log('INFO', `New complaint filed by resident: ${resident_name}`, { complaint_id: result.rows[0].id });
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    log('ERROR', 'Error filing complaint', { error: err.message });
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/complaints/:id/status', async (req, res) => {
  const { status, response } = req.body;
  try {
    const resolvedAt = status === 'RESOLVED' ? 'CURRENT_TIMESTAMP' : 'NULL';
    const result = await pool.query(
      `UPDATE complaints
       SET status = $1, response = COALESCE($2, response), resolved_at = ${resolvedAt}
       WHERE id = $3 RETURNING *`,
      [status, response, req.params.id]
    );
    log('INFO', `Complaint ID ${req.params.id} updated to status ${status}`);
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Trigger 500 error endpoint for testing LogQL & Prometheus alerts
app.get('/api/test-error', (req, res) => {
  log('ERROR', 'Simulated 500 Internal Server Error for LogQL verification', {
    trigger_endpoint: '/api/test-error',
    simulated: true,
    student: 'Le Hoang Quan - DTC245200572'
  });
  res.status(500).json({
    success: false,
    message: 'Simulated 500 Internal Server Error for LogQL / Alert verification.'
  });
});

// Default catch-all for single-page dashboard
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Server
app.listen(port, () => {
  log('INFO', `Apartment Management System (De 36) running on port ${port}`, {
    port,
    student: 'Le Hoang Quan',
    mssv: 'DTC245200572',
    course: 'Trien khai va Quan tri He thong Phan mem'
  });
  verifyDatabaseConnection();
});
