const pool = require('../config/mysql');
const { logAction } = require('../models/auditlog'); // <-- Importamos la nueva función

exports.getAllProducts = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM products');
        res.json(rows);
    } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.createProduct = async (req, res) => {
    const { product_sku, product_name, unit_price, category_id, supplier_id } = req.body;
    try {
        await pool.query(
            'INSERT INTO products (product_sku, product_name, unit_price, category_id, supplier_id) VALUES (?, ?, ?, ?, ?)',
            [product_sku, product_name, unit_price, category_id, supplier_id]
        );
        
        // AUDITORÍA MONGODB: Registro de Creación
        await logAction('CREATE', 'products', req.body);

        res.status(201).json({ message: 'Producto creado exitosamente y auditado' });
    } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.updateProduct = async (req, res) => {
    const { sku } = req.params;
    const { product_name, unit_price, category_id, supplier_id } = req.body;
    try {
        const [result] = await pool.query(
            'UPDATE products SET product_name = ?, unit_price = ?, category_id = ?, supplier_id = ? WHERE product_sku = ?',
            [product_name, unit_price, category_id, supplier_id, sku]
        );
        
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Producto no encontrado' });
        
        // AUDITORÍA MONGODB: Registro de Actualización
        await logAction('UPDATE', 'products', { sku, ...req.body });

        res.json({ message: 'Producto actualizado exitosamente y auditado' });
    } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.deleteProduct = async (req, res) => {
    const { sku } = req.params;
    try {
        const [product] = await pool.query('SELECT * FROM products WHERE product_sku = ?', [sku]);
        if (product.length === 0) return res.status(404).json({ message: 'Producto no encontrado' });

        await pool.query('DELETE FROM transaction_details WHERE product_sku = ?', [sku]);
        await pool.query('DELETE FROM products WHERE product_sku = ?', [sku]);

        // AUDITORÍA MONGODB: Registro de Borrado
        await logAction('DELETE', 'products', product[0]);

        res.json({ message: 'Producto eliminado en MySQL y registrado en MongoDB' });
    } catch (error) { res.status(500).json({ error: error.message }); }
};
