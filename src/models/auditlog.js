const mongoose = require('mongoose');

// Schema Validation exigida por la prueba
const auditSchema = new mongoose.Schema({
    action: { type: String, required: true },
    entity: { type: String, required: true },
    deleted_data: { type: Object, required: true },
    timestamp: { type: Date, default: Date.now }
});

const AuditLog = mongoose.model('audit_logs', auditSchema);

const logDelete = async (entity, deleted_data) => {
    try {
        await AuditLog.create({ action: 'DELETE', entity, deleted_data });
    } catch (error) {
        console.error('Error guardando en MongoDB:', error);
    }
};

module.exports = { AuditLog, logDelete };
