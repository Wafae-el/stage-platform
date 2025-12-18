const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Configuration de la base de données
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'stage_platform'
};

let pool;

// Initialiser la connexion à la base de données
async function initDatabase() {
  try {
    pool = mysql.createPool(dbConfig);
    console.log('✅ Connexion à la base de données établie');
    
    // Créer les tables si elles n'existent pas
    await createTables();
  } catch (error) {
    console.error('❌ Erreur de connexion à la base de données:', error);
    process.exit(1);
  }
}

// Créer les tables
async function createTables() {
  const connection = await pool.getConnection();
  
  try {
    // Table users
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nom VARCHAR(100) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        role ENUM('etudiant', 'admin') NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Table stages
    await connection.query(`
      CREATE TABLE IF NOT EXISTS stages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        id_etudiant INT NOT NULL,
        entreprise VARCHAR(200) NOT NULL,
        sujet TEXT NOT NULL,
        date_debut DATE NOT NULL,
        date_fin DATE NOT NULL,
        statut ENUM('en_attente', 'valide', 'refuse') DEFAULT 'en_attente',
        commentaire TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (id_etudiant) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Insérer des données de test
    const [users] = await connection.query('SELECT COUNT(*) as count FROM users');
    if (users[0].count === 0) {
      await connection.query(`
        INSERT INTO users (nom, email, role) VALUES 
        ('Admin Principal', 'admin@ecole.ma', 'admin'),
        ('Wafae El Kari', 'wafae.elkari@etudiant.ma', 'etudiant'),
        ('Souha Siragi', 'souha.siragi@etudiant.ma', 'etudiant')
      `);
      console.log('✅ Données de test insérées');
    }

    console.log('✅ Tables créées avec succès');
  } catch (error) {
    console.error('❌ Erreur lors de la création des tables:', error);
  } finally {
    connection.release();
  }
}

// ==================== ROUTES ====================

// 🏠 Route de test
app.get('/', (req, res) => {
  res.json({ message: '🎓 API Plateforme de Stages' });
});

// 👥 GET - Récupérer tous les utilisateurs
app.get('/api/users', async (req, res) => {
  try {
    const [users] = await pool.query('SELECT * FROM users ORDER BY nom');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des utilisateurs' });
  }
});

// 👤 GET - Récupérer un utilisateur par email
app.get('/api/users/email/:email', async (req, res) => {
  try {
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [req.params.email]);
    if (users.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    res.json(users[0]);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération de l\'utilisateur' });
  }
});

// 📝 POST - Créer un utilisateur
app.post('/api/users', async (req, res) => {
  const { nom, email, role } = req.body;
  
  if (!nom || !email || !role) {
    return res.status(400).json({ error: 'Tous les champs sont requis' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO users (nom, email, role) VALUES (?, ?, ?)',
      [nom, email, role]
    );
    
    const [newUser] = await pool.query('SELECT * FROM users WHERE id = ?', [result.insertId]);
    res.status(201).json(newUser[0]);
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Cet email existe déjà' });
    }
    res.status(500).json({ error: 'Erreur lors de la création de l\'utilisateur' });
  }
});

// 📋 GET - Récupérer tous les stages
app.get('/api/stages', async (req, res) => {
  try {
    const [stages] = await pool.query(`
      SELECT s.*, u.nom as nom_etudiant, u.email as email_etudiant
      FROM stages s
      JOIN users u ON s.id_etudiant = u.id
      ORDER BY s.created_at DESC
    `);
    res.json(stages);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des stages' });
  }
});

// 📄 GET - Récupérer un stage par ID
app.get('/api/stages/:id', async (req, res) => {
  try {
    const [stages] = await pool.query(`
      SELECT s.*, u.nom as nom_etudiant, u.email as email_etudiant
      FROM stages s
      JOIN users u ON s.id_etudiant = u.id
      WHERE s.id = ?
    `, [req.params.id]);
    
    if (stages.length === 0) {
      return res.status(404).json({ error: 'Stage non trouvé' });
    }
    res.json(stages[0]);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération du stage' });
  }
});

// 📋 GET - Récupérer les stages d'un étudiant
app.get('/api/stages/etudiant/:id', async (req, res) => {
  try {
    const [stages] = await pool.query(`
      SELECT s.*, u.nom as nom_etudiant, u.email as email_etudiant
      FROM stages s
      JOIN users u ON s.id_etudiant = u.id
      WHERE s.id_etudiant = ?
      ORDER BY s.created_at DESC
    `, [req.params.id]);
    res.json(stages);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des stages' });
  }
});

// ➕ POST - Créer une déclaration de stage
app.post('/api/stages', async (req, res) => {
  const { id_etudiant, entreprise, sujet, date_debut, date_fin } = req.body;
  
  if (!id_etudiant || !entreprise || !sujet || !date_debut || !date_fin) {
    return res.status(400).json({ error: 'Tous les champs sont requis' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO stages (id_etudiant, entreprise, sujet, date_debut, date_fin) VALUES (?, ?, ?, ?, ?)',
      [id_etudiant, entreprise, sujet, date_debut, date_fin]
    );
    
    const [newStage] = await pool.query(`
      SELECT s.*, u.nom as nom_etudiant, u.email as email_etudiant
      FROM stages s
      JOIN users u ON s.id_etudiant = u.id
      WHERE s.id = ?
    `, [result.insertId]);
    
    res.status(201).json(newStage[0]);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la création du stage' });
  }
});

// ✏️ PUT - Mettre à jour le statut d'un stage
app.put('/api/stages/:id/statut', async (req, res) => {
  const { statut, commentaire } = req.body;
  
  if (!statut || !['en_attente', 'valide', 'refuse'].includes(statut)) {
    return res.status(400).json({ error: 'Statut invalide' });
  }

  try {
    await pool.query(
      'UPDATE stages SET statut = ?, commentaire = ? WHERE id = ?',
      [statut, commentaire || null, req.params.id]
    );
    
    const [updatedStage] = await pool.query(`
      SELECT s.*, u.nom as nom_etudiant, u.email as email_etudiant
      FROM stages s
      JOIN users u ON s.id_etudiant = u.id
      WHERE s.id = ?
    `, [req.params.id]);
    
    if (updatedStage.length === 0) {
      return res.status(404).json({ error: 'Stage non trouvé' });
    }
    
    res.json(updatedStage[0]);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la mise à jour du stage' });
  }
});

// 🗑️ DELETE - Supprimer un stage
app.delete('/api/stages/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM stages WHERE id = ?', [req.params.id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Stage non trouvé' });
    }
    
    res.json({ message: 'Stage supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la suppression du stage' });
  }
});

// 📊 GET - Statistiques (pour l'admin)
app.get('/api/statistiques', async (req, res) => {
  try {
    const [stats] = await pool.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN statut = 'en_attente' THEN 1 ELSE 0 END) as en_attente,
        SUM(CASE WHEN statut = 'valide' THEN 1 ELSE 0 END) as valides,
        SUM(CASE WHEN statut = 'refuse' THEN 1 ELSE 0 END) as refuses
      FROM stages
    `);
    res.json(stats[0]);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des statistiques' });
  }
});

// Démarrer le serveur
initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur le port ${PORT}`);
    console.log(`📍 API disponible sur http://localhost:${PORT}`);
  });
});

module.exports = app;