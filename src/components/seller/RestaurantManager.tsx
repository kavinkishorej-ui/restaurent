import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Edit, Trash2 } from 'lucide-react';
import { supabase, Restaurant, Dish } from '../../lib/supabase';
import { DishForm } from './DishForm';

interface RestaurantManagerProps {
  restaurant: Restaurant;
  onBack: () => void;
}

export function RestaurantManager({ restaurant, onBack }: RestaurantManagerProps) {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [showDishForm, setShowDishForm] = useState(false);
  const [editingDish, setEditingDish] = useState<Dish | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDishes();
  }, [restaurant.id]);

  async function loadDishes() {
    try {
      const { data, error } = await supabase
        .from('dishes')
        .select('*')
        .eq('restaurant_id', restaurant.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDishes(data || []);
    } catch (error) {
      console.error('Error loading dishes:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteDish(dishId: string) {
    if (!confirm('Are you sure you want to delete this dish?')) return;

    try {
      const { error } = await supabase
        .from('dishes')
        .delete()
        .eq('id', dishId);

      if (error) throw error;
      loadDishes();
    } catch (error) {
      console.error('Error deleting dish:', error);
    }
  }

  async function handleToggleAvailability(dish: Dish) {
    try {
      const { error } = await supabase
        .from('dishes')
        .update({ is_available: !dish.is_available })
        .eq('id', dish.id);

      if (error) throw error;
      loadDishes();
    } catch (error) {
      console.error('Error updating dish:', error);
    }
  }

  function handleDishSuccess() {
    setShowDishForm(false);
    setEditingDish(null);
    loadDishes();
  }

  if (showDishForm || editingDish) {
    return (
      <DishForm
        restaurant={restaurant}
        dish={editingDish}
        onClose={() => {
          setShowDishForm(false);
          setEditingDish(null);
        }}
        onSuccess={handleDishSuccess}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Restaurants</span>
          </button>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{restaurant.name}</h1>
              <p className="text-gray-600 mt-1">{restaurant.description}</p>
            </div>
            <button
              onClick={() => setShowDishForm(true)}
              className="flex items-center space-x-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Add Dish</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Menu Items</h2>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          </div>
        ) : dishes.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No dishes yet</h3>
            <p className="text-gray-600 mb-6">Add your first dish to start selling</p>
            <button
              onClick={() => setShowDishForm(true)}
              className="inline-flex items-center space-x-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Add Dish</span>
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {dishes.map((dish) => (
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
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => handleToggleAvailability(dish)}
                      className={`text-xs px-3 py-1 rounded-full ${
                        dish.is_available
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {dish.is_available ? 'Available' : 'Unavailable'}
                    </button>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setEditingDish(dish)}
                        className="p-2 text-gray-600 hover:text-orange-600"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteDish(dish.id)}
                        className="p-2 text-gray-600 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
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
