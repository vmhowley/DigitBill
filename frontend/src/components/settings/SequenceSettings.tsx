import React, { useState } from 'react';

// Keep the same interface as inferred from usage
interface Sequence {
    id: number;
    type_code: string;
    next_number: number;
    end_date: string;
}

interface SequenceSettingsProps {
    sequences: Sequence[];
    onUpdate: (id: number, next_number: number, end_date: string) => Promise<void>;
}

export const SequenceSettings: React.FC<SequenceSettingsProps> = ({ sequences, onUpdate }) => {
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead>
                    <tr className="border-b text-gray-500 text-sm">
                        <th className="py-3 px-4">Código</th>
                        <th className="py-3 px-4">Tipo de Comprobante</th>
                        <th className="py-3 px-4 text-center">Próximo Número</th>
                        <th className="py-3 px-4 text-right">Vencimiento</th>
                        <th className="py-3 px-4 text-right">Acción</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {sequences.map((seq) => (
                        <SequenceRow key={seq.id} sequence={seq} onUpdate={onUpdate} />
                    ))}
                    {sequences.length === 0 && (
                        <tr><td colSpan={5} className="py-4 text-center text-gray-400">No hay secuencias configuradas</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

const SequenceRow = ({ sequence, onUpdate }: { sequence: Sequence, onUpdate: (id: number, next: number, date: string) => Promise<void> }) => {
    const [next, setNext] = useState(sequence.next_number.toString());
    const [date, setDate] = useState(sequence.end_date ? new Date(sequence.end_date).toISOString().split('T')[0] : '');
    const [isDirty, setIsDirty] = useState(false);

    const handleUpdate = () => {
        onUpdate(sequence.id, parseInt(next), date);
        setIsDirty(false);
    };

    return (
        <tr className="hover:bg-gray-50">
            <td className="py-3 px-4 text-gray-500 text-sm font-mono">{sequence.type_code}</td>
            <td className="py-3 px-4 font-medium text-gray-800">
                {sequence.type_code === '01' && 'Crédito Fiscal'}
                {sequence.type_code === '02' && 'Consumo Final'}
                {sequence.type_code === '31' && 'e-CF Crédito Fiscal'}
                {sequence.type_code === '32' && 'e-CF Consumo'}
                {!['01','02','31','32'].includes(sequence.type_code) && 'Otro'}
            </td>
            <td className="py-3 px-4 text-center">
                 <div className="flex items-center justify-center gap-2">
                    <span className="text-gray-400 text-xs">B{sequence.type_code}...</span>
                    <input 
                        type="number" 
                        value={next}
                        onChange={(e) => { setNext(e.target.value); setIsDirty(true); }}
                        className="w-20 px-2 py-1 border rounded text-center text-sm"
                    />
                 </div>
            </td>
            <td className="py-3 px-4 text-right">
                <input 
                    type="date" 
                    value={date}
                    onChange={(e) => { setDate(e.target.value); setIsDirty(true); }}
                    className="px-2 py-1 border rounded text-sm text-gray-600"
                />
            </td>
            <td className="py-3 px-4 text-right">
                {isDirty && (
                    <button onClick={handleUpdate} className="text-blue-600 hover:text-blue-800 text-sm font-semibold">
                        Guardar
                    </button>
                )}
            </td>
        </tr>
    );
}
