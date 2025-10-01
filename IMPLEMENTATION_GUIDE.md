# Restaurant Management System - Implementation Guide

## 📋 Project Overview

Build a complete restaurant management system with AI-powered product extraction, payment integration, and modern tech stack.

**Deadline**: Maximum 3 calendar days from receiving brief (faster = bonus points)

## 🏗️ Architecture & Tech Stack

### Required Technologies

- **Frontend**: Next.js
- **Database**: Supabase
- **Backend Orchestration**: n8n for main workflows
- **AI Framework**: LangChain for text & product information extraction
- **Builder Tools**: Use one of (v0, Lovable, or Bolt) as needed
- **Payment Gateway**: Midtrans OR Xendit (sandbox mode)

### Mindset

**Vibecoding mindset is a must** — use modern builder tools to accelerate development.

## 🎯 MVP Features

### Public Side (Customer Interface)

1. **Landing Page**

   - Display food/drink menu
   - Product cards with images, names, descriptions, prices
   - Add to cart functionality
   - Shopping cart management

2. **Checkout Process**
   - Simple checkout form
   - Payment gateway integration (sandbox)
   - Order confirmation after successful payment

### Admin Side (Restaurant Owner Interface)

1. **Authentication** (optional but recommended)

   - Simple login system

2. **Product Management**
   - Photo upload interface
   - AI-powered extraction of:
     - Product name
     - Short description
     - Price
   - Automatic product display on landing page

## 🔧 Implementation Steps

### Phase 1: Project Setup

1. **Initialize Next.js Project**

   ```bash
   npx create-next-app@latest restaurant-system
   cd restaurant-system
   npm install
   ```

2. **Install Required Dependencies**

   ```bash
   # Core dependencies
   npm install @supabase/supabase-js
   npm install langchain
   npm install @langchain/openai

   # Payment gateway (choose one)
   npm install midtrans-client  # OR
   npm install xendit-node

   # UI/UX
   npm install @headlessui/react @heroicons/react
   npm install react-hot-toast

   # Form handling
   npm install react-hook-form

   # Image handling
   npm install next-cloudinary  # or similar
   ```

3. **Environment Setup**
   Create `.env.local`:

   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

   # OpenAI for LangChain
   OPENAI_API_KEY=your_openai_api_key

   # Payment Gateway (choose one)
   MIDTRANS_SERVER_KEY=your_midtrans_server_key
   MIDTRANS_CLIENT_KEY=your_midtrans_client_key
   # OR
   XENDIT_SECRET_KEY=your_xendit_secret_key

   # n8n
   N8N_WEBHOOK_URL=your_n8n_webhook_url
   ```

### Phase 2: Database Setup (Supabase)

1. **Create Tables**

   ```sql
   -- Products table
   CREATE TABLE products (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     name VARCHAR(255) NOT NULL,
     description TEXT,
     price DECIMAL(10,2) NOT NULL,
     image_url TEXT,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Orders table
   CREATE TABLE orders (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     customer_email VARCHAR(255),
     customer_name VARCHAR(255),
     total_amount DECIMAL(10,2) NOT NULL,
     status VARCHAR(50) DEFAULT 'pending',
     payment_id VARCHAR(255),
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Order items table
   CREATE TABLE order_items (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
     product_id UUID REFERENCES products(id),
     quantity INTEGER NOT NULL,
     price DECIMAL(10,2) NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Admin users (optional)
   CREATE TABLE admin_users (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     email VARCHAR(255) UNIQUE NOT NULL,
     password_hash VARCHAR(255) NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

2. **Set up Row Level Security (RLS)**

   ```sql
   -- Enable RLS
   ALTER TABLE products ENABLE ROW LEVEL SECURITY;
   ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
   ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

   -- Public read access for products
   CREATE POLICY "Products are viewable by everyone" ON products
     FOR SELECT USING (true);

   -- Orders policies (customers can only see their own orders)
   CREATE POLICY "Users can view their own orders" ON orders
     FOR SELECT USING (auth.email() = customer_email);
   ```

### Phase 3: Frontend Development

1. **Project Structure**

   ```
   src/
   ├── app/
   │   ├── page.tsx                 # Landing page
   │   ├── cart/
   │   │   └── page.tsx            # Cart page
   │   ├── checkout/
   │   │   └── page.tsx            # Checkout page
   │   ├── admin/
   │   │   ├── page.tsx            # Admin dashboard
   │   │   └── upload/
   │   │       └── page.tsx        # Product upload
   │   └── api/
   │       ├── products/
   │       ├── orders/
   │       ├── payment/
   │       └── ai-extract/
   ├── components/
   │   ├── ProductCard.tsx
   │   ├── Cart.tsx
   │   ├── CheckoutForm.tsx
   │   └── AdminUpload.tsx
   ├── lib/
   │   ├── supabase.ts
   │   ├── langchain.ts
   │   └── payment.ts
   └── types/
       └── index.ts
   ```

2. **Key Components**

   **ProductCard Component**

   ```tsx
   interface Product {
     id: string;
     name: string;
     description: string;
     price: number;
     image_url: string;
   }

   export function ProductCard({
     product,
     onAddToCart,
   }: {
     product: Product;
     onAddToCart: (product: Product) => void;
   }) {
     return (
       <div className="border rounded-lg p-4 shadow-md">
         <img
           src={product.image_url}
           alt={product.name}
           className="w-full h-48 object-cover rounded"
         />
         <h3 className="text-lg font-semibold mt-2">{product.name}</h3>
         <p className="text-gray-600 text-sm">{product.description}</p>
         <div className="flex justify-between items-center mt-4">
           <span className="text-xl font-bold">${product.price}</span>
           <button
             onClick={() => onAddToCart(product)}
             className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
           >
             Add to Cart
           </button>
         </div>
       </div>
     );
   }
   ```

### Phase 4: Backend API Development

1. **Product Management API**

   ```typescript
   // app/api/products/route.ts
   import { createClient } from "@supabase/supabase-js";

   export async function GET() {
     const supabase = createClient(
       process.env.NEXT_PUBLIC_SUPABASE_URL!,
       process.env.SUPABASE_SERVICE_ROLE_KEY!
     );

     const { data: products, error } = await supabase
       .from("products")
       .select("*")
       .order("created_at", { ascending: false });

     if (error) {
       return Response.json({ error: error.message }, { status: 500 });
     }

     return Response.json(products);
   }
   ```

2. **AI Extraction API**

   ```typescript
   // app/api/ai-extract/route.ts
   import { ChatOpenAI } from "@langchain/openai";
   import { PromptTemplate } from "@langchain/core/prompts";

   export async function POST(request: Request) {
     const { imageUrl } = await request.json();

     const model = new ChatOpenAI({
       openAIApiKey: process.env.OPENAI_API_KEY,
       modelName: "gpt-4-vision-preview",
     });

     const prompt = PromptTemplate.fromTemplate(`
       Analyze this food/drink image and extract:
       1. Product name
       2. Short description (max 50 words)
       3. Estimated price in USD
       
       Return as JSON: {{"name": "", "description": "", "price": 0}}
       
       Image URL: {imageUrl}
     `);

     try {
       const response = await model.invoke(await prompt.format({ imageUrl }));

       const extracted = JSON.parse(response.content as string);
       return Response.json(extracted);
     } catch (error) {
       return Response.json(
         { error: "Failed to extract product info" },
         { status: 500 }
       );
     }
   }
   ```

### Phase 5: Payment Integration

1. **Choose Payment Gateway**

   **Option A: Midtrans**

   ```typescript
   // lib/midtrans.ts
   import { Snap } from "midtrans-client";

   const snap = new Snap({
     isProduction: false, // sandbox
     serverKey: process.env.MIDTRANS_SERVER_KEY!,
   });

   export async function createPayment(orderData: {
     orderId: string;
     amount: number;
     customerDetails: any;
   }) {
     const parameter = {
       transaction_details: {
         order_id: orderData.orderId,
         gross_amount: orderData.amount,
       },
       customer_details: orderData.customerDetails,
     };

     return await snap.createTransaction(parameter);
   }
   ```

   **Option B: Xendit**

   ```typescript
   // lib/xendit.ts
   import { Xendit } from "xendit-node";

   const xendit = new Xendit({
     secretKey: process.env.XENDIT_SECRET_KEY!,
   });

   export async function createInvoice(orderData: {
     amount: number;
     description: string;
     customerEmail: string;
   }) {
     return await xendit.Invoice.createInvoice({
       externalId: `order-${Date.now()}`,
       amount: orderData.amount,
       description: orderData.description,
       invoiceDuration: 86400, // 24 hours
       customer: {
         email: orderData.customerEmail,
       },
       successRedirectUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/order-success`,
       failureRedirectUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/order-failed`,
     });
   }
   ```

### Phase 6: n8n Workflow Setup

1. **Create n8n Workflows**

   - **Product Processing Workflow**:

     - Trigger: Webhook (when image uploaded)
     - Node 1: Call AI extraction API
     - Node 2: Save to Supabase
     - Node 3: Send confirmation

   - **Payment Processing Workflow**:
     - Trigger: Payment webhook
     - Node 1: Verify payment
     - Node 2: Update order status
     - Node 3: Send confirmation email

2. **Webhook Integration**

   ```typescript
   // app/api/webhooks/n8n/route.ts
   export async function POST(request: Request) {
     const data = await request.json();

     // Trigger n8n workflow
     const response = await fetch(process.env.N8N_WEBHOOK_URL!, {
       method: "POST",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify(data),
     });

     return Response.json({ success: true });
   }
   ```

### Phase 7: Admin Panel

1. **Upload Interface**

   ```tsx
   // components/AdminUpload.tsx
   export function AdminUpload() {
     const [uploading, setUploading] = useState(false);

     const handleUpload = async (file: File) => {
       setUploading(true);

       // Upload image to storage
       const formData = new FormData();
       formData.append("file", file);

       const uploadResponse = await fetch("/api/upload", {
         method: "POST",
         body: formData,
       });

       const { imageUrl } = await uploadResponse.json();

       // Extract product info using AI
       const extractResponse = await fetch("/api/ai-extract", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ imageUrl }),
       });

       const productInfo = await extractResponse.json();

       // Save product to database
       await fetch("/api/products", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({
           ...productInfo,
           image_url: imageUrl,
         }),
       });

       setUploading(false);
     };

     return (
       <div className="upload-interface">{/* Upload UI implementation */}</div>
     );
   }
   ```

## 🚀 Deployment

1. **Frontend Deployment**

   - Deploy to Vercel/Netlify
   - Set environment variables
   - Configure custom domain

2. **n8n Setup**
   - Deploy n8n instance (cloud or self-hosted)
   - Configure workflows
   - Set up webhooks

## ✅ Acceptance Criteria Checklist

- [ ] New products can be added via photo upload (end-to-end)
- [ ] Add to cart, checkout, and sandbox payment work
- [ ] Order status changes after payment callback
- [ ] Demo link is publicly accessible

## 📊 Evaluation Criteria

1. **Functionality (40%)** — All features work properly
2. **Architecture & Vibecoding Tools (25%)** — Effective use of builder tools + n8n + LangChain
3. **Code Quality & Security (15%)** — Clean structure, .env usage, error handling
4. **UX/Flow (10%)** — Clear and easy-to-use flow
5. **Documentation (10%)** — Concise and clear documentation

## 📦 Deliverables

### Required Submissions

1. **Public URLs**

   - Landing page (customer interface)
   - Admin panel

2. **Documentation** (README/Notion/Google Doc)
   - Brief architecture overview
   - n8n workflow description
   - Payment integration notes (chosen gateway)

### Email Submission

- **To**: susi@merdeka-ai.com
- **CC**: info@merdeka-ai.com
- **Subject**: Technical*Test*[your_name]
- **Content**: Demo links + documentation link

### Google Form Submission

After completion, upload links via: https://docs.google.com/forms/d/e/1FAIpQLSerG7VTdFQGDdh7FE3WurQsIcWJmDJG4dd0QocorgzCcfs0iA/viewform?usp=sharing&ouid=100226121508277805965

## 🔧 Development Tips

1. **Use Builder Tools Effectively**

   - Leverage v0/Lovable/Bolt for rapid UI development
   - Focus on functionality over perfect styling initially

2. **AI Integration Best Practices**

   - Test LangChain prompts thoroughly
   - Handle AI extraction failures gracefully
   - Provide manual override options

3. **Payment Integration**

   - Always use sandbox mode
   - Test all payment flows
   - Handle webhook failures

4. **Error Handling**

   - Implement proper try-catch blocks
   - User-friendly error messages
   - Logging for debugging

5. **Security Considerations**
   - Use environment variables for secrets
   - Implement proper validation
   - Secure API endpoints

## 🎯 Success Path

1. **Day 1**: Setup + Database + Basic Frontend
2. **Day 2**: AI Integration + Payment + n8n Workflows
3. **Day 3**: Testing + Deployment + Documentation

**Remember**: Speed matters, but functionality is key. Use modern tools to accelerate development while ensuring all features work correctly.
