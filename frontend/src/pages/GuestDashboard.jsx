import React, { useState, useEffect } from 'react';
import { Card, Typography, Alert, Button } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';

const { Title, Paragraph } = Typography;

const GuestDashboard = () => {
  const { user } = useAuth();

  useEffect(() => {
    console.warn('🚨 GuestDashboard Authentication Check');
    console.warn('User Object:', user);
    console.warn('User Roles:', user?.roles);
    console.warn('Current Pathname:', window.location.pathname);
  }, [user]);

  // Detailed authentication and role logging
  const isAuthenticated = !!user;
  const userRoles = user?.roles || [];
  const hasGuestRole = userRoles.some(role => role.includes('ROLE_GUEST'));

  console.warn('Authentication Status:', {
    isAuthenticated,
    hasGuestRole,
    userRoles
  });

  if (!isAuthenticated) {
    return (
      <div className="guest-dashboard-error">
        <h2>Authentication Required</h2>
        <p>Please log in to access the Guest Dashboard.</p>
      </div>
    );
  }

  if (!hasGuestRole) {
    return (
      <div className="guest-dashboard-error">
        <h2>Access Denied</h2>
        <p>You do not have permission to view this page.</p>
        <p>Current Roles: {userRoles.join(', ')}</p>
      </div>
    );
  }

  console.log('GuestDashboard rendering for guest user');

  return (
    <div className="guest-dashboard container mx-auto px-4 py-8">
      <Card 
        className="max-w-2xl mx-auto"
        title={
          <Title level={3} className="text-center">
            Tableau de Bord - Invité
          </Title>
        }
      >
        <Alert 
          message="Statut de Votre Compte" 
          description="Votre compte est actuellement en attente de validation par un administrateur. Une fois validé, vous aurez accès à toutes les fonctionnalités des étudiants."
          type="info"
          showIcon
          icon={<InfoCircleOutlined />}
          className="mb-6"
        />

        <div className="text-center">
          <Paragraph>
            En attendant la validation de votre compte, vous pouvez :
          </Paragraph>

          <div className="space-y-4">
            <Card 
              hoverable 
              className="w-full"
              title="Formations Disponibles"
            >
              <Paragraph>
                Consultez les formations qui seront accessibles une fois votre compte validé.
              </Paragraph>
              <Button type="primary" ghost>
                Voir les Formations
              </Button>
            </Card>

            <Card 
              hoverable 
              className="w-full"
              title="Informations Générales"
            >
              <Paragraph>
                Prenez connaissance des informations générales de notre plateforme.
              </Paragraph>
              <Button type="default">
                En Savoir Plus
              </Button>
            </Card>
          </div>

          <Paragraph className="mt-6 text-gray-500">
            Votre compte sera bientôt activé. Merci de patienter.
          </Paragraph>
        </div>
      </Card>
    </div>
  );
};

export default GuestDashboard;
