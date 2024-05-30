const Sequelize = require('sequelize');
const Model = Sequelize.Model

const sequelize = new Sequelize(`${process.env.DB_DATABASE}`, `${process.env.DB_USER}`, `${process.env.DB_PASSWORD}`, {
    dialect: 'mysql',
    host: `${process.env.DB_HOST}`,
    logging: false
});

class LogConfig extends Model { }

LogConfig.init(
    {
        project_name: { type: Sequelize.TEXT, required: true },
        env_name: { type: Sequelize.TEXT, required: true },
        live_logs: { type: Sequelize.BOOLEAN, required: true, defaultValue: false }
    },
    {
        sequelize,
        underscored: true,
        modelName: 'logconfig',
        tableName: 'log_config',
        timestamps: true
    }
).sync();

module.exports = LogConfig
