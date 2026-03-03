const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectMongo = require('./config/mongo');
const migrationRoutes = require('./routes/migrationroutes');
const productRoutes = require('./routes/productroutes');
const biRoutes = require('./routes/biroutes');

const app = express();
app.use(cors());
app.use(express.json());

connectMongo(); // Connect to MongoDB

app.use('/api/migration', migrationRoutes);
app.use('/api/products', productRoutes);
app.use('/api/bi', biRoutes);

app.use((req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor MegaStore corriendo en http://localhost:${PORT}`);
});
