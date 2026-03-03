# MegaStore Global - Legacy to Modern API Migration

## Introduction
This project represents the modernization of a legacy flat-file system (Excel) into a robust, scalable, and fully normalized RESTful API for MegaStore Global. It uses a polyglot persistence architecture combining MySQL (Relational) and MongoDB (NoSQL).

## Architecture & Model Justification

### Why SQL vs NoSQL?
* **MySQL (Relational Database):** Used for the core transactional data. The legacy file was highly redundant. By applying the First, Second, and Third Normal Forms (1NF, 2NF, 3NF), the data was decomposed into 6 related tables (`customers`, `suppliers`, `categories`, `products`, `transactions`, `transaction_details`). This strict schema enforces ACID properties, guarantees data integrity via Foreign Keys, and allows complex analytical queries (JOINs) requested by the Business Intelligence team.
* **MongoDB (NoSQL):** Used exclusively for the Audit Logging system. Because audit logs require high write-throughput and flexibility (the schema of a deleted item might vary), embedding the deleted objects as JSON documents within a NoSQL collection provides maximum efficiency. We used Mongoose **Schema Validation** to ensure every log contains an action type, entity name, and timestamp.

### Data Migration & Idempotency
The system ingests the raw, disorganized CSV file through a single endpoint. It acts as an ETL (Extract, Transform, Load) pipeline. To ensure **Idempotency** (preventing duplicate master records like customers or suppliers), the SQL schema uses `UNIQUE` constraints (e.g., `customer_email`), and the Node.js controller utilizes `INSERT IGNORE` statements alongside SQL subqueries to distribute the data cleanly across the 6 normalized tables.

## How to Run Locally

1. **Clone the repository and install dependencies:**
   ```
   npm install
   ```

2. **Start the database infrastructure:**
```    
docker-compose up -d
```

3. **Initialize the SQL Schema:** Connect to MySQL (`localhost:3307`, User: `root`, Pass: `rootpassword`) using a client like DBeaver and execute the script located in `docs/database.sql`.

4. **Environment Variables:** Ensure you have a `.env` file in the root directory with `PORT`, `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, and `MONGO_URI`.

5. **Start the API server:**
```
npm run dev
```
## API Endpoints


1. Mass Migration
    * **POST** `/api/migration`
    * **Body:** `multipart/form-data` (Key: `file`, Value: your raw `.csv` file).
    * **Action:** Reads the legacy file and distributes the data automatically into the normalized schema without duplicating customers or suppliers.

2. **Product Management (CRUD & Audit)**
    * **GET** `/api/products` - Retrieves the normalized catalog of products.
    * **DELETE** `/api/products/:sku` - Deletes a product from MySQL and **triggers a NoSQL audit log** in MongoDB saving the deleted entity's data.

3. Business Intelligence (BI)
    * **GET** `/api/bi/suppliers` - Returns top suppliers ordered by item volume and calculates total inventory value.
    * **GET** `/api/bi/customers/:customerId/history` - Returns the detailed purchase history for a specific customer.
    * **GET** `/api/bi/categories/:categoryId/stars` - Identifies top-selling products within a specific category based on total revenue generated.
