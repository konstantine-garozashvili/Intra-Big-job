import React, { useState, useEffect } from 'react';
import { Card, Typography, Spin, Alert } from 'antd';
import formationService from '../services/formationService';

const { Title, Paragraph } = Typography;

const Formations = () => {
  const [formations, setFormations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFormations = async () => {
      try {
        const response = await formationService.getAllFormations();
        setFormations(response);
        setLoading(false);
      } catch (err) {
        setError(err.message || 'Failed to fetch formations');
        setLoading(false);
      }
    };

    fetchFormations();
  }, []);

  if (loading) {
    return <Spin size="large" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }} />;
  }

  if (error) {
    return <Alert message="Error" description={error} type="error" />;
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <Title level={2}>Available Formations</Title>
      {formations.length === 0 ? (
        <Paragraph>No formations available at the moment.</Paragraph>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px' }}>
          {formations.map((formation) => (
            <Card
              key={formation.id}
              title={formation.title}
              style={{ width: '100%' }}
              hoverable
            >
              <Paragraph ellipsis={{ rows: 3 }}>{formation.description}</Paragraph>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
                <Typography.Text strong>Duration:</Typography.Text>
                <Typography.Text>{formation.duration} hours</Typography.Text>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Formations;
