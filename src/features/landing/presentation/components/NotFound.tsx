import React from 'react';
import { Link } from 'react-router-dom';

export const NotFound: React.FC = () => (
  <div className="min-h-screen bg-base flex flex-col items-center justify-center px-4 text-center">
    <h1 className="text-6xl font-black text-default mb-4">404</h1>
    <p className="text-muted text-lg mb-8">Página no encontrada</p>
    <Link to="/" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold transition-colors">
      Volver al inicio
    </Link>
  </div>
);
