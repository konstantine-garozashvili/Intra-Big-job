import SignatureMonitoring from '../../components/signature/SignatureMonitoring';
import { Toaster } from 'sonner';

const SignatureMonitoringPage = () => {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Suivi des présences</h1>
      
      <div className="max-w-6xl mx-auto">
        <SignatureMonitoring />
      </div>
      
      <Toaster />
    </div>
  );
};

export default SignatureMonitoringPage;
