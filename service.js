exports.checkLiveLogStatus = async () => {
    const db_driver = process.env.DB_DRIVER.toLocaleLowerCase();
    const project = process.env.LOG_PROJECT_NAME.toLowerCase();
    const env = process.env.LOG_PROJECT_ENV.toLowerCase();

    if (db_driver === 'mongo') {
        const MongoService = require('./mongo-service');
        const result = await MongoService.findProject(project, env);
        if (result) {
            return result.live_logs;
        } else {
            await MongoService.addProject(project, env)
            return false;
        }
    }

    if (db_driver === 'mysql') {
        const MySqlService = require('./mysql-service');
        const result = await MySqlService.findProject(project, env)
        if (result) {
            return result.live_logs;
        } else {
            await MySqlService.addProject(project, env);
            return false;
        }
    }

}