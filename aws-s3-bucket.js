const axios = require('axios');
const fs = require('fs');
const path = require('path');

// const apiUrl = 'http://127.0.0.1:3000/api/v1/project/';
const apiUrl = 'https://apis-logger.qkkalabs.com/api/v1/project/';

const project = process.env.LOG_PROJECT_NAME.replace(' ', '-').toLowerCase()
const env = process.env.LOG_PROJECT_ENV.toLowerCase();
const apiKey = process.env.LOG_PROJECT_API_KEY;


exports.UploadToAWSS3 = async (fileName, content, fileType) => {
    try {

        const dateMonthYear = `${new Date().getDate()}-${new Date().getMonth() + 1}-${new Date().getFullYear()}`
        const uri = apiUrl + 'upload/log'
        const headers = {
            'Authorization': `Bearer ${apiKey} ${project} ${env}`
        };
        axios.post(uri,
            {
                project: project,
                env: env,
                date: dateMonthYear,
                log_type: fileType,
                log_name: fileName,
                content: content
            },
            { headers }
        )
            .then(response => {

            })
            .catch(error => {
                console.error(`Fail to upload log ${fileType}/${fileName} due to reason : ${error.message}`)
            });

    } catch (error) {
        throw new Error(error)
    }
}



exports.ForceUploadLog = async (reqBody) => {
    try {

        const uri = apiUrl + 'force/upload/log'
        axios.post(uri, reqBody)
            .then(response => {
                StopForceUpdate();
            })
            .catch(error => {
                console.error(`Fail to upload log ${fileType}/${fileName} due to reason : ${error.message}`)
            });

    } catch (error) {
        throw new Error(error)
    }
}

exports.CheckForceUpdate = async () => {
    try {
        let force_update;
        const uri = apiUrl + `force-update?project=${project}&env=${env}`

        const response = await axios.get(uri);
        force_update = response.data.data.force_update;
        if (force_update) {
            await this.uploadAllPendingFile();
        }

    } catch (error) {
        console.error(`Failed to fetch force_update status due to reason: ${error.message}`);
    }
}

function StopForceUpdate() {
    try {
        const uri = apiUrl + `stop/force-update`

        axios.patch(uri, {
            project: project,
            env: env,
            status: false
        });

    } catch (error) {
        console.error(`Failed to stop force_update status due to reason: ${error.message}`);
    }
}


exports.uploadAllPendingFile = async () => {
    const localFolderPath = path.join(__dirname, `/../storage/logs/`)
    this.fetchPendingFiles(localFolderPath);
}

exports.fetchPendingFiles = async (localFolderPath) => {

    fs.readdir(localFolderPath, { withFileTypes: true }, async (err, files) => {
        if (err) return;
        else {
            if (files.length === 0) fs.rmdirSync(localFolderPath);
            else {
                files.forEach(async file => {
                    const filePath = path.join(localFolderPath, file.name);
                    if (file.isFile()) {
                        await this.upload(filePath);
                    } else if (file.isDirectory()) {
                        await this.fetchPendingFiles(filePath);
                    }
                })

            }
        }
    });
}


exports.upload = async (filePath) => {
    fs.readFile(filePath, async (err, data) => {
        if (err) return;
        const result = filePath.toString().split("\\");
        let length = result.length;
        let fileName = result[length - 1]
        let fileType = result[length - 2]
        let date = result[length - 3]

        const parms = {
            project: project,
            env: env,
            date: date,
            log_type: fileType,
            log_name: fileName,
            content: data.toString()
        }
        await this.ForceUploadLog(parms).then(() => {
            fs.access(filePath, fs.constants.F_OK, (err) => {
                if (err) return;

                fs.unlink(filePath, (err) => {
                    if (err) return;
                });
            });
        });

    })

}

