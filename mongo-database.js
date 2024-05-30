const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true })

const LogConfig = mongoose.Schema({
    project_name: { type: String, required: true },
    env_name: { type: String, required: true },
    live_logs: { type: Boolean, required: true, default: false }
}, { timestamps: true, versionKey: false })

module.exports = mongoose.model('log-config', LogConfig)
