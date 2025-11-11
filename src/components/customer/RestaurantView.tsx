import { useState, useEffect } from 'react';
import { ArrowLeft, ShoppingCart, Plus } from 'lucide-react';
import { supabase, Restaurant, Dish } from '../../lib/supabase';

interface RestaurantViewProps {
  restaurant: Restaurant;
  onBack: () => void;
  onAddToCart: (dish: Dish) => void;
  cartItemCount: number;
  onShowCart: () => void;
}

export function RestaurantView({ restaurant, onBack, onAddToCart, cartItemCount, onShowCart }: RestaurantViewProps) {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  useEffect(() => {
    loadDishes();
  }, [restaurant.id]);

  async function loadDishes() {
    try {
      const { data, error } = await supabase
        .from('dishes')
        .select('*')
        .eq('restaurant_id', restaurant.id)
        .eq('is_available', true)
        .order('category', { ascending: true });

      if (error) throw error;
      setDishes(data || []);
    } catch (error) {
      console.error('Error loading dishes:', error);
    } finally {
      setLoading(false);
    }
  }

  const categories = ['All', ...new Set(dishes.map(dish => dish.category))];
  const filteredDishes = selectedCategory === 'All'
    ? dishes
    : dishes.filter(dish => dish.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
            <button
              onClick={onShowCart}
              className="relative p-2 text-gray-600 hover:text-gray-900"
            >
              <ShoppingCart className="w-6 h-6" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </button>
          </div>

          <div className="mt-4">
            {restaurant.image_url && (
              <img
                src={restaurant.image_url}
                alt={restaurant.name}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
            )}
            <h1 className="text-2xl font-bold text-gray-900">{restaurant.name}</h1>
            <p className="text-gray-600 mt-1">{restaurant.description}</p>
            {restaurant.address && (
              <p className="text-sm text-gray-500 mt-2">{restaurant.address}</p>
            )}
            {restaurant.phone && (
              <p className="text-sm text-gray-500">{restaurant.phone}</p>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                  selectedCategory === category
                    ? 'bg-orange-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          </div>
        ) : filteredDishes.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No dishes available</h3>
            <p className="text-gray-600">This restaurant hasn't added any dishes yet</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredDishes.map((dish) => (
              <div key={dish.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                {dish.image_url ? (
                  <img
                    src={dish.image_url}
                    alt={dish.name}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-orange-100 to-red-100"></div>
                )}
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{dish.name}</h3>
                    <span className="text-lg font-bold text-orange-600">${dish.price}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">{dish.description}</p>
                  <p className="text-xs text-gray-500 mb-4">{dish.category}</p>
                  <button
                    onClick={() => onAddToCart(dish)}
                    className="w-full flex items-center justify-center space-x-2 bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add to Cart</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
