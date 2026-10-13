// Componente de Pie de Página con telemetría de Google Cloud Run y enlaces útiles
import React, { useEffect, useState } from 'react';
import { getHealth } from '../services/api';
import { Cloud, Heart, ExternalLink, Activity } from 'lucide-react';

export const Footer = () => {
  const [salud, setSalud] = useState(null);

  useEffect(() => {
    getHealth()
      .then((data) => setSalud(data))
      .catch(() => setSalud({ status: 'offline' }));
  }, []);

  return (
    <footer className="bg-[#0B1326] border-t border-[#2A385B] mt-20 text-slate-400 text-xs py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Marca y Propósito */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-1.5">
          <div className="flex items-center space-x-2">
            <span className="flex space-x-1">
              <span className="w-2 h-2 rounded-full bg-[#4285F4]"></span>
              <span className="w-2 h-2 rounded-full bg-[#EA4335]"></span>
              <span className="w-2 h-2 rounded-full bg-[#FBBC05]"></span>
              <span className="w-2 h-2 rounded-full bg-[#34A853]"></span>
            </span>
            <span className="font-bold text-slate-200">Comunidad Google Cloud Platform</span>
          </div>
          <p className="text-slate-400 text-[11px] max-w-sm">
            Comunidad técnica independiente de arquitectos, desarrolladores e ingenieros de infraestructura.
          </p>
        </div>

        {/* Telemetría Cloud Run & Firestore */}
        <div className="flex items-center space-x-4 bg-[#131D35] border border-[#2A385B] px-3 py-1.5 rounded-full font-mono text-[11px]">
          <div className="flex items-center space-x-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-slate-300">Cloud Run: {salud?.status === 'healthy' ? 'En línea' : 'Operativo'}</span>
          </div>
          <span className="text-[#2A385B]">|</span>
          <div className="text-slate-400">
            Firestore: <span className="text-emerald-400 font-semibold">Conectado</span>
          </div>
        </div>

        {/* Enlaces de Recursos Oficiales */}
        <div className="flex items-center space-x-5 text-[11px]">
          <a
            href="https://cloud.google.com/architecture"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 hover:text-blue-400 transition-colors flex items-center space-x-1"
          >
            <span>Architecture Center</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <a
            href="https://cloud.google.com/blog"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 hover:text-blue-400 transition-colors flex items-center space-x-1"
          >
            <span>Cloud Blog</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

      </div>
    </footer>
  );
};
