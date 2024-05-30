const MySqlLogConfig = require('./mysql-database');

exports.findProject = async (project, env) => {
    return await MySqlLogConfig.findOne({ project_name: project, env_name: env });
}

exports.addProject = async (project, env) => {
    return await MySqlLogConfig.create({ project_name: project, env_name: env, live_logs: false });
}