import React, { useState } from 'react';

// Keep the same interface as inferred from usage
interface Sequence {
    id: number;
    type_code: string;
    next_number: number;
    current_end_number: number | null;
    end_date: string;
}

interface SequenceSettingsProps {
    sequences: Sequence[];
    onUpdate: (id: number, next_number: number, end_date: string, current_end_number?: number) => Promise<void>;
}

export const SequenceSettings: React.FC<SequenceSettingsProps> = ({ sequences, onUpdate }) => {
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead>
                    <tr className="border-b border-slate-200 dark:border-border-dark text-slate-500 dark:text-slate-400 text-sm">
                        <th className="py-3 px-4 font-bold">Código</th>
                        <th className="py-3 px-4 font-bold">Tipo de Comprobante</th>
                        <th className="py-3 px-4 text-center font-bold">Desde (Próximo)</th>
                        <th className="py-3 px-4 text-center font-bold">Hasta (Final)</th>
                        <th className="py-3 px-4 text-right font-bold">Vencimiento</th>
                        <th className="py-3 px-4 text-right font-bold">Acción</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-border-dark">
                    {sequences.map((seq) => (
                        <SequenceRow key={seq.id} sequence={seq} onUpdate={onUpdate} />
                    ))}
                    {sequences.length === 0 && (
                        <tr><td colSpan={5} className="py-4 text-center text-slate-400">No hay secuencias configuradas</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

const SequenceRow = ({ sequence, onUpdate }: { sequence: Sequence, onUpdate: (id: number, next: number, date: string, end?: number) => Promise<void> }) => {
    const [next, setNext] = useState(sequence.next_number.toString());
    const [end, setEnd] = useState(sequence.current_end_number?.toString() || '');
    const [date, setDate] = useState(sequence.end_date ? new Date(sequence.end_date).toISOString().split('T')[0] : '');
    const [isDirty, setIsDirty] = useState(false);

    const handleUpdate = () => {
        onUpdate(sequence.id, parseInt(next), date, end ? parseInt(end) : undefined);
        setIsDirty(false);
    };

    return (
        <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
            <td className="py-3 px-4 text-slate-500 dark:text-slate-400 text-sm font-mono">{sequence.type_code}</td>
            <td className="py-3 px-4 font-bold text-slate-800 dark:text-gray-200">
                {sequence.type_code === '01' && 'Crédito Fiscal'}
                {sequence.type_code === '02' && 'Consumo Final'}
                {sequence.type_code === '31' && 'e-CF Crédito Fiscal'}
                {sequence.type_code === '32' && 'e-CF Consumo'}
                {!['01', '02', '31', '32'].includes(sequence.type_code) && 'Otro'}
            </td>
            <td className="py-3 px-4 text-center">
                <div className="flex items-center justify-center gap-2">
                    <span className="text-slate-400 dark:text-slate-500 text-xs">{sequence.type_code.startsWith('3') || sequence.type_code.startsWith('4') ? 'E' : 'B'}{sequence.type_code}...</span>
                    <input
                        type="number"
                        value={next}
                        onChange={(e) => { setNext(e.target.value); setIsDirty(true); }}
                        className="w-20 px-2 py-1 border rounded text-center text-sm outline-none focus:ring-2 focus:ring-primary dark:bg-background-dark dark:border-border-dark dark:text-white"
                    />
                </div>
            </td>
            <td className="py-3 px-4 text-center">
                <div className="flex items-center justify-center gap-2">
                    <span className="text-slate-400 dark:text-slate-500 text-xs">...</span>
                    <input
                        type="number"
                        value={end}
                        onChange={(e) => { setEnd(e.target.value); setIsDirty(true); }}
                        className="w-24 px-2 py-1 border rounded text-center text-sm outline-none focus:ring-2 focus:ring-primary dark:bg-background-dark dark:border-border-dark dark:text-white"
                        placeholder="Sin limite"
                    />
                </div>
            </td>
            <td className="py-3 px-4 text-right">
                <input
                    type="date"
                    value={date}
                    onChange={(e) => { setDate(e.target.value); setIsDirty(true); }}
                    className="px-2 py-1 border rounded text-sm text-slate-600 dark:text-slate-300 outline-none focus:ring-2 focus:ring-primary dark:bg-background-dark dark:border-border-dark"
                />
            </td>
            <td className="py-3 px-4 text-right">
                {isDirty && (
                    <button onClick={handleUpdate} className="text-primary hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-bold">
                        Guardar
                    </button>
                )}
            </td>
        </tr>
    );
}
