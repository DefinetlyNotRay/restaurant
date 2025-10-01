declare module "midtrans-client" {
  export class Snap {
    constructor(config: { isProduction: boolean; serverKey: string });

    createTransaction(parameter: {
      transaction_details: {
        order_id: string;
        gross_amount: number;
      };
      customer_details: {
        first_name: string;
        email: string;
        phone?: string;
      };
      item_details: Array<{
        id: string;
        price: number;
        quantity: number;
        name: string;
      }>;
      callbacks?: {
        finish?: string;
        error?: string;
        pending?: string;
      };
    }): Promise<{
      token: string;
      redirect_url: string;
    }>;
  }
}



