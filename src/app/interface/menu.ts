interface MenuItem {
  id: string;
  dishName: string;
  description: string;
  price: number;
  category: string;
  ingredients: string;
  allergenInfo: string;
  status: string;
  image?: string;
  servingTimes?: string;
  addOns?: string;
  serviceCost: number;
  total: number;
}

interface CartItem {
  id: string;
  userId: string;
  menuId: string;
  quantity: number;
  menu: MenuItem;
}