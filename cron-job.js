const cron = require('node-cron');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const apiUrl = 'https://apis-logger.qkkalabs.com/api/v1/project/';


const localFolderPath = path.join(__dirname, `../../storage/logs/`)
const project = process.env.LOG_PROJECT_NAME.replace(' ', '-').toLowerCase()
const env = process.env.LOG_PROJECT_ENV.toLowerCase();
const apiKey = process.env.LOG_PROJECT_API_KEY;

module.exports.CronJob = () => {
    // cron.schedule("*/10 * * * * *", function () {
        cron.schedule("0 2 * * *", function () {
        try {
            uploadFolderToS3(localFolderPath);
        }
        catch (e) {
            console.log(e);
        }
    });
}


function uploadFolderToS3(localFolderPath, s3FolderPath) {

    fs.readdir(localFolderPath, { withFileTypes: true }, (err, files) => {
        if (err) return;
        else {
            if (files.length === 0) fs.rmdirSync(localFolderPath);
            else {
                files.forEach(file => {
                    const filePath = path.join(localFolderPath, file.name);
                    if (file.isFile())
                        uploadFileToS3(filePath);
                    else if (file.isDirectory()) {
                        const currentDateFormatted = `${new Date().getDate()}-${new Date().getMonth() + 1}-${new Date().getFullYear()}`
                        const currentDateFolderPath = path.join(localFolderPath, currentDateFormatted);
                        if (filePath !== currentDateFolderPath)
                            uploadFolderToS3(filePath);
                    }
                });
            }
        }
    });
}


function uploadFileToS3(filePath) {

    fs.readFile(filePath, (err, data) => {
        if (err) return;

        const defaultpattern = /(\d{1,2}-\d{1,2}-\d{4})\/(\w+)\/(\w+\.log)/;
        let matches = filePath.match(defaultpattern);

        if (!matches) {
            const pattern = /(\d{1,2}-\d{1,2}-\d{4})\\(\w+)\\(\w+\.log)/;
            matches = filePath.match(pattern);
        }


        if (matches) {
            const date = matches[1];
            const fileType = matches[2];
            const fileName = matches[3];

            const uri = apiUrl + 'cron/upload/log'
            const headers = {
                'Authorization': `Bearer ${apiKey} ${project} ${env}`
            };

            axios
                .post(uri,
                    {
                        project: project,
                        env: env,
                        date: date,
                        log_type: fileType,
                        log_name: fileName,
                        content: data.toString()
                    },
                    {
                        headers
                    }
                )
                .then(response => {
                    fs.access(filePath, fs.constants.F_OK, (err) => {
                        if (err) return;

                        fs.unlink(filePath, (err) => {
                            if (err) return;
                        });
                    });

                })
                .catch(error => {
                    console.error(`Fail to upload log ${fileType}/${fileName} due to reason : ${error.message}`)
                });

        } else {
            console.log('Pattern not found in the path.');
        }


    });
}

