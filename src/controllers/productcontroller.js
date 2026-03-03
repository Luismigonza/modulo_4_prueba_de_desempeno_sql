const pool = require('../config/mysql');
const { logDelete } = require('../models/auditlog');

exports.getAllProducts = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM products');
        res.json(rows);
    } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.deleteProduct = async (req, res) => {
    const { sku } = req.params;
    try {
        // 1. Buscar la información antes de borrarla
        const [product] = await pool.query('SELECT * FROM products WHERE product_sku = ?', [sku]);
        if (product.length === 0) return res.status(404).json({ message: 'Producto no encontrado' });

        // 2. Eliminar dependencias primero (Para no violar Foreign Keys)
        await pool.query('DELETE FROM transaction_details WHERE product_sku = ?', [sku]);
        
        // 3. Borrar el producto
        await pool.query('DELETE FROM products WHERE product_sku = ?', [sku]);

        // 4. Guardar Log en MongoDB (Requisito de la prueba)
        await logDelete('products', product[0]);

        res.json({ message: 'Producto eliminado en MySQL y registrado en MongoDB' });
    } catch (error) { res.status(500).json({ error: error.message }); }
};
