import { useState, useEffect } from 'react';
import { ShoppingCart, LogOut, Store } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, Restaurant } from '../../lib/supabase';
import { RestaurantView } from './RestaurantView';
import { Cart } from './Cart';

export function CustomerDashboard() {
  const { profile, signOut } = useAuth();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [showCart, setShowCart] = useState(false);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRestaurants();
  }, []);

  async function loadRestaurants() {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRestaurants(data || []);
    } catch (error) {
      console.error('Error loading restaurants:', error);
    } finally {
      setLoading(false);
    }
  }

  function addToCart(dish: any, restaurant: Restaurant) {
    const existingItem = cartItems.find(item => item.dish.id === dish.id);

    if (existingItem) {
      setCartItems(cartItems.map(item =>
        item.dish.id === dish.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCartItems([...cartItems, { dish, restaurant, quantity: 1 }]);
    }
  }

  function updateCartItem(dishId: string, quantity: number) {
    if (quantity === 0) {
      setCartItems(cartItems.filter(item => item.dish.id !== dishId));
    } else {
      setCartItems(cartItems.map(item =>
        item.dish.id === dishId
          ? { ...item, quantity }
          : item
      ));
    }
  }

  function clearCart() {
    setCartItems([]);
  }

  if (selectedRestaurant) {
    return (
      <RestaurantView
        restaurant={selectedRestaurant}
        onBack={() => setSelectedRestaurant(null)}
        onAddToCart={(dish) => addToCart(dish, selectedRestaurant)}
        cartItemCount={cartItems.length}
        onShowCart={() => setShowCart(true)}
      />
    );
  }

  if (showCart) {
    return (
      <Cart
        items={cartItems}
        onClose={() => setShowCart(false)}
        onUpdateItem={updateCartItem}
        onClearCart={clearCart}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Store className="w-8 h-8 text-orange-500" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Restaurant Platform</h1>
                <p className="text-sm text-gray-600">{profile?.full_name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowCart(true)}
                className="relative p-2 text-gray-600 hover:text-gray-900"
              >
                <ShoppingCart className="w-6 h-6" />
                {cartItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartItems.length}
                  </span>
                )}
              </button>
              <button
                onClick={signOut}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
              >
                <LogOut className="w-5 h-5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Browse Restaurants</h2>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          </div>
        ) : restaurants.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Store className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No restaurants available</h3>
            <p className="text-gray-600">Check back soon for new restaurants</p>
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
                  {restaurant.address && (
                    <p className="text-xs text-gray-500 mt-2">{restaurant.address}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
