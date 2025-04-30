import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useUserData } from '@/hooks/useDashboardQueries';
import './Dashboard.css';

const GuestDashboard = () => {
  const { data: user, isLoading, error } = useUserData();

  if (isLoading) return <div className="guest-dashboard loading">Chargement...</div>;
  if (error) return <div className="guest-dashboard error">Erreur de chargement</div>;
  if (!user) return <div className="guest-dashboard error">Utilisateur non connecté</div>;

  return (
    <div className="guest-dashboard">
      <div className="dashboard-header">
        <h1>Tableau de Bord Invité</h1>
        <p>Bienvenue, {user.firstName} {user.lastName}</p>
      </div>

      <div className="dashboard-content">
        <section className="guest-info">
          <h2>Statut de Votre Compte</h2>
          <div className="status-card">
            <p>Votre compte est actuellement en attente de validation.</p>
            <p>Vous recevrez un email dès que votre compte sera activé.</p>
          </div>
        </section>

        <section className="guest-actions">
          <h2>Actions Disponibles</h2>
          <div className="actions-grid">
            <div className="action-card">
              <h3>Nos Formations</h3>
              <p>Consultez les formations disponibles</p>
              <Link to="/guest/guest-formations" className="action-link">Voir les Formations</Link>
            </div>
            <div className="action-card">
              <h3>Profil</h3>
              <p>Complétez votre profil</p>
              <Link to="/profile" className="action-link">Éditer Profil</Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default GuestDashboard;