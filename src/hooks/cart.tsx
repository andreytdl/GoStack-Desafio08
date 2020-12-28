import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {


    async function loadProducts(): Promise<void> {
      setProducts([])

      //  Loading the products from async storage
      const storedProducts = await AsyncStorage.getItem('@Challenge08:products')

      //  Setting it on the product state
      if (storedProducts) {
        //Transforming the json parse into an Array with "[...]"
        setProducts([...JSON.parse(storedProducts)])
        return
      }

    }
    loadProducts();
  }, []);

  const addToCart = useCallback(async (product: Product) => {

    //  Caso já exista vamos só incrementar
    if (products.find(oldProduct => oldProduct.id === product.id)) {

      //Atualizamos toda a lista -> Caso seja o produto aumentamos 1 em sua quantidade. Caso contrário usamos o mesmo produto
      setProducts(
        products.map(p => p.id === product.id ? { ...product, quantity: p.quantity + 1 } : p,
        ),
      );
    }else{
      
      //Adicionando o novo produto mas com a quantidade igual a 1
      setProducts([...products, { ...product, quantity: 1}]);

    }


    //Guardando no async storage
    await AsyncStorage.setItem('@Challenge08:products', JSON.stringify(products))


  }, [products]);

  const increment = useCallback(async id => {

    const product = products.find(product => product.id === id)

    if (product) {
      //Atualizamos toda a lista -> Caso seja o produto aumentamos 1 em sua quantidade. Caso contrário usamos o mesmo produto
      setProducts(
        products.map(p => p.id === id ? { ...product, quantity: p.quantity + 1 } : p,
        ),
      );

      //Guardando no async storage
      await AsyncStorage.setItem('@Challenge08:products', JSON.stringify(products))

    }

  }, [products]);

  const decrement = useCallback(async id => {
    const product = products.find(product => product.id === id)

    //Caso já esteja zerado não fazer nada
    if(product?.quantity === 0){
      return
    }

    if (product) {
      //Atualizamos toda a lista -> Caso seja o produto aumentamos 1 em sua quantidade. Caso contrário usamos o mesmo produto
      setProducts(
        products.map(p => p.id === id ? { ...product, quantity: p.quantity - 1 } : p,
        ),
      );

      //Guardando no async storage
      await AsyncStorage.setItem('@Challenge08:products', JSON.stringify(products))
    }

  }, [products]);

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
