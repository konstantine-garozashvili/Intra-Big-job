import { RegisterProvider } from "@/components/register/RegisterContext";
import RegisterForm from "@/components/register/RegisterForm";

const Register = () => {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Colonne gauche - Fond bleu foncé */}
      <div className="md:w-5/12 bg-[#02284f] text-white p-8 flex flex-col justify-center items-center">
        <div className="max-w-md mx-auto text-center">
          <div className="mb-10">
            <svg
              className="w-32 h-32 mx-auto text-[#528eb2]"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 3L1 9L5 11.18V17.18L12 21L19 17.18V11.18L21 10.09V17H23V9L12 3Z"
                fill="currentColor"
              />
              <path
                d="M5 9H19V9L12 13L5 9Z"
                fill="currentColor"
                fillOpacity="0.5"
              />
            </svg>
          </div>
          <h1 className="mb-6 text-4xl font-extrabold">
            Rejoignez BigProject
          </h1>
          <p className="mb-8 text-xl text-gray-300">
            Créez votre compte en quelques étapes et commencez votre voyage
            éducatif avec nous.
          </p>

          <div className="space-y-6 text-left">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-[#528eb2]/20 w-12 h-12 rounded-full flex items-center justify-center mr-4">
                <svg
                  className="w-6 h-6 text-[#528eb2]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-white">
                  Vos données sont sécurisées
                </h3>
                <p className="text-sm text-gray-300">
                  Protection par cryptage avancé
                </p>
              </div>
            </div>

            <div className="flex items-center">
              <div className="flex-shrink-0 bg-[#528eb2]/20 w-12 h-12 rounded-full flex items-center justify-center mr-4">
                <svg
                  className="w-6 h-6 text-[#528eb2]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-white">
                  Processus rapide
                </h3>
                <p className="text-sm text-gray-300">
                  Inscription en moins de 2 minutes
                </p>
              </div>
            </div>

            <div className="flex items-center">
              <div className="flex-shrink-0 bg-[#528eb2]/20 w-12 h-12 rounded-full flex items-center justify-center mr-4">
                <svg
                  className="w-6 h-6 text-[#528eb2]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-white">
                  Accessible partout
                </h3>
                <p className="text-sm text-gray-300">
                  Sur tous vos appareils
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Colonne droite - Formulaire */}
      <div className="md:w-7/12 bg-white p-8 flex items-center justify-center">
        <div className="w-full max-w-xl">
          <RegisterProvider>
            <RegisterForm />
          </RegisterProvider>
        </div>
      </div>
    </div>
  );
};

export default Register;
