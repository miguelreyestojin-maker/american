export type ProductRow = {
  id: string;
  created_at: string;
  title: string;
  description: string;
  price_gtq: string;
  stock: number;
  category: string;
  image_url: string | null;
  is_available: boolean;
};

export type ProductInsert = {
  id?: string;
  created_at?: string;
  title: string;
  description?: string;
  price_gtq: number | string;
  stock?: number;
  category: string;
  image_url?: string | null;
  is_available?: boolean;
};

export type ProductUpdate = Partial<ProductInsert>;

export type PurchaseStatus = "pending" | "sold";

export type PurchaseRequestRow = {
  id: string;
  created_at: string;
  product_id: string;
  customer_name: string;
  phone: string;
  quantity: number;
  note: string;
  status: PurchaseStatus;
};

export type PurchaseRequestInsert = {
  id?: string;
  created_at?: string;
  product_id: string;
  customer_name: string;
  phone: string;
  quantity: number;
  note?: string;
  status?: PurchaseStatus;
};

export type Database = {
  public: {
    Tables: {
      products: {
        Row: ProductRow;
        Insert: ProductInsert;
        Update: ProductUpdate;
        Relationships: [];
      };
      purchase_requests: {
        Row: PurchaseRequestRow;
        Insert: PurchaseRequestInsert;
        Update: Partial<PurchaseRequestInsert>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      confirm_purchase: {
        Args: { request_id: string };
        Returns: undefined;
      };
    };
  };
};
