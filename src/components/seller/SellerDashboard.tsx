import { useState, useEffect } from 'react';
import { Store, Plus, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, Restaurant } from '../../lib/supabase';
import { RestaurantForm } from './RestaurantForm';
import { RestaurantManager } from './RestaurantManager';

export function SellerDashboard() {
  const { profile, signOut } = useAuth();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRestaurants();
  }, []);

  async function loadRestaurants() {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('seller_id', profile?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRestaurants(data || []);
    } catch (error) {
      console.error('Error loading restaurants:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleRestaurantCreated() {
    setShowForm(false);
    loadRestaurants();
  }

  if (showForm) {
    return (
      <RestaurantForm
        onClose={() => setShowForm(false)}
        onSuccess={handleRestaurantCreated}
      />
    );
  }

  if (selectedRestaurant) {
    return (
      <RestaurantManager
        restaurant={selectedRestaurant}
        onBack={() => setSelectedRestaurant(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Store className="w-8 h-8 text-orange-500" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Seller Dashboard</h1>
                <p className="text-sm text-gray-600">{profile?.full_name}</p>
              </div>
            </div>
            <button
              onClick={signOut}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            >
              <LogOut className="w-5 h-5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">My Restaurants</h2>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center space-x-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Add Restaurant</span>
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          </div>
        ) : restaurants.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Store className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No restaurants yet</h3>
            <p className="text-gray-600 mb-6">Create your first restaurant to start selling dishes</p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center space-x-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Add Restaurant</span>
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {restaurants.map((restaurant) => (
              <div
                key={restaurant.id}
                onClick={() => setSelectedRestaurant(restaurant)}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
              >
                {restaurant.image_url ? (
                  <img
                    src={restaurant.image_url}
                    alt={restaurant.name}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center">
                    <Store className="w-16 h-16 text-orange-300" />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{restaurant.name}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">{restaurant.description}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      restaurant.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {restaurant.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
