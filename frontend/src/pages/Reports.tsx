import { BarChart3, Calculator, Calendar, Download, FileText, XCircle } from 'lucide-react';
import React, { useState } from 'react';
import axios from '../api';

export const Reports: React.FC = () => {
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [it1Data, setIt1Data] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleDownload = async (type: '606' | '607' | '608', format: 'csv' | 'txt' = 'csv') => {
    try {
      setLoading(true);
      const urlPath = format === 'txt' ? `/api/reports/${type}/txt` : `/api/reports/${type}`;
      const response = await axios.get(urlPath, {
        params: { month, year },
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type}_${year}_${month}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Error downloading report:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFetchIT1 = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/reports/it1', { params: { month, year } });
      setIt1Data(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-primary p-3 rounded-2xl shadow-lg shadow-blue-600/20">
          <BarChart3 className="text-white w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white tracking-tight">Reportes Fiscales</h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1">Exportación de formatos y declaraciones para la DGII</p>
        </div>
      </div>

      <div className="bg-white dark:bg-card-dark p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-border-dark">
        <div className="flex flex-col md:flex-row gap-6 items-end mb-10">
          <div className="flex-1">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
              <Calendar size={16} /> Seleccionar Período
            </label>
            <div className="grid grid-cols-2 gap-4">
              <select
                value={month}
                onChange={(e) => setMonth(parseInt(e.target.value))}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white"
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
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 606 */}
          <div className="p-6 rounded-2xl border border-slate-100 dark:border-border-dark bg-slate-50/50 dark:bg-background-dark/30 hover:bg-white dark:hover:bg-slate-800/50 hover:shadow-xl hover:shadow-blue-500/5 transition-all group">
            <div className="flex items-start justify-between mb-4">
              <div className="bg-blue-100 dark:bg-blue-500/10 p-3 rounded-xl text-primary dark:text-blue-400 transition-colors group-hover:bg-primary group-hover:text-white dark:group-hover:bg-blue-500/20">
                <FileText size={24} />
              </div>
              <button
                onClick={() => handleDownload('606')}
                disabled={loading}
                className="flex items-center gap-2 text-sm font-bold text-primary dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition"
              >
                <Download size={18} /> CSV
              </button>
              <button
                onClick={() => handleDownload('606', 'txt')}
                className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-gray-700 dark:text-slate-500 dark:hover:text-slate-300 transition bg-gray-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-700"
              >
                <FileText size={14} /> TXT (DGII)
              </button>
            </div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Formato 606</h3>
            <p className="text-gray-500 dark:text-slate-400 text-sm leading-relaxed">
              Reporte de Compras de Bienes y Servicios. Incluye todos los gastos registrados con NCF en el período seleccionado.
            </p>
          </div>

          {/* 607 */}
          <div className="p-6 rounded-2xl border border-slate-100 dark:border-border-dark bg-slate-50/50 dark:bg-background-dark/30 hover:bg-white dark:hover:bg-slate-800/50 hover:shadow-xl hover:shadow-emerald-500/5 transition-all group">
            <div className="flex items-start justify-between mb-4">
              <div className="bg-emerald-100 dark:bg-emerald-500/10 p-3 rounded-xl text-emerald-600 dark:text-emerald-400 transition-colors group-hover:bg-emerald-600 group-hover:text-white dark:group-hover:bg-emerald-500/20">
                <FileText size={24} />
              </div>
              <button
                onClick={() => handleDownload('607')}
                disabled={loading}
                className="flex items-center gap-2 text-sm font-bold text-emerald-600 hover:text-emerald-700 dark:hover:text-emerald-300 transition"
              >
                <Download size={18} /> CSV
              </button>
              <button
                onClick={() => handleDownload('607', 'txt')}
                className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-gray-700 dark:text-slate-500 dark:hover:text-slate-300 transition bg-gray-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-700"
              >
                <FileText size={14} /> TXT (DGII)
              </button>
            </div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Formato 607</h3>
            <p className="text-gray-500 dark:text-slate-400 text-sm leading-relaxed">
              Reporte de Ventas de Bienes y Servicios. Incluye todas las facturas emitidas (electrónicas y tradicionales) en el período.
            </p>
          </div>

          {/* 608 */}
          <div className="p-6 rounded-2xl border border-slate-100 dark:border-border-dark bg-slate-50/50 dark:bg-background-dark/30 hover:bg-white dark:hover:bg-slate-800/50 hover:shadow-xl hover:shadow-red-500/5 transition-all group">
            <div className="flex items-start justify-between mb-4">
              <div className="bg-red-100 dark:bg-red-500/10 p-3 rounded-xl text-red-600 dark:text-red-400 transition-colors group-hover:bg-red-600 group-hover:text-white dark:group-hover:bg-red-500/20">
                <XCircle size={24} />
              </div>
              <button
                onClick={() => handleDownload('608')}
                disabled={loading}
                className="flex items-center gap-2 text-sm font-bold text-red-600 hover:text-red-700 dark:hover:text-red-300 transition"
              >
                <Download size={18} /> DESCARGAR CSV
              </button>
            </div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Formato 608</h3>
            <p className="text-gray-500 dark:text-slate-400 text-sm leading-relaxed">
              Comprobantes Anulados. Lista de facturas invalidadas durante el mes.
            </p>
          </div>

          {/* IT-1 */}
          <div className="p-6 rounded-2xl border border-slate-100 dark:border-border-dark bg-slate-50/50 dark:bg-background-dark/30 hover:bg-white dark:hover:bg-slate-800/50 hover:shadow-xl hover:shadow-purple-500/5 transition-all group">
            <div className="flex items-start justify-between mb-4">
              <div className="bg-purple-100 dark:bg-purple-500/10 p-3 rounded-xl text-purple-600 dark:text-purple-400 transition-colors group-hover:bg-purple-600 group-hover:text-white dark:group-hover:bg-purple-500/20">
                <Calculator size={24} />
              </div>
              <button
                onClick={handleFetchIT1}
                disabled={loading}
                className="flex items-center gap-2 text-sm font-bold text-purple-600 hover:text-purple-700 dark:hover:text-purple-300 transition"
              >
                <BarChart3 size={18} /> CALCULAR IT-1
              </button>
            </div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Declaración IT-1</h3>
            <p className="text-gray-500 dark:text-slate-400 text-sm leading-relaxed">
              Resumen preliminar de Operaciones, Ingresos, Costos e ITBIS Pagado vs Cobrado.
            </p>
          </div>

        </div>
      </div>

      {/* IT-1 Modal */}
      {it1Data && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className='flex justify-between items-center mb-6'>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Resumen IT-1 ({it1Data.period})</h2>
              <button onClick={() => setIt1Data(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 transition-colors">
                <XCircle size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-slate-800/50 p-4 rounded-xl">
                <h3 className="text-sm font-bold text-gray-500 dark:text-slate-400 mb-2 uppercase">1. Ingresos (Ventas)</h3>
                <div className="flex justify-between mb-1">
                  <span className='text-gray-600 dark:text-slate-300'>Monto Gravado:</span>
                  <span className="font-mono font-bold text-gray-900 dark:text-white">RD$ {it1Data.sales.net.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-blue-600 dark:text-blue-400">
                  <span>ITBIS Cobrado:</span>
                  <span className="font-mono font-bold">RD$ {it1Data.sales.tax.toLocaleString()}</span>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-slate-800/50 p-4 rounded-xl">
                <h3 className="text-sm font-bold text-gray-500 dark:text-slate-400 mb-2 uppercase">2. Costos (Compras)</h3>
                <div className="flex justify-between mb-1">
                  <span className='text-gray-600 dark:text-slate-300'>Monto Compras:</span>
                  <span className="font-mono font-bold text-gray-900 dark:text-white">RD$ {it1Data.expenses.net.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                  <span>ITBIS Pagado (Adelantado):</span>
                  <span className="font-mono font-bold">RD$ {it1Data.expenses.tax.toLocaleString()}</span>
                </div>
              </div>

              <div className="border-t border-dashed border-gray-300 pt-4 flex justify-between items-center">
                <span className="text-lg font-bold dark:text-white">A Pagar (Estimado):</span>
                <span className={`text-2xl font-bold font-mono ${it1Data.payable > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  RD$ {Math.abs(it1Data.payable).toLocaleString()}
                  <span className="text-xs font-normal block text-right">
                    {it1Data.payable > 0 ? '(A Pagar a DGII)' : '(Saldo a Favor)'}
                  </span>
                </span>
              </div>
            </div>

            <div className="mt-6 bg-yellow-50 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200 p-3 rounded-lg text-xs">
              <strong>Nota Legal:</strong> Este cálculo es una referencia basada en los registros del sistema. No sustituye la validación de un contador certificado.
            </div>
          </div>
        </div>
      )}

      <div className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/30 p-6 rounded-2xl">
        <h4 className="text-blue-800 dark:text-blue-400 font-bold mb-2">Nota Importante</h4>
        <p className="text-blue-600 dark:text-blue-300 text-sm">
          Los archivos generados están en formato CSV. Asegúrese de revisar la consistencia de los datos antes de cargarlos a la plataforma de la DGII. Próximamente se incluirá la exportación directa en formato TXT según los requerimientos técnicos oficiales.
        </p>
      </div>
    </div>
  );
};
