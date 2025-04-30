import React, { useState, useEffect } from 'react';
import { Card, Typography, Spin, Alert } from 'antd';
import formationService from '../../services/formationService';
import { useNavigate } from 'react-router-dom';
import { useRoles } from '@/features/roles/roleContext';

const { Title, Paragraph } = Typography;

const GuestFormations = () => {
  const [formations, setFormations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { hasRole } = useRoles();

  useEffect(() => {
    const fetchFormations = async () => {
      try {
        const response = await formationService.getAllFormations();
        setFormations(response);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching formations:', err);
        setError(err.message || 'Erreur lors du chargement des formations');
        setLoading(false);
      }
    };

    fetchFormations();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <Alert 
          message="Erreur" 
          description={error} 
          type="error" 
          showIcon 
        />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <Title level={2}>Nos Formations</Title>
        <Paragraph className="text-gray-600">
          Découvrez nos formations et choisissez celle qui correspond le mieux à vos objectifs professionnels.
        </Paragraph>
      </div>

      {formations.length === 0 ? (
        <div className="text-center p-8 bg-gray-50 rounded-lg">
          <Paragraph>Aucune formation n'est disponible pour le moment.</Paragraph>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {formations.map((formation) => (
            <Card
              key={formation.id}
              className="h-full hover:shadow-lg transition-shadow duration-300"
              hoverable
            >
              <div className="h-full flex flex-col">
                <div className="flex-grow">
                  <Title level={4} className="mb-4">{formation.name}</Title>
                  <Paragraph ellipsis={{ rows: 3 }} className="text-gray-600">
                    {formation.description || 'Aucune description disponible'}
                  </Paragraph>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                  <div className="flex justify-between items-center">
                    <Typography.Text strong>Promotion:</Typography.Text>
                    <Typography.Text>{formation.promotion}</Typography.Text>
                  </div>
                  {formation.duration && (
                    <div className="flex justify-between items-center">
                      <Typography.Text strong>Durée:</Typography.Text>
                      <Typography.Text>{formation.duration} heures</Typography.Text>
                    </div>
                  )}
                  {formation.location && (
                    <div className="flex justify-between items-center">
                      <Typography.Text strong>Lieu:</Typography.Text>
                      <Typography.Text>{formation.location}</Typography.Text>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default GuestFormations; 