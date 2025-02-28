import React from 'react';
import Navbar from '../components/Navbar';
import './Welcome.css';

function Welcome() {
  return (
    <div className="welcome-page">
      <Navbar />
      <div className="welcome-content">
        <h1 className="welcome-text">W.E.L.C.O.M.E</h1>
        <p className="welcome-subtext">sur le système de connexion développé par l'Équipe NOUS!</p>
      </div>
    </div>
  );
}

export default Welcome;
