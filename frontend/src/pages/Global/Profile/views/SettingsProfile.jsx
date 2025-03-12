import React from 'react';
import UserProfileSettings from '../components/UserProfileSettings';

const SettingsProfile = () => {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <h1 className="text-2xl font-bold mb-6">Mon compte</h1>
      <UserProfileSettings />
    </div>
  );
};

export default SettingsProfile;