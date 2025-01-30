# **Domain Price Comparator**

This repository contains both the **frontend** and **backend** components for a domain price comparator tool. The app allows users to search and compare domain prices from different providers such as Namecheap and Register365.

---

## **Repository Structure**

\```
domain-price-comparator/
├── domain-compare-frontend/          # React frontend application
├── domain-compare-backend/           # Express and Puppeteer backend server
└── README.md          # This file
\```

---

## **Frontend**

### **Overview**
The frontend is built using **React** and **Tailwind CSS**. It provides a user interface for inputting domain names and extensions, displaying prices fetched from the backend.

### **Features**
- Domain search with `.com`, `.net`, `.org`, `.io` extensions.
- Price comparison between providers.
- Responsive design with a search bar, results list, and error handling.

### **Installation and Setup**
1. Navigate to the `frontend` directory:
   \```
   cd frontend
   \```
2. Install dependencies:
   \```
   npm install
   \```
3. Start the development server:
   \```
   npm start
   \```
4. The frontend should now be available at `http://localhost:3000`.

### **Frontend Environment Variables**
Create a `.env` file in the `frontend` directory to configure the backend API endpoint (optional):
\```
REACT_APP_BACKEND_URL=http://localhost:5000
\```

---

## **Backend**

### **Overview**
The backend is an **Express** server that uses **Puppeteer** to scrape domain prices from providers. It exposes a REST API endpoint (`/compare`) to handle domain price requests.

### **Features**
- Scrapes domain prices from **Namecheap** and **Register365**.
- RESTful API for communicating with the frontend.
- Supports desktop view emulation to ensure scraping reliability.

### **Installation and Setup**
1. Navigate to the `backend` directory:
   \```
   cd backend
   \```
2. Install dependencies:
   \```
   npm install
   \```
3. Start the server:
   \```
   npm start
   \```
4. The backend should now be available at `http://localhost:5000`.

---

## **API Documentation**

### **Endpoint:** `/compare`
#### **Method:** `GET`

#### **Query Parameters:**
- `domain` (string) - The domain name to check (e.g., `example`).
- `extension` (string) - The domain extension (e.g., `com`, `net`, `org`).

#### **Response:**
\```
{
  "namecheap": "€10.85/yr",
  "register365": "€4.99"
}
\```

#### **Example Request:**
\```
GET http://localhost:5000/compare?domain=example&extension=com
\```
---

## **License**
This project is licensed under the MIT License.
