const mongoose = require('mongoose');

const auditSchema = new mongoose.Schema({
    action: { type: String, required: true }, // Aquí diremos si fue CREATE, UPDATE o DELETE
    entity: { type: String, required: true },
    data: { type: Object, required: true },   // Cambiamos "deleted_data" por solo "data"
    timestamp: { type: Date, default: Date.now }
});

const AuditLog = mongoose.model('audit_logs', auditSchema);

// Función universal para registrar cualquier acción
const logAction = async (action, entity, data) => {
    try {
        await AuditLog.create({ action, entity, data });
    } catch (error) {
        console.error('Error guardando en MongoDB:', error);
    }
};

module.exports = { AuditLog, logAction };
