const pool = require('../config/mysql');

exports.getSupplierAnalysis = async (req, res) => {
    try {
        const query = `
            SELECT s.supplier_name, SUM(td.quantity) as total_items_sold, SUM(td.total_line_value) as total_revenue
            FROM suppliers s
            JOIN products p ON s.id = p.supplier_id
            JOIN transaction_details td ON p.product_sku = td.product_sku
            GROUP BY s.id ORDER BY total_items_sold DESC
        `;
        const [rows] = await pool.query(query);
        res.json(rows);
    } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.getCustomerBehavior = async (req, res) => {
    const { customerId } = req.params;
    try {
        const query = `
            SELECT t.date, p.product_name, td.quantity, td.total_line_value
            FROM transactions t
            JOIN transaction_details td ON t.transaction_id = td.transaction_id
            JOIN products p ON td.product_sku = p.product_sku
            WHERE t.customer_id = ? ORDER BY t.date DESC
        `;
        const [rows] = await pool.query(query, [customerId]);
        res.json(rows);
    } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.getStarProducts = async (req, res) => {
    const { categoryId } = req.params;
    try {
        const query = `
            SELECT p.product_name, SUM(td.total_line_value) as revenue
            FROM products p
            JOIN transaction_details td ON p.product_sku = td.product_sku
            WHERE p.category_id = ?
            GROUP BY p.product_sku ORDER BY revenue DESC
        `;
        const [rows] = await pool.query(query, [categoryId]);
        res.json(rows);
    } catch (error) { res.status(500).json({ error: error.message }); }
};
