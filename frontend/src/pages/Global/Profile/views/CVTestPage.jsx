import React from 'react';
import CVUploadTest from '../components/settings/CVUploadTest';

const CVTestPage = () => {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">CV Document Test Page</h1>
      <p className="mb-6 text-gray-600">
        This page is for testing CV document upload, download, and delete functionality.
      </p>
      
      <div className="bg-white rounded-lg shadow-md">
        <CVUploadTest />
      </div>
    </div>
  );
};

export default CVTestPage; 