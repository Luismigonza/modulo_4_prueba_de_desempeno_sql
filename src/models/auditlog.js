const mongoose = require('mongoose');

const auditSchema = new mongoose.Schema({
    action: { type: String, required: true }, 
    entity: { type: String, required: true },
    data: { type: Object, required: true },   
    timestamp: { type: Date, default: Date.now }
});

const AuditLog = mongoose.model('audit_logs', auditSchema);

// Universal function to record any action
const logAction = async (action, entity, data) => {
    try {
        await AuditLog.create({ action, entity, data });
    } catch (error) {
        console.error('Error guardando en MongoDB:', error);
    }
};

module.exports = { AuditLog, logAction };
