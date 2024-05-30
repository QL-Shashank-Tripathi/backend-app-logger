const MongoLogConfig = require('./mongo-database')

exports.findProject = async (project, env) => {
    return await MongoLogConfig.findOne({ project_name: project, env_name: env });
}

exports.addProject = async (project, env) => {
    return await MongoLogConfig.create({ project_name: project, env_name: env, live_logs: false });
}