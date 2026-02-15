# 🧁 PantryPilot

PantryPilot is a full-stack SaaS application designed specifically for home bakers. It transforms the chaos of manual spreadsheets into a streamlined system for precision inventory tracking, dynamic recipe costing, and automated order management. 

**🌐 Live Demo:** [Experience PantryPilot Here](https://pantry-pilot-nine.vercel.app/)

## ✨ Key Features

* **Precision Inventory Tracking:** Manages ingredients and packaging in exact units (grams, kgs, liters, pieces, boxes). Tracks stock levels, expiry dates, and low-stock alerts.
* **Dynamic Recipe Costing:** Create recipes and calculate the exact "Cost of Goods Sold" (COGS) in real-time based on the current purchase price of underlying ingredients.
* **Smart Order Management:** Tracks orders through statuses (`PENDING`, `ONGOING`, `COMPLETED`). Features a robust transaction engine that automatically checks stock availability and securely deducts inventory only when an order begins.
* **AI Baking Assistant (Agentic AI):** Integrated with Google Gemini (1.5 Flash). The AI doesn't just answer baking queries—it can actively draft and create pending orders based on natural language requests.
* **WhatsApp Notifications:** Automatically sends order confirmation messages to customers.
* **Secure Multi-Tenant Architecture:** Fully authenticated system where every baker's data, inventory, and customer list are strictly isolated and secure.

## 🛠️ Tech Stack

This project uses a modern, high-performance "T3-style" architecture, organized as a Monorepo.

**Frontend (Client)**
* **Framework:** React + Vite (TypeScript)
* **Styling:** Tailwind CSS + Framer Motion
* **State Management:** Redux Toolkit + React Context
* **Forms & Validation:** Formik + Yup
* **Deployment:** Vercel

**Backend (Server)**
* **Environment:** Node.js + Express
* **Database:** PostgreSQL (Serverless via Neon.tech)
* **ORM:** Prisma
* **Authentication:** JSON Web Tokens (JWT)
* **AI Integration:** Google Generative AI SDK (Gemini)
* **Deployment:** Render.com

## 🚀 Getting Started (Local Development)

### Prerequisites
Before you begin, ensure you have the following installed on your machine:
* **Node.js** (v18 or higher recommended)
* **npm** or **yarn**
* A **PostgreSQL** database (Local instance or Cloud provider like Neon.tech)

### 1. Clone the Repository
```bash
git clone [https://github.com/yourusername/pantrypilot.git](https://github.com/yourusername/pantrypilot.git)
cd pantrypilot
