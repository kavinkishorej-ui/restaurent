import { useAuth } from './contexts/AuthContext';
import { AuthForm } from './components/auth/AuthForm';
import { SellerDashboard } from './components/seller/SellerDashboard';
import { CustomerDashboard } from './components/customer/CustomerDashboard';

function App() {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!user || !profile) {
    return <AuthForm />;
  }

  if (profile.user_type === 'seller') {
    return <SellerDashboard />;
  }

  return <CustomerDashboard />;
}

export default App;
