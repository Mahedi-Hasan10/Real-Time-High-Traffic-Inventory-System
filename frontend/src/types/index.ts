export interface Drop {
  id: string;
  name: string;
  description?: string;
  price: number;
  totalStock: number;
  availableStock: number;
  startTime: string;
  status: 'DRAFT' | 'ACTIVE' | 'COMPLETED';
  purchases?: Purchase[];
}

export interface Purchase {
  id: string;
  userId: string;
  dropId: string;
  amount: number;
  createdAt: string;
  user: {
    name: string;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface StockUpdate {
  dropId: string;
  availableStock: number;
}

export interface NewPurchase {
  dropId: string;
  userName: string;
}
