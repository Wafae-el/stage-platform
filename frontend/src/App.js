import React, { useState, useEffect } from 'react';
import { Users, Briefcase, PlusCircle, CheckCircle, XCircle, Clock, FileText, Search, Filter } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

const api = {
  getUsers: async () => {
    const response = await fetch(`${API_URL}/users`);
    return response.json();
  },
  getStages: async () => {
    const response = await fetch(`${API_URL}/stages`);
    return response.json();
  },
  getStagesByEtudiant: async (id) => {
    const response = await fetch(`${API_URL}/stages/etudiant/${id}`);
    return response.json();
  },
  createStage: async (stageData) => {
    const response = await fetch(`${API_URL}/stages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(stageData)
    });
    return response.json();
  },
  updateStatut: async (id, statut, commentaire) => {
    const response = await fetch(`${API_URL}/stages/${id}/statut`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ statut, commentaire })
    });
    return response.json();
  },
  getStatistiques: async () => {
    const response = await fetch(`${API_URL}/statistiques`);
    return response.json();
  }
};

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [view, setView] = useState('login');
  const [users, setUsers] = useState([]);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await api.getUsers();
      setUsers(data);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleLogin = (user) => {
    setCurrentUser(user);
    setView(user.role === 'admin' ? 'admin' : 'etudiant');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setView('login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-100">
      <header className="bg-gray-800/50 backdrop-blur-md border-b border-gray-700 shadow-xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Briefcase className="text-blue-400" size={32} />
              <div>
                <h1 className="text-2xl font-bold text-white">Plateforme de Stages</h1>
                <p className="text-sm text-gray-400">Gestion & Suivi des déclarations</p>
              </div>
            </div>
            {currentUser && (
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-semibold text-white">{currentUser.nom}</p>
                  <p className="text-xs text-gray-400">{currentUser.role === 'admin' ? 'Administrateur' : 'Étudiant'}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white font-medium transition-all"
                >
                  Déconnexion
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {view === 'login' && <LoginView users={users} onLogin={handleLogin} />}
        {view === 'etudiant' && <EtudiantView user={currentUser} />}
        {view === 'admin' && <AdminView user={currentUser} />}
      </main>
    </div>
  );
}

function LoginView({ users, onLogin }) {
  const [selectedEmail, setSelectedEmail] = useState('');

  const handleSubmit = () => {
    const user = users.find(u => u.email === selectedEmail);
    if (user) {
      onLogin(user);
    }
  };

  const etudiants = users.filter(u => u.role === 'etudiant');
  const admins = users.filter(u => u.role === 'admin');

  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <div className="bg-gray-800/50 backdrop-blur-md border border-gray-700 rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <Users className="mx-auto text-blue-400 mb-4" size={48} />
          <h2 className="text-3xl font-bold text-white mb-2">Connexion</h2>
          <p className="text-gray-400">Sélectionnez votre profil pour continuer</p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Profil Utilisateur
            </label>
            <select
              value={selectedEmail}
              onChange={(e) => setSelectedEmail(e.target.value)}
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">-- Choisir un utilisateur --</option>
              <optgroup label="👨‍💼 Administrateurs">
                {admins.map(user => (
                  <option key={user.id} value={user.email}>
                    {user.nom} ({user.email})
                  </option>
                ))}
              </optgroup>
              <optgroup label="🎓 Étudiants">
                {etudiants.map(user => (
                  <option key={user.id} value={user.email}>
                    {user.nom} ({user.email})
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!selectedEmail}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg shadow-lg transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Se connecter
          </button>
        </div>

        <div className="mt-6 p-4 bg-gray-700/30 rounded-lg border border-gray-600">
          <p className="text-xs text-gray-400 text-center">
            💡 Projet de démonstration - Aucune authentification réelle requise
          </p>
        </div>
      </div>
    </div>
  );
}

function EtudiantView({ user }) {
  const [stages, setStages] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStages();
  }, [user]);

  const loadStages = async () => {
    try {
      setLoading(true);
      const data = await api.getStagesByEtudiant(user.id);
      setStages(data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStageCreated = () => {
    setShowForm(false);
    loadStages();
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 shadow-xl">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Bienvenue, {user.nom}</h2>
            <p className="text-blue-100">Gérez vos déclarations de stage</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg shadow-lg hover:bg-blue-50 transition-all"
          >
            <PlusCircle size={20} />
            Déclarer un stage
          </button>
        </div>
      </div>

      {showForm && (
        <StageForm 
          etudiantId={user.id} 
          onSubmit={handleStageCreated}
          onCancel={() => setShowForm(false)}
        />
      )}

      <div className="bg-gray-800/50 backdrop-blur-md border border-gray-700 rounded-2xl shadow-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <FileText size={24} className="text-blue-400" />
          Mes Déclarations ({stages.length})
        </h3>

        {loading ? (
          <div className="text-center py-12 text-gray-400">Chargement...</div>
        ) : stages.length === 0 ? (
          <div className="text-center py-12">
            <Briefcase className="mx-auto text-gray-600 mb-4" size={48} />
            <p className="text-gray-400">Aucune déclaration de stage</p>
            <p className="text-gray-500 text-sm mt-2">Cliquez sur "Déclarer un stage" pour commencer</p>
          </div>
        ) : (
          <div className="space-y-4">
            {stages.map(stage => (
              <StageCard key={stage.id} stage={stage} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AdminView({ user }) {
  const [stages, setStages] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('tous');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [stagesData, statsData] = await Promise.all([
        api.getStages(),
        api.getStatistiques()
      ]);
      setStages(stagesData);
      setStats(statsData);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatut = async (id, statut, commentaire) => {
    try {
      await api.updateStatut(id, statut, commentaire);
      loadData();
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const filteredStages = stages.filter(stage => {
    const matchFilter = filter === 'tous' || stage.statut === filter;
    const matchSearch = stage.nom_etudiant.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        stage.entreprise.toLowerCase().includes(searchTerm.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <div className="space-y-6">
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard icon={<FileText />} title="Total" value={stats.total} color="blue" />
          <StatCard icon={<Clock />} title="En attente" value={stats.en_attente} color="yellow" />
          <StatCard icon={<CheckCircle />} title="Validés" value={stats.valides} color="green" />
          <StatCard icon={<XCircle />} title="Refusés" value={stats.refuses} color="red" />
        </div>
      )}

      <div className="bg-gray-800/50 backdrop-blur-md border border-gray-700 rounded-2xl shadow-xl p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Rechercher par étudiant ou entreprise..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="text-gray-400" size={20} />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="tous">Tous les statuts</option>
              <option value="en_attente">En attente</option>
              <option value="valide">Validés</option>
              <option value="refuse">Refusés</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-gray-800/50 backdrop-blur-md border border-gray-700 rounded-2xl shadow-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4">
          Déclarations de stage ({filteredStages.length})
        </h3>

        {loading ? (
          <div className="text-center py-12 text-gray-400">Chargement...</div>
        ) : filteredStages.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto text-gray-600 mb-4" size={48} />
            <p className="text-gray-400">Aucune déclaration trouvée</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredStages.map(stage => (
              <AdminStageCard 
                key={stage.id} 
                stage={stage}
                onUpdateStatut={handleUpdateStatut}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, color }) {
  const colors = {
    blue: 'from-blue-600 to-blue-700',
    yellow: 'from-yellow-600 to-yellow-700',
    green: 'from-green-600 to-green-700',
    red: 'from-red-600 to-red-700'
  };

  return (
    <div className={`bg-gradient-to-br ${colors[color]} rounded-xl p-6 shadow-lg`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/80 text-sm font-medium">{title}</p>
          <p className="text-white text-3xl font-bold mt-1">{value}</p>
        </div>
        <div className="text-white/70">
          {React.cloneElement(icon, { size: 32 })}
        </div>
      </div>
    </div>
  );
}

function StageForm({ etudiantId, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    entreprise: '',
    sujet: '',
    date_debut: '',
    date_fin: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async () => {
    if (!formData.entreprise || !formData.sujet || !formData.date_debut || !formData.date_fin) {
      alert('Veuillez remplir tous les champs');
      return;
    }
    
    try {
      await api.createStage({
        ...formData,
        id_etudiant: etudiantId
      });
      onSubmit();
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la création du stage');
    }
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-md border border-gray-700 rounded-2xl shadow-xl p-6">
      <h3 className="text-xl font-bold text-white mb-6">Nouvelle Déclaration de Stage</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Entreprise *
          </label>
          <input
            type="text"
            name="entreprise"
            value={formData.entreprise}
            onChange={handleChange}
            placeholder="Ex: Google Maroc"
            className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Sujet du stage *
          </label>
          <textarea
            name="sujet"
            value={formData.sujet}
            onChange={handleChange}
            rows="4"
            placeholder="Décrivez le sujet de votre stage..."
            className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Date de début *
            </label>
            <input
              type="date"
              name="date_debut"
              value={formData.date_debut}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Date de fin *
            </label>
            <input
              type="date"
              name="date_fin"
              value={formData.date_fin}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <button
            onClick={handleSubmit}
            className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg shadow-lg transition-all"
          >
            Enregistrer
          </button>
          <button
            onClick={onCancel}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-all"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}

function StageCard({ stage }) {
  const statutConfig = {
    en_attente: { color: 'bg-yellow-500', text: 'En attente', icon: <Clock size={16} /> },
    valide: { color: 'bg-green-500', text: 'Validé', icon: <CheckCircle size={16} /> },
    refuse: { color: 'bg-red-500', text: 'Refusé', icon: <XCircle size={16} /> }
  };

  const config = statutConfig[stage.statut];

  return (
    <div className="bg-gray-700/30 border border-gray-600 rounded-xl p-5 hover:bg-gray-700/50 transition-all">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h4 className="text-lg font-bold text-white mb-1">{stage.entreprise}</h4>
          <p className="text-gray-400 text-sm line-clamp-2">{stage.sujet}</p>
        </div>
        <span className={`flex items-center gap-1 px-3 py-1 ${config.color} text-white text-xs font-semibold rounded-full`}>
          {config.icon}
          {config.text}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-gray-500">Date de début</p>
          <p className="text-white font-medium">{new Date(stage.date_debut).toLocaleDateString('fr-FR')}</p>
        </div>
        <div>
          <p className="text-gray-500">Date de fin</p>
          <p className="text-white font-medium">{new Date(stage.date_fin).toLocaleDateString('fr-FR')}</p>
        </div>
      </div>

      {stage.commentaire && (
        <div className="mt-4 p-3 bg-gray-800/50 rounded-lg border border-gray-600">
          <p className="text-gray-400 text-xs font-semibold mb-1">Commentaire :</p>
          <p className="text-gray-300 text-sm">{stage.commentaire}</p>
        </div>
      )}
    </div>
  );
}

function AdminStageCard({ stage, onUpdateStatut }) {
  const [showActions, setShowActions] = useState(false);
  const [commentaire, setCommentaire] = useState('');

  const handleAction = (statut) => {
    onUpdateStatut(stage.id, statut, commentaire);
    setShowActions(false);
    setCommentaire('');
  };

  const statutConfig = {
    en_attente: { color: 'bg-yellow-500', text: 'En attente' },
    valide: { color: 'bg-green-500', text: 'Validé' },
    refuse: { color: 'bg-red-500', text: 'Refusé' }
  };

  const config = statutConfig[stage.statut];

  return (
    <div className="bg-gray-700/30 border border-gray-600 rounded-xl p-5">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h4 className="text-lg font-bold text-white">{stage.nom_etudiant}</h4>
            <span className={`px-3 py-1 ${config.color} text-white text-xs font-semibold rounded-full`}>
              {config.text}
            </span>
          </div>
          <p className="text-gray-400 text-sm">{stage.email_etudiant}</p>
        </div>
      </div>

      <div className="bg-gray-800/30 rounded-lg p-4 mb-4">
        <div className="mb-3">
          <p className="text-gray-400 text-xs mb-1">Entreprise</p>
          <p className="text-white font-semibold">{stage.entreprise}</p>
        </div>
        <div className="mb-3">
          <p className="text-gray-400 text-xs mb-1">Sujet</p>
          <p className="text-gray-300 text-sm">{stage.sujet}</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-400 text-xs mb-1">Début</p>
            <p className="text-white font-medium text-sm">{new Date(stage.date_debut).toLocaleDateString('fr-FR')}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs mb-1">Fin</p>
            <p className="text-white font-medium text-sm">{new Date(stage.date_fin).toLocaleDateString('fr-FR')}</p>
          </div>
        </div>
      </div>

      {stage.statut === 'en_attente' && (
        <div>
          <button
            onClick={() => setShowActions(!showActions)}
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all mb-3"
          >
            {showActions ? 'Annuler' : 'Modifier le statut'}
          </button>

          {showActions && (
            <div className="space-y-3">
              <textarea
                placeholder="Commentaire (optionnel)"
                value={commentaire}
                onChange={(e) => setCommentaire(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => handleAction('valide')}
                  className="flex-1 flex items-center justify-center gap-2 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-all"
                >
                  <CheckCircle size={16} />
                  Valider
                </button>
                <button
                  onClick={() => handleAction('refuse')}
                  className="flex-1 flex items-center justify-center gap-2 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-all"
                >
                  <XCircle size={16} />
                  Refuser
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
