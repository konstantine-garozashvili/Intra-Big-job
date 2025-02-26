import { useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';

const Register = ({ onRegisterSuccess }) => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: ''
    });

    const [message, setMessage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);

        try {
            const response = await axios.post('http://localhost:8000/api/register', formData);

            if (response.status === 200 || response.status === 201) {
                setMessage({
                    type: 'success',
                    text: response.data.message
                });

                setFormData({
                    username: '',
                    email: '',
                    password: ''
                });

                if (onRegisterSuccess) {
                    onRegisterSuccess();
                }
            }
        } catch (error) {
            console.error('Erreur:', error);
            setMessage({
                type: 'error',
                text: error.response?.data?.message || `Erreur de connexion à l'API: ${error.message}`
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#02284f] via-[#02284f]/90 to-[#02284f]/80">
            <Navbar />
            <div className="flex flex-col md:flex-row items-center justify-center min-h-[calc(100vh-64px)]">
                <div className="flex justify-center w-full p-8 md:w-1/2 md:pr-16 md:justify-end">
                    <div className="max-w-md text-center text-white md:text-right">
                        <h1 className="mb-4 text-4xl font-extrabold md:text-5xl">
                            Rejoignez <span className="text-[#528eb2]">SchoolCo'</span>
                        </h1>
                        <p className="mb-6 text-lg text-gray-300">
                            Créez votre compte et commencez votre aventure éducative dès maintenant !
                        </p>
                        <div className="hidden md:block">
                            <div className="flex justify-end space-x-4">
                                <div className="bg-[#02284f] bg-opacity-50 p-3 rounded-lg border border-[#02284f]/60">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#528eb2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                </div>
                                <div className="bg-[#02284f] bg-opacity-50 p-3 rounded-lg border border-[#02284f]/60">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#528eb2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                    </svg>
                                </div>
                                <div className="bg-[#02284f] bg-opacity-50 p-3 rounded-lg border border-[#02284f]/60">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#528eb2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-center w-full px-8 py-12 md:w-1/2 md:pl-16 md:justify-start">
                    <div className="w-full max-w-md overflow-hidden bg-white shadow-2xl rounded-xl">
                        <div className="bg-[#02284f] py-4 px-6">
                            <h2 className="text-2xl font-bold text-white">Créez votre compte</h2>
                        </div>

                        <div className="p-6">
                            {message && (
                                <div className={`mb-6 p-3 rounded-lg ${message.type === 'success'
                                    ? 'bg-green-100 text-green-700 border border-green-200'
                                    : 'bg-red-100 text-red-700 border border-red-200'
                                    }`}>
                                    {message.text}
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>
                                <div className="mb-5">
                                    <label className="block mb-2 text-sm font-semibold text-gray-700" htmlFor="username">
                                        Nom d'utilisateur
                                    </label>
                                    <input
                                        type="text"
                                        id="username"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#528eb2]"
                                        required
                                    />
                                </div>

                                <div className="mb-5">
                                    <label className="block mb-2 text-sm font-semibold text-gray-700" htmlFor="email">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#528eb2]"
                                        required
                                    />
                                </div>

                                <div className="mb-6">
                                    <label className="block mb-2 text-sm font-semibold text-gray-700" htmlFor="password">
                                        Mot de passe
                                    </label>
                                    <input
                                        type="password"
                                        id="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#528eb2]"
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full px-6 py-3 font-medium text-white rounded-lg transition-all transform hover:scale-105 bg-[#528eb2] hover:bg-[#528eb2]/90 focus:outline-none focus:ring-2 focus:ring-[#528eb2] focus:ring-offset-2 disabled:opacity-50"
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Chargement...' : 'Créer mon compte'}
                                </button>

                                <div className="mt-6 text-sm text-center text-gray-500">
                                    Vous avez déjà un compte ?
                                    <a href="/login" className="ml-1 font-medium text-[#02284f] hover:text-[#528eb2]">
                                        Se connecter
                                    </a>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;