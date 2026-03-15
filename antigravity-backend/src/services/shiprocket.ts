
interface ShiprocketAuthResponse {
  token: string;
}

interface ShiprocketOrderItems {
  name: string;
  sku: string;
  units: number;
  selling_price: number;
  discount?: number;
  tax?: number;
  hsn?: number;
}

interface ShiprocketOrderData {
  order_id: string;
  order_date: string;
  pickup_location: string;
  billing_customer_name: string;
  billing_last_name: string;
  billing_address: string;
  billing_city: string;
  billing_pincode: string;
  billing_state: string;
  billing_country: string;
  billing_email: string;
  billing_phone: string;
  shipping_is_billing: boolean;
  order_items: ShiprocketOrderItems[];
  payment_method: 'Prepaid' | 'COD';
  shipping_charges?: number;
  giftwrap_charges?: number;
  transaction_charges?: number;
  total_discount?: number;
  sub_total: number;
  length: number;
  breadth: number;
  height: number;
  weight: number;
}

export class ShiprocketService {
  private static token: string | null = null;
  private static tokenExpiry: number = 0;

  private static async login() {
    const email = process.env.SHIPROCKET_EMAIL;
    const password = process.env.SHIPROCKET_PASSWORD;

    if (!email || !password) {
      throw new Error('SHIPROCKET_EMAIL or SHIPROCKET_PASSWORD not configured');
    }

    // Check if token is still valid (using 9 days to be safe as it's valid for 10)
    if (this.token && Date.now() < this.tokenExpiry) {
      return this.token;
    }

    const response = await fetch('https://apiv2.shiprocket.in/v1/external/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(`Shiprocket Login Failed: ${JSON.stringify(error)}`);
    }

    const data = await response.json() as ShiprocketAuthResponse;
    this.token = data.token;
    this.tokenExpiry = Date.now() + (9 * 24 * 60 * 60 * 1000); // 9 days in ms
    return this.token;
  }

  static async createOrder(orderData: ShiprocketOrderData) {
    const token = await this.login();

    const response = await fetch('https://apiv2.shiprocket.in/v1/external/orders/create/adhoc', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(orderData)
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(`Shiprocket Order Creation Failed: ${JSON.stringify(data)}`);
    }

    return data;
  }
}
