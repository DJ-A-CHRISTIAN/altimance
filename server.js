/**
 * ALTIMANCE - Serveur Backend
 * API REST pour gérer les données du site
 */

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'votre-secret-jwt-super-securise-changez-moi';

// Configuration Multer pour l'upload de fichiers
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = './uploads';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        // Nom de fichier unique : cv-timestamp-random.ext
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, 'cv-' + uniqueSuffix + ext);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Limite 5MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Format de fichier non supporté. Seul le PDF est accepté.'));
        }
    }
});

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Servir le dossier uploads

// Base de données SQLite
const db = new sqlite3.Database('./altimance.db', (err) => {
    if (err) {
        console.error('❌ Erreur connexion DB:', err.message);
    } else {
        console.log('✅ Connecté à la base de données SQLite');
        initDatabase();
    }
});

// Initialisation des tables
function initDatabase() {
    // Table utilisateurs admin
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT DEFAULT 'admin',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Table contacts
    db.run(`
        CREATE TABLE IF NOT EXISTS contacts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            full_name TEXT NOT NULL,
            email TEXT NOT NULL,
            company TEXT,
            subject TEXT,
            message TEXT NOT NULL,
            status TEXT DEFAULT 'nouveau',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Table candidatures
    db.run(`
        CREATE TABLE IF NOT EXISTS applications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            first_name TEXT NOT NULL,
            last_name TEXT NOT NULL,
            email TEXT NOT NULL,
            phone TEXT,
            position TEXT,
            message TEXT,
            cv_path TEXT,
            status TEXT DEFAULT 'en_attente',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Table opportunités d'emploi
    db.run(`
        CREATE TABLE IF NOT EXISTS job_opportunities (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            location TEXT NOT NULL,
            contract_type TEXT NOT NULL,
            description TEXT NOT NULL,
            requirements TEXT,
            salary_range TEXT,
            is_published INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Créer un admin par défaut
    const defaultPassword = bcrypt.hashSync('admin123', 10);
    db.run(`
        INSERT OR IGNORE INTO users (username, email, password, role) 
        VALUES ('admin', 'admin@altimance.com', ?, 'admin')
    `, [defaultPassword]);

    console.log('✅ Tables initialisées');
}

// Middleware d'authentification
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Token manquant' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Token invalide' });
        }
        req.user = user;
        next();
    });
}

// ============================================
// ROUTES AUTHENTIFICATION
// ============================================

// Login
app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;

    db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
        if (err) {
            return res.status(500).json({ error: 'Erreur serveur' });
        }
        if (!user) {
            return res.status(401).json({ error: 'Identifiants incorrects' });
        }

        if (bcrypt.compareSync(password, user.password)) {
            const token = jwt.sign(
                { id: user.id, username: user.username, role: user.role },
                JWT_SECRET,
                { expiresIn: '24h' }
            );
            res.json({
                success: true,
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role
                }
            });
        } else {
            res.status(401).json({ error: 'Identifiants incorrects' });
        }
    });
});

// Vérifier le token
app.get('/api/auth/verify', authenticateToken, (req, res) => {
    res.json({ valid: true, user: req.user });
});

// ============================================
// ROUTES CONTACTS
// ============================================

// Créer un contact (depuis le formulaire du site)
app.post('/api/contacts', (req, res) => {
    const { full_name, email, company, subject, message } = req.body;

    db.run(
        `INSERT INTO contacts (full_name, email, company, subject, message) 
         VALUES (?, ?, ?, ?, ?)`,
        [full_name, email, company, subject, message],
        function (err) {
            if (err) {
                return res.status(500).json({ error: 'Erreur lors de l\'enregistrement' });
            }
            res.json({
                success: true,
                message: 'Message envoyé avec succès',
                id: this.lastID
            });
        }
    );
});

// Récupérer tous les contacts (admin uniquement)
app.get('/api/contacts', authenticateToken, (req, res) => {
    const { status, limit = 50 } = req.query;

    let query = 'SELECT * FROM contacts';
    let params = [];

    if (status) {
        query += ' WHERE status = ?';
        params.push(status);
    }

    query += ' ORDER BY created_at DESC LIMIT ?';
    params.push(parseInt(limit));

    db.all(query, params, (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Erreur serveur' });
        }
        res.json({ contacts: rows });
    });
});

// Mettre à jour le statut d'un contact
app.patch('/api/contacts/:id', authenticateToken, (req, res) => {
    const { status } = req.body;
    const { id } = req.params;

    db.run(
        'UPDATE contacts SET status = ? WHERE id = ?',
        [status, id],
        function (err) {
            if (err) {
                return res.status(500).json({ error: 'Erreur lors de la mise à jour' });
            }
            res.json({ success: true, changes: this.changes });
        }
    );
});

// Supprimer un contact
app.delete('/api/contacts/:id', authenticateToken, (req, res) => {
    const { id } = req.params;

    db.run('DELETE FROM contacts WHERE id = ?', [id], function (err) {
        if (err) {
            return res.status(500).json({ error: 'Erreur lors de la suppression' });
        }
        res.json({ success: true, changes: this.changes });
    });
});
// ============================================
// ROUTES CANDIDATURES
// ============================================

// Créer une candidature
app.post('/api/applications', upload.single('cv'), (req, res) => {
    const { first_name, last_name, email, phone, position, message } = req.body;
    const cv_path = req.file ? req.file.path : null;

    db.run(
        `INSERT INTO applications (first_name, last_name, email, phone, position, message, cv_path) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [first_name, last_name, email, phone, position, message, cv_path],
        function (err) {
            if (err) {
                return res.status(500).json({ error: 'Erreur lors de l\'enregistrement' });
            }
            res.json({
                success: true,
                message: 'Candidature envoyée avec succès',
                id: this.lastID
            });
        }
    );
});

// Récupérer toutes les candidatures
app.get('/api/applications', authenticateToken, (req, res) => {
    const { status, limit = 50 } = req.query;

    let query = 'SELECT * FROM applications';
    let params = [];

    if (status) {
        query += ' WHERE status = ?';
        params.push(status);
    }

    query += ' ORDER BY created_at DESC LIMIT ?';
    params.push(parseInt(limit));

    db.all(query, params, (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Erreur serveur' });
        }
        res.json({ applications: rows });
    });
});

// Mettre à jour le statut d'une candidature
app.patch('/api/applications/:id', authenticateToken, (req, res) => {
    const { status } = req.body;
    const { id } = req.params;

    db.run(
        'UPDATE applications SET status = ? WHERE id = ?',
        [status, id],
        function (err) {
            if (err) {
                return res.status(500).json({ error: 'Erreur lors de la mise à jour' });
            }
            res.json({ success: true, changes: this.changes });
        }
    );
});

// Supprimer une candidature
app.delete('/api/applications/:id', authenticateToken, (req, res) => {
    const { id } = req.params;

    db.run('DELETE FROM applications WHERE id = ?', [id], function (err) {
        if (err) {
            return res.status(500).json({ error: 'Erreur lors de la suppression' });
        }
        res.json({ success: true, changes: this.changes });
    });
});

// ============================================
// ROUTES STATISTIQUES
// ============================================

app.get('/api/stats', authenticateToken, (req, res) => {
    const stats = {};

    // Compter les contacts
    db.get('SELECT COUNT(*) as total FROM contacts', (err, row) => {
        stats.totalContacts = row ? row.total : 0;

        // Compter les contacts par statut
        db.all('SELECT status, COUNT(*) as count FROM contacts GROUP BY status', (err, rows) => {
            stats.contactsByStatus = rows || [];

            // Compter les candidatures
            db.get('SELECT COUNT(*) as total FROM applications', (err, row) => {
                stats.totalApplications = row ? row.total : 0;

                // Compter les candidatures par statut
                db.all('SELECT status, COUNT(*) as count FROM applications GROUP BY status', (err, rows) => {
                    stats.applicationsByStatus = rows || [];

                    // Contacts récents (7 derniers jours)
                    db.get(
                        `SELECT COUNT(*) as count FROM contacts 
                         WHERE created_at >= datetime('now', '-7 days')`,
                        (err, row) => {
                            stats.recentContacts = row ? row.count : 0;

                            res.json(stats);
                        }
                    );
                });
            });
        });
    });
});

// ============================================
// ROUTES OPPORTUNITÉS D'EMPLOI
// ============================================

// Récupérer toutes les opportunités (public si published, admin sinon)
app.get('/api/opportunities', (req, res) => {
    const { published } = req.query;
    let query = 'SELECT * FROM job_opportunities';
    let params = [];

    if (published === 'true') {
        query += ' WHERE is_published = 1';
    }

    query += ' ORDER BY created_at DESC';

    db.all(query, params, (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Erreur serveur' });
        }
        res.json({ opportunities: rows });
    });
});

// Créer une opportunité (admin uniquement)
app.post('/api/opportunities', authenticateToken, (req, res) => {
    const { title, location, contract_type, description, requirements, salary_range, is_published } = req.body;

    db.run(
        `INSERT INTO job_opportunities (title, location, contract_type, description, requirements, salary_range, is_published) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [title, location, contract_type, description, requirements, salary_range, is_published ? 1 : 0],
        function (err) {
            if (err) {
                return res.status(500).json({ error: 'Erreur lors de la création' });
            }
            res.json({
                success: true,
                message: 'Opportunité créée avec succès',
                id: this.lastID
            });
        }
    );
});

// Mettre à jour une opportunité (admin uniquement)
app.patch('/api/opportunities/:id', authenticateToken, (req, res) => {
    const { title, location, contract_type, description, requirements, salary_range, is_published } = req.body;
    const { id } = req.params;

    db.run(
        `UPDATE job_opportunities 
         SET title = ?, location = ?, contract_type = ?, description = ?, requirements = ?, salary_range = ?, is_published = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [title, location, contract_type, description, requirements, salary_range, is_published ? 1 : 0, id],
        function (err) {
            if (err) {
                return res.status(500).json({ error: 'Erreur lors de la mise à jour' });
            }
            res.json({ success: true, changes: this.changes });
        }
    );
});

// Supprimer une opportunité (admin uniquement)
app.delete('/api/opportunities/:id', authenticateToken, (req, res) => {
    const { id } = req.params;

    db.run('DELETE FROM job_opportunities WHERE id = ?', [id], function (err) {
        if (err) {
            return res.status(500).json({ error: 'Erreur lors de la suppression' });
        }
        res.json({ success: true, changes: this.changes });
    });
});

// Toggle publish/unpublish (admin uniquement)
app.patch('/api/opportunities/:id/toggle-publish', authenticateToken, (req, res) => {
    const { id } = req.params;

    db.get('SELECT is_published FROM job_opportunities WHERE id = ?', [id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: 'Erreur serveur' });
        }
        if (!row) {
            return res.status(404).json({ error: 'Opportunité non trouvée' });
        }

        const newStatus = row.is_published === 1 ? 0 : 1;
        db.run(
            'UPDATE job_opportunities SET is_published = ? WHERE id = ?',
            [newStatus, id],
            function (err) {
                if (err) {
                    return res.status(500).json({ error: 'Erreur lors de la mise à jour' });
                }
                res.json({ success: true, is_published: newStatus });
            }
        );
    });
});

// ============================================
// ROUTES FICHIERS STATIQUES
// ============================================

// Servir le dashboard admin
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

// Servir la page de login
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

// Route racine
app.get('/api', (req, res) => {
    res.json({
        message: 'API ALTIMANCE',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth/login',
            contacts: '/api/contacts',
            applications: '/api/applications',
            stats: '/api/stats'
        }
    });
});

// Démarrage du serveur
app.listen(PORT, () => {
    console.log(`
    ╔════════════════════════════════════════╗
    ║   🚀 Serveur ALTIMANCE démarré       ║
    ║   📡 Port: ${PORT}                        ║
    ║   🔐 Admin: http://localhost:${PORT}/admin ║
    ║   👤 Login: admin / admin123           ║
    ╚════════════════════════════════════════╝
    `);
});

// Gestion de la fermeture propre
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('✅ Base de données fermée');
        process.exit(0);
    });
});
