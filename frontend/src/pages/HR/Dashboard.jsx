import React, { useState, useEffect } from 'react';
import { authService } from '@/lib/services/authService';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Pie, Bar, Line } from 'react-chartjs-2';

// Enregistrer les composants ChartJS nécessaires
ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend);

// Données fictives pour la démonstration (définies en dehors du composant pour réduire la taille)
const mockData = {
  employee: {
    total: 127, active: 118, onLeave: 9,
    departments: { labels: ['IT', 'Marketing', 'Ventes', 'Finance', 'RH', 'Production'], data: [32, 18, 25, 15, 8, 29] }
  },
  absence: {
    labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'],
    datasets: [
      { label: 'Congés payés', data: [14, 18, 22, 25, 31, 42, 48, 52, 23, 19, 20, 28], backgroundColor: 'rgba(54, 162, 235, 0.5)', borderColor: 'rgba(54, 162, 235, 1)' },
      { label: 'Maladie', data: [8, 12, 9, 7, 6, 5, 8, 10, 9, 11, 13, 10], backgroundColor: 'rgba(255, 99, 132, 0.5)', borderColor: 'rgba(255, 99, 132, 1)' },
      { label: 'Formation', data: [4, 5, 7, 6, 8, 5, 3, 2, 6, 9, 7, 5], backgroundColor: 'rgba(75, 192, 192, 0.5)', borderColor: 'rgba(75, 192, 192, 1)' }
    ]
  },
  contract: {
    labels: ['CDI', 'CDD', 'Intérim', 'Stage', 'Apprentissage'],
    datasets: [{
      data: [78, 22, 10, 12, 5],
      backgroundColor: ['rgba(54, 162, 235, 0.7)', 'rgba(255, 206, 86, 0.7)', 'rgba(255, 99, 132, 0.7)', 'rgba(75, 192, 192, 0.7)', 'rgba(153, 102, 255, 0.7)'],
      borderColor: ['rgba(54, 162, 235, 1)', 'rgba(255, 206, 86, 1)', 'rgba(255, 99, 132, 1)', 'rgba(75, 192, 192, 1)', 'rgba(153, 102, 255, 1)'],
      borderWidth: 1
    }]
  },
  training: {
    labels: ['Techniques', 'Management', 'Soft Skills', 'Outils', 'Sécurité', 'Conformité'],
    datasets: [{
      label: 'Heures de formation par catégorie',
      data: [120, 85, 65, 45, 35, 50],
      backgroundColor: ['rgba(255, 99, 132, 0.7)', 'rgba(54, 162, 235, 0.7)', 'rgba(255, 206, 86, 0.7)', 'rgba(75, 192, 192, 0.7)', 'rgba(153, 102, 255, 0.7)', 'rgba(255, 159, 64, 0.7)'],
      borderWidth: 1
    }]
  }
};

/**
 * Tableau de bord spécifique pour les RH
 */
const HRDashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Options chart communes
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'top' } }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await authService.getCurrentUser();
        setUser(userData);
      } catch (err) {
        setError('Impossible de charger les informations utilisateur');
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  if (loading) return <div className="p-8 text-gray-600">Chargement en cours...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;

  // Composant TabButton réutilisable
  const TabButton = ({ name, label }) => (
    <button
      className={`px-4 py-2 mr-2 font-medium rounded-t-lg ${activeTab === name
        ? 'bg-white text-blue-600 border-b-2 border-blue-600'
        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
      onClick={() => setActiveTab(name)}
    >
      {label}
    </button>
  );

  // Définition de contenu des onglets
  const tabContent = {
    overview: (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        {[
          { title: 'Effectif total', value: mockData.employee.total, color: 'blue' },
          { title: 'Employés actifs', value: mockData.employee.active, color: 'green' },
          { title: 'En congé', value: mockData.employee.onLeave, color: 'yellow' },
          { title: 'Taux d\'occupation', value: `${Math.round((mockData.employee.active / mockData.employee.total) * 100)}%`, color: 'purple' }
        ].map((item, i) => (
          <div key={i} className="p-6 bg-white rounded-lg shadow">
            <h3 className="mb-2 text-lg font-semibold text-gray-700">{item.title}</h3>
            <p className={`text-3xl font-bold text-${item.color}-600`}>{item.value}</p>
          </div>
        ))}
      </div>
    ),
    employees: (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="p-6 bg-white rounded-lg shadow">
          <h3 className="mb-4 text-xl font-semibold text-gray-700">Répartition par département</h3>
          <div className="h-64">
            <Bar
              data={{
                labels: mockData.employee.departments.labels,
                datasets: [{
                  label: 'Nombre d\'employés',
                  data: mockData.employee.departments.data,
                  backgroundColor: 'rgba(54, 162, 235, 0.7)',
                  borderColor: 'rgba(54, 162, 235, 1)',
                  borderWidth: 1
                }]
              }}
              options={chartOptions}
            />
          </div>
        </div>

        <div className="p-6 bg-white rounded-lg shadow">
          <h3 className="mb-4 text-xl font-semibold text-gray-700">Actions rapides</h3>
          <div className="flex flex-col space-y-2">
            {[
              { text: 'Ajouter un nouvel employé', color: 'blue' },
              { text: 'Générer rapport d\'effectifs', color: 'green' },
              { text: 'Exporter liste des employés', color: 'purple' }
            ].map((btn, i) => (
              <button key={i} className={`px-4 py-2 text-white bg-${btn.color}-600 rounded hover:bg-${btn.color}-700`}>
                {btn.text}
              </button>
            ))}
          </div>
        </div>
      </div>
    ),
    absences: (
      <div className="p-6 bg-white rounded-lg shadow">
        <h3 className="mb-4 text-xl font-semibold text-gray-700">Suivi des absences et congés</h3>
        <div className="h-80">
          <Line data={mockData.absence} options={chartOptions} />
        </div>
      </div>
    ),
    contracts: (
      <div className="p-6 bg-white rounded-lg shadow">
        <h3 className="mb-4 text-xl font-semibold text-gray-700">Types de contrats</h3>
        <div className="h-64">
          <Pie data={mockData.contract} options={chartOptions} />
        </div>
      </div>
    ),
    training: (
      <div className="p-6 bg-white rounded-lg shadow">
        <h3 className="mb-4 text-xl font-semibold text-gray-700">Formations par catégorie</h3>
        <div className="h-64">
          <Bar data={mockData.training} options={chartOptions} />
        </div>
      </div>
    )
  };

  return (
    <div className="container p-8 mx-auto">
      <h2 className="mb-6 text-2xl font-bold text-gray-800">Tableau de bord RH</h2>

      <div className="mb-6 border-b border-gray-200">
        <TabButton name="overview" label="Aperçu" />
        <TabButton name="employees" label="Employés" />
        <TabButton name="absences" label="Absences" />
        <TabButton name="contracts" label="Contrats" />
        <TabButton name="training" label="Formations" />
      </div>

      <div className="p-6 bg-white rounded-lg shadow-lg">
        {tabContent[activeTab]}
      </div>
    </div>
  );
};

export default HRDashboard;