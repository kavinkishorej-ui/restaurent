import { useState } from 'react';
import { X, Minus, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface CartProps {
  items: any[];
  onClose: () => void;
  onUpdateItem: (dishId: string, quantity: number) => void;
  onClearCart: () => void;
}

export function Cart({ items, onClose, onUpdateItem, onClearCart }: CartProps) {
  const { profile } = useAuth();
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const total = items.reduce((sum, item) => sum + (item.dish.price * item.quantity), 0);

  async function handlePlaceOrder() {
    if (!deliveryAddress.trim()) {
      setError('Please enter a delivery address');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const restaurantId = items[0]?.restaurant.id;

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_id: profile?.id,
          restaurant_id: restaurantId,
          total_amount: total,
          delivery_address: deliveryAddress,
          notes,
          status: 'pending',
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = items.map(item => ({
        order_id: order.id,
        dish_id: item.dish.id,
        quantity: item.quantity,
        price: item.dish.price,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      setSuccess(true);
      setTimeout(() => {
        onClearCart();
        onClose();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Placed!</h2>
          <p className="text-gray-600">Your order has been successfully placed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-md">
          <div className="flex justify-between items-center p-6 border-b">
            <h2 className="text-2xl font-bold text-gray-900">Your Cart</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>

          {items.length === 0 ? (
            <div className="p-12 text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Your cart is empty</h3>
              <p className="text-gray-600 mb-6">Add some delicious dishes to get started</p>
              <button
                onClick={onClose}
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Browse Restaurants
              </button>
            </div>
          ) : (
            <>
              <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.dish.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                    {item.dish.image_url ? (
                      <img
                        src={item.dish.image_url}
                        alt={item.dish.name}
                        className="w-20 h-20 object-cover rounded"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-red-100 rounded"></div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{item.dish.name}</h3>
                      <p className="text-sm text-gray-600">{item.restaurant.name}</p>
                      <p className="text-orange-600 font-semibold">${item.dish.price}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onUpdateItem(item.dish.id, item.quantity - 1)}
                        className="p-1 text-gray-600 hover:text-orange-600"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => onUpdateItem(item.dish.id, item.quantity + 1)}
                        className="p-1 text-gray-600 hover:text-orange-600"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onUpdateItem(item.dish.id, 0)}
                        className="p-1 text-gray-600 hover:text-red-600 ml-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        ${(item.dish.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-6 border-t space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Delivery Address *
                  </label>
                  <input
                    type="text"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Enter your delivery address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Order Notes
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Any special instructions?"
                  />
                </div>

                <div className="flex justify-between items-center text-xl font-bold pt-4 border-t">
                  <span>Total:</span>
                  <span className="text-orange-600">${total.toFixed(2)}</span>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <button
                  onClick={handlePlaceOrder}
                  disabled={loading}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50"
                >
                  {loading ? 'Placing Order...' : 'Place Order'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
