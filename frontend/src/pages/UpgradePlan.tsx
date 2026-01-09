import { Check, ShieldCheck } from 'lucide-react';
import React from 'react';
import { toast } from 'react-hot-toast';
import axios from '../api';
import { useAuth } from '../context/AuthContext';

export const UpgradePlan: React.FC = () => {
    const { profile, fetchProfile } = useAuth();
    const [loading, setLoading] = React.useState<string | null>(null);
    const [billingInterval, setBillingInterval] = React.useState<'month' | 'year'>('month');

    React.useEffect(() => {
        fetchProfile();
    }, []);

    const handleUpgrade = async (planId: string) => {
        setLoading(planId);
        try {
            const { data } = await axios.post('/api/subscriptions/create-checkout-session', {
                planId,
                interval: billingInterval
            });
            if (data.url) {
                window.location.href = data.url;
            }
        } catch (err: any) {
            console.error(err);
            toast.error(err.response?.data?.error || 'Error al conectar con Stripe');
        } finally {
            setLoading(null);
        }
    };

    const prices = {
        entrepreneur: { month: 'RD$ 1,500', year: 'RD$ 15,000' },
        pyme: { month: 'RD$ 3,500', year: 'RD$ 35,000' },
        enterprise: { month: 'RD$ 6,500', year: 'RD$ 65,000' }
    };

    return (
        <div className="max-w-6xl mx-auto py-8 px-4">
            <header className="mb-8 text-center">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Actualizar Plan</h1>
                <p className="text-gray-500 mt-2">Eleva tu negocio con herramientas avanzadas</p>

                <div className="mt-6 flex justify-center">
                    <div className="bg-gray-100 p-1 rounded-xl flex items-center relative">
                        <button
                            onClick={() => setBillingInterval('month')}
                            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${billingInterval === 'month' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            Mensual
                        </button>
                        <button
                            onClick={() => setBillingInterval('year')}
                            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${billingInterval === 'year' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            Anual
                            <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full">AHORRA 17%</span>
                        </button>
                    </div>
                </div>

                <div className="mt-4 flex items-center justify-center gap-2 text-sm font-medium text-blue-600 bg-blue-50 w-fit mx-auto px-4 py-1.5 rounded-full border border-blue-100">
                    <ShieldCheck size={18} /> Plan Actual: <span className="uppercase font-bold">{profile?.plan || 'Free'}</span>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Emprendedor Plan */}
                <UpgradeCard
                    title="Emprendedor"
                    price={prices.entrepreneur[billingInterval]}
                    period={billingInterval === 'month' ? '/ mes' : '/ año'}
                    description="Para pequeños negocios que facturan desde la web."
                    features={[
                        "Facturación Ilimitada",
                        "Clientes Ilimitados",
                        "1 Usuario",
                        "Facturas B01 y B02",
                        "Soporte por Email"
                    ]}
                    isCurrent={profile?.plan === 'entrepreneur'}
                    onUpgrade={() => handleUpgrade('entrepreneur')}
                    loading={loading === 'entrepreneur'}
                />

                {/* Pyme Plan */}
                <UpgradeCard
                    title="Pyme"
                    price={prices.pyme[billingInterval]}
                    period={billingInterval === 'month' ? '/ mes' : '/ año'}
                    description="El plan ideal para negocios en crecimiento."
                    features={[
                        "Todo lo de Emprendedor",
                        "3 Usuarios habilitados",
                        "App Móvil (iOS & Android)",
                        "Reportes Avanzados",
                        "Soporte Prioritario",
                        "Facturación Electrónica" // Added explicitly based on recent changes
                    ]}
                    highlight={true}
                    isCurrent={profile?.plan === 'pyme'}
                    onUpgrade={() => handleUpgrade('pyme')}
                    loading={loading === 'pyme'}
                />

                {/* Enterprise Plan */}
                <UpgradeCard
                    title="Empresarial"
                    price={prices.enterprise[billingInterval]}
                    period={billingInterval === 'month' ? '/ mes' : '/ año'}
                    description="Para empresas que necesitan control total."
                    features={[
                        "Usuarios Ilimitados",
                        "Múltiples Sucursales",
                        "Firma Digital Incluida",
                        "API de Integración",
                        "Gerente de Cuenta Dedicado"
                    ]}
                    isCurrent={profile?.plan === 'enterprise'}
                    onUpgrade={() => handleUpgrade('enterprise')}
                    loading={loading === 'enterprise'}
                />
            </div>
        </div>
    );
};

const UpgradeCard = ({ title, price, period, description, features, highlight, isCurrent, onUpgrade, loading }: any) => (
    <div className={`relative bg-white rounded-3xl p-8 shadow-sm flex flex-col transition-all ${highlight ? 'ring-2 ring-blue-600 shadow-xl scale-105 z-10' : 'border border-gray-100'}`}>
        {highlight && (
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <span className="bg-blue-600 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-lg">Más Recomendado</span>
            </div>
        )}
        <h3 className="text-xl font-bold text-gray-900">{title}</h3>
        <p className="text-gray-500 mt-2 text-sm leading-relaxed">{description}</p>
        <div className="my-8">
            <span className="text-4xl font-bold text-gray-900">{price}</span>
            <span className="text-gray-500 font-medium"> {period}</span>
        </div>

        <ul className="space-y-4 mb-10 flex-1">
            {features.map((feature: string, i: number) => (
                <li key={i} className="flex items-start gap-3">
                    <div className="mt-1 bg-green-100 rounded-full p-0.5">
                        <Check className="w-3.5 h-3.5 text-green-600" />
                    </div>
                    <span className="text-gray-600 text-sm font-medium">{feature}</span>
                </li>
            ))}
        </ul>

        {isCurrent ? (
            <div className="w-full text-center py-3.5 rounded-2xl font-bold bg-gray-50 text-gray-400 border border-gray-100 cursor-default">
                Plan Actual
            </div>
        ) : (
            <button
                onClick={onUpgrade}
                disabled={loading}
                className={`block w-full text-center py-3.5 rounded-2xl font-bold transition-all transform active:scale-95 disabled:opacity-50 ${highlight
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200'
                    : 'bg-gray-900 text-white hover:bg-black shadow-lg shadow-gray-200'
                    }`}
            >
                {loading ? 'Redirigiendo...' : 'Actualizar Ahora'}
            </button>
        )}
    </div>
);
