import { useState } from 'react';
import DocumentSignature from '../../components/signature/DocumentSignature';
import { Toaster } from 'sonner';

const Attendance = () => {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Enregistrement de présence</h1>
      
      <div className="max-w-3xl mx-auto">
        <DocumentSignature />
      </div>
      
      <Toaster />
    </div>
  );
};

export default Attendance;
