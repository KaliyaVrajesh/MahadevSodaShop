import { create } from 'zustand'

export const useCartStore = create((set, get) => ({
  items: [],
  
  addItem: (product, quantity = 1) => {
    const items = get().items
    const existingIndex = items.findIndex(item => item.product.id === product.id)
    
    if (existingIndex >= 0) {
      const newItems = [...items]
      newItems[existingIndex].quantity += quantity
      set({ items: newItems })
    } else {
      set({ items: [...items, { product, quantity }] })
    }
  },
  
  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(productId)
      return
    }
    
    set({
      items: get().items.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    })
  },
  
  removeItem: (productId) => {
    set({ items: get().items.filter(item => item.product.id !== productId) })
  },
  
  clearCart: () => set({ items: [] }),
  
  getTotal: () => {
    return get().items.reduce(
      (sum, item) => sum + (parseFloat(item.product.price) * item.quantity),
      0
    )
  },
  
  getItemCount: () => {
    return get().items.reduce((sum, item) => sum + item.quantity, 0)
  },
}))
