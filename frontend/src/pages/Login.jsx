import { AuthForm } from '@/components/AuthForm';
import PageTransition from '@/components/PageTransition';

const Welcome = () => {
  return (
    <PageTransition>
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-full max-w-md px-4">
          <AuthForm />
        </div>
      </div>
    </PageTransition>
  );
};

export default Welcome; 