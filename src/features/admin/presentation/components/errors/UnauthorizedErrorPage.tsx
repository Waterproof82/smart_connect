import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const UnauthorizedErrorPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/');
    }, 3500);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white shadow-xl rounded-xl p-10 flex flex-col items-center max-w-md">
        <svg className="w-20 h-20 text-indigo-500 mb-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h1 className="text-3xl font-bold text-indigo-700 mb-2">Unauthorized</h1>
        <p className="text-gray-600 mb-4 text-center">You must be logged in to access the admin panel.</p>
        <button
          onClick={() => navigate('/')}
          className="mt-2 px-6 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition"
        >
          Go to Home
        </button>
        <p className="text-xs text-gray-400 mt-4">Redirecting in 3 seconds...</p>
      </div>
    </div>
  );
};

export default UnauthorizedErrorPage;
