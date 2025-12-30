import { BarChart3, Calendar, Download, FileText } from 'lucide-react';
import React, { useState } from 'react';
import axios from '../api';

export const Reports: React.FC = () => {
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  const handleDownload = async (type: '606' | '607') => {
    try {
      const response = await axios.get(`/api/reports/${type}`, {
        params: { month, year },
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type}_${year}_${month}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Error downloading report:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-blue-600 p-3 rounded-2xl shadow-lg shadow-blue-600/20">
          <BarChart3 className="text-white w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Reportes Fiscales</h1>
          <p className="text-gray-500 mt-1">Exportación de formatos 606 y 607 para la DGII</p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row gap-6 items-end mb-10">
          <div className="flex-1">
            <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Calendar size={16} /> Seleccionar Período
            </label>
            <div className="grid grid-cols-2 gap-4">
              <select
                value={month}
                onChange={(e) => setMonth(parseInt(e.target.value))}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              >
                <option value="1">Enero</option>
                <option value="2">Febrero</option>
                <option value="3">Marzo</option>
                <option value="4">Abril</option>
                <option value="5">Mayo</option>
                <option value="6">Junio</option>
                <option value="7">Julio</option>
                <option value="8">Agosto</option>
                <option value="9">Septiembre</option>
                <option value="10">Octubre</option>
                <option value="11">Noviembre</option>
                <option value="12">Diciembre</option>
              </select>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value))}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:shadow-xl hover:shadow-blue-500/5 transition-all group">
            <div className="flex items-start justify-between mb-4">
              <div className="bg-blue-100 p-3 rounded-xl text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                <FileText size={24} />
              </div>
              <button
                onClick={() => handleDownload('606')}
                className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 transition"
              >
                <Download size={18} /> DESCARGAR CSV
              </button>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Formato 606</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Reporte de Compras de Bienes y Servicios. Incluye todos los gastos registrados con NCF en el período seleccionado.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:shadow-xl hover:shadow-green-500/5 transition-all group">
            <div className="flex items-start justify-between mb-4">
              <div className="bg-green-100 p-3 rounded-xl text-green-600 transition-colors group-hover:bg-green-600 group-hover:text-white">
                <FileText size={24} />
              </div>
              <button
                onClick={() => handleDownload('607')}
                className="flex items-center gap-2 text-sm font-bold text-green-600 hover:text-green-700 transition"
              >
                <Download size={18} /> DESCARGAR CSV
              </button>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Formato 607</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Reporte de Ventas de Bienes y Servicios. Incluye todas las facturas emitidas (electrónicas y tradicionales) en el período.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-blue-50/50 border border-blue-100 p-6 rounded-2xl">
        <h4 className="text-blue-800 font-bold mb-2">Nota Importante</h4>
        <p className="text-blue-600 text-sm">
          Los archivos generados están en formato CSV. Asegúrese de revisar la consistencia de los datos antes de cargarlos a la plataforma de la DGII. Próximamente se incluirá la exportación directa en formato TXT según los requerimientos técnicos oficiales.
        </p>
      </div>
    </div>
  );
};
