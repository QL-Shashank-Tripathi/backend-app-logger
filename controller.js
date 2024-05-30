require('dotenv').config();
const fs = require('fs')
const path = require('path')
const { UploadToAWSS3 } = require('./aws-s3-bucket.js')
const { checkLiveLogStatus } = require('./service.js')
exports.Logger = async (request, response, next) => {
    try {
        const dateMonthYear = `${new Date().getDate()}-${new Date().getMonth() + 1}-${new Date().getFullYear()}`
        const userLogDir = path.join(__dirname, `../../storage/logs/${dateMonthYear}/user`)
        const openLogDir = path.join(__dirname, `../../storage/logs/${dateMonthYear}/open`)
        let logDir = '';
        let fileName = '';
        let fileType = '';
        if (!request.user)
            fileName = 'open.log', logDir = openLogDir, fileType = 'open'
        else
            fileName = `${request.user.userId}.log`, logDir = userLogDir, fileType = 'user'

        let content = '============================Request===============================================\r\n'
        content += `${request.originalUrl}\r\n`
        content += `${new Date()}\r\n`
        content += 'Headers\r\n'
        content += `${JSON.stringify(request.headers)}\r\n`
        content += 'Body\r\n'
        content += `${JSON.stringify(request.body)}\r\n`
        content += '==================================================================================\r\n'
        const liveLog = await checkLiveLogStatus();
        if (liveLog) {
            await UploadToAWSS3(fileName, content, fileType);
        }
        this.writeLog(logDir, fileName, content)
        next()
    }
    catch (error) {
        console.log(error);
    }
}

exports.CustomLog = async (fileName, content) => {
    try {
        const dateMonthYear = `${new Date().getDate()}-${new Date().getMonth() + 1}-${new Date().getFullYear()}`
        const logDir = path.join(__dirname, `../../storage/logs/${dateMonthYear}/custom`)
        const liveLog = await checkLiveLogStatus();
        if (liveLog) {
            await UploadToAWSS3(fileName, content, 'custom');
        }
        this.writeLog(logDir, fileName, content)
    }
    catch (error) {
        throw new Error(error)
    }
}

exports.ErrorLog = async (request, error) => {
    try {
        const dateMonthYear = `${new Date().getDate()}-${new Date().getMonth() + 1}-${new Date().getFullYear()}`
        const logDir = path.join(__dirname, `../../storage/logs/${dateMonthYear}/error`)

        let content = '============================Request===============================================\r\n'
        content += `${request.originalUrl}\r\n`
        content += `${new Date()}\r\n`
        content += 'Headers\r\n'
        content += `${JSON.stringify(request.headers)}\r\n`
        content += 'Body\r\n'
        content += `${JSON.stringify(request.body)}\r\n`
        content += `${error.stack}\r\n`
        content += '==================================================================================\r\n'
        const liveLog = await checkLiveLogStatus();
        if (liveLog) {
            await UploadToAWSS3('error.log', content, 'error');
        }
        this.writeLog(logDir, 'error.log', content)
    }
    catch (error) {
        throw new Error(error)
    }
}

exports.writeLog = (logDir, fileName, content) => {
    if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true })
    }
    fs.appendFile(`${logDir}/${fileName}`, content, err => { if (err) { throw new Error(err) } });
}
