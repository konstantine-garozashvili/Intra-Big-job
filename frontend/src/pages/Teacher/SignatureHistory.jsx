import SignatureHistory from '../../components/signature/SignatureHistory';
import { Toaster } from 'sonner';

const TeacherSignatureHistory = () => {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Mon historique de signatures</h1>
      
      <div className="max-w-6xl mx-auto">
        <SignatureHistory />
      </div>
      
      <Toaster />
    </div>
  );
};

export default TeacherSignatureHistory; 