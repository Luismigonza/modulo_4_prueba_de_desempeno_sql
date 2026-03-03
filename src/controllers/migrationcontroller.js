const fs = require('fs');
const csv = require('csv-parser');
const pool = require('../config/mysql');

exports.uploadMasterFile = async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No se subió archivo CSV' });

    const results = [];
    fs.createReadStream(req.file.path)
        .pipe(csv({ separator: ',', mapHeaders: ({ header }) => header.trim() }))
        .on('data', (data) => results.push(data))
        .on('end', async () => {
            try {
                for (let row of results) {
                    if (!row.transaction_id) continue; // Salta filas vacías

                    // 1. Inserción Idempotente (Evita duplicados con INSERT IGNORE)
                    await pool.query('INSERT IGNORE INTO customers (customer_name, customer_email, customer_address, customer_phone) VALUES (?, ?, ?, ?)', 
                        [row.customer_name, row.customer_email, row.customer_address, row.customer_phone]);
                    
                    await pool.query('INSERT IGNORE INTO suppliers (supplier_name, supplier_email) VALUES (?, ?)', 
                        [row.supplier_name, row.supplier_email]);
                    
                    await pool.query('INSERT IGNORE INTO categories (product_category) VALUES (?)', 
                        [row.product_category]);

                    // 2. Inserción de Productos (Relacionando con subconsultas)
                    await pool.query(`INSERT IGNORE INTO products (product_sku, product_name, unit_price, category_id, supplier_id) 
                        VALUES (?, ?, ?, (SELECT id FROM categories WHERE product_category = ?), (SELECT id FROM suppliers WHERE supplier_email = ?))`, 
                        [row.product_sku, row.product_name, row.unit_price, row.product_category, row.supplier_email]);

                    // 3. Inserción de Transacciones
                    await pool.query(`INSERT IGNORE INTO transactions (transaction_id, date, customer_id) 
                        VALUES (?, ?, (SELECT id FROM customers WHERE customer_email = ?))`, 
                        [row.transaction_id, row.date, row.customer_email]);

                    // 4. Inserción de Detalles
                    await pool.query('INSERT IGNORE INTO transaction_details (transaction_id, product_sku, quantity, total_line_value) VALUES (?, ?, ?, ?)', 
                        [row.transaction_id, row.product_sku, row.quantity, row.total_line_value]);
                }
                res.status(200).json({ message: 'Migración masiva completada con éxito. Idempotencia mantenida.' });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });
};
