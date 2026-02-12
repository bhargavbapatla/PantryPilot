# 🧁 PantryPilot
### Smart Inventory & Order Management for Home Bakers

**PantryPilot** is a full-stack SaaS application designed to streamline the chaotic operations of a home baking business. It replaces manual spreadsheets with a precision-engineered system that tracks inventory down to the gram, manages complex orders, and automates cost calculations.

Built with a **Monorepo** architecture using **React**, **Node.js**, and **PostgreSQL**.

---

## 🚀 Key Features

* **📦 Precision Inventory Tracking**:
    * **Atomic Units**: Stores all inventory in base units (Grams, Milliliters, Pieces) to eliminate floating-point errors.
    * **Smart Conversion**: Buy in KGs, bake in Grams. The system handles the math automatically.
    * **Low Stock Alerts**: Visual indicators when ingredients dip below a safety threshold.

* **📝 Order Management Workflow**:
    * **Lifecycle Tracking**: Move orders from `Pending` → `Ongoing` → `Completed`.
    * **Auto-Deduction**: Ingredients are automatically deducted from inventory the moment an order becomes `Ongoing`.
    * **Rollback Support**: Cancelling an order automatically restores the ingredients to the shelf.

* **💰 Costing & Recipes**:
    * **Dynamic Pricing**: Calculates the exact cost of a recipe based on the current price of ingredients in stock.
    * **Profit Margin Analysis**: See real-time profit per order.

* **🤖 AI & Automation**:
    * **Gemini AI Integration**: For smart recipe generation and pricing insights.
    * **WhatsApp Integration**: Sends automated order confirmations to customers.

---

## 🛠️ Tech Stack

### **Frontend (Client)**
* **Framework**: [React](https://react.dev/) (Vite)
* **Styling**: [Tailwind CSS](https://tailwindcss.com/)
* **Animations**: [Framer Motion](https://www.framer.com/motion/) (Custom loaders & transitions)
* **State/API**: Axios, React Hooks

### **Backend (Server)**
* **Runtime**: [Node.js](https://nodejs.org/) & [Express.js](https://expressjs.com/)
* **Language**: TypeScript
* **ORM**: [Prisma](https://www.prisma.io/)
* **Database**: [PostgreSQL](https://www.postgresql.org/) (Hosted on **Neon.tech**)
* **AI**: Google Gemini API

### **DevOps & Deployment**
* **Frontend Hosting**: Vercel
* **Backend Hosting**: Render.com
* **Database Hosting**: Neon (Serverless Postgres)

---

## 📂 Project Structure (Monorepo)

```bash
pantrypilot/
├── client/                 # Frontend React Application
│   ├── src/
│   ├── public/
│   └── package.json
├── server/                 # Backend Node.js API
│   ├── src/
│   │   ├── controllers/    # Business Logic (Order, Inventory, Product)
│   │   ├── prisma/         # Database Schema
│   │   └── routes/         # API Endpoints
│   └── package.json
└── README.md
```

## Built with ❤️ for Home Bakers.
