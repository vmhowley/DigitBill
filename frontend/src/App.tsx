import { Toaster } from 'react-hot-toast';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';

import { GlobalLoader } from './components/GlobalLoader';
import { Layout } from './components/Layout';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages & Components
import { Login } from './pages/Login';

import { Dashboard } from './pages/Dashboard';
import { Landing } from './pages/Landing';
import { Pricing } from './pages/Pricing';
import { Register } from './pages/Register';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';

import type { ReactNode } from 'react';
import { ClientForm } from './components/ClientForm';
import { ClientList } from './components/ClientList';
import { ExpenseList } from './components/ExpenseList';
import { InvoiceDetails } from './components/InvoiceDetails';
import { InvoiceForm } from './components/InvoiceForm';
import { InvoiceList } from './components/InvoiceList';
import { ProductForm } from './components/ProductForm';
import { ProductList } from './components/ProductList';
import { ProviderForm } from './components/ProviderForm';
import { ProviderList } from './components/ProviderList';
import { ClientStatement } from './pages/ClientStatement';
import { InventoryPage } from './pages/Inventory';
import { ResetPassword } from './pages/ResetPassword';
import { UpgradePlan } from './pages/UpgradePlan';
import { PaymentSuccess, PaymentCancel } from './pages/PaymentStatus';

// Protected Route Component
const ProtectedRoute = ({ children, roles }: { children: ReactNode, roles?: string[] }) => {
  const { session, loading, profile, needsMFA } = useAuth();

  if (loading) return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;

  // 1. Not Logged In -> Go to Login
  if (!session) return <Navigate to="/login" replace />;

  // 2. Logged In but Needs MFA -> Go to Login (where MFA form is shown)
  if (needsMFA) return <Navigate to="/login" replace />;

  // 3. Role Check
  if (roles && profile && !roles.includes(profile.role)) {
    return <div className="p-10 text-center text-red-500">Acceso Denegado: Permisos insuficientes (Rol: {profile.role})</div>;
  }

  return <Layout>{children}</Layout>;
};

// Route that redirects to Dashboard if logged in, otherwise renders children (Public Page)
const PublicRoute = ({ children }: { children: ReactNode }) => {
  const { loading } = useAuth();

  if (loading) return null;

  // If user is logged in, usually redirect to Dashboard.
  // BUT if they need MFA, they must stay on the public page (Login) to enter code.
  // if (session && !needsMFA) {
  //   return <Navigate to="/dashboard" replace />;
  // }

  return children;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
      <Route path="/pricing" element={<PublicRoute><Pricing /></PublicRoute>} />

      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/update-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />


      {/* Protected Dashboard Routes - Now prefixed with /dashboard or accessible via specific paths */}
      {/* Moving Root Dashboard to /dashboard */}
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/invoices" element={<ProtectedRoute><InvoiceList /></ProtectedRoute>} />

      <Route path="/invoices/:id" element={<ProtectedRoute><InvoiceDetails /></ProtectedRoute>} />
      <Route path="/create" element={<ProtectedRoute><InvoiceForm /></ProtectedRoute>} />

      <Route path="/clients" element={<ProtectedRoute><ClientList /></ProtectedRoute>} />
      <Route path="/clients/new" element={<ProtectedRoute><ClientForm /></ProtectedRoute>} />
      <Route path="/clients/edit/:id" element={<ProtectedRoute><ClientForm /></ProtectedRoute>} />
      <Route path="/clients/:id/statement" element={<ProtectedRoute><ClientStatement /></ProtectedRoute>} />

      <Route path="/products" element={<ProtectedRoute><ProductList /></ProtectedRoute>} />
      <Route path="/products/new" element={<ProtectedRoute roles={['admin']}><ProductForm /></ProtectedRoute>} />
      <Route path="/products/edit/:id" element={<ProtectedRoute roles={['admin']}><ProductForm /></ProtectedRoute>} />

      {/* Admin/Accountant Only */}
      <Route path="/reports" element={<ProtectedRoute roles={['admin', 'accountant']}><Reports /></ProtectedRoute>} />
      <Route path="/expenses" element={<ProtectedRoute roles={['admin', 'accountant']}><ExpenseList /></ProtectedRoute>} />
      <Route path="/providers" element={<ProtectedRoute roles={['admin', 'accountant']}><ProviderList /></ProtectedRoute>} />
      <Route path="/providers/new" element={<ProtectedRoute roles={['admin', 'accountant']}><ProviderForm /></ProtectedRoute>} />
      <Route path="/providers/edit/:id" element={<ProtectedRoute roles={['admin', 'accountant']}><ProviderForm /></ProtectedRoute>} />
      <Route path="/inventory" element={<ProtectedRoute roles={['admin', 'accountant']}><InventoryPage /></ProtectedRoute>} />

      {/* Admin Only */}
      <Route path="/settings" element={<ProtectedRoute roles={['admin']}><Settings /></ProtectedRoute>} />
      
      {/* Platform Subscriptions */}
      <Route path="/upgrade" element={<ProtectedRoute roles={['admin']}><UpgradePlan /></ProtectedRoute>} />
      <Route path="/payment/success" element={<ProtectedRoute><PaymentSuccess /></ProtectedRoute>} />
      <Route path="/payment/cancel" element={<ProtectedRoute><PaymentCancel /></ProtectedRoute>} />

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster position="top-center" />
        <GlobalLoader />
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
