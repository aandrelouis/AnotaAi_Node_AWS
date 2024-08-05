require('dotenv').config();
const AWS = require("aws-sdk")

const { AWS_ACCESSKEYID, AWS_SECRETKEY, AWS_REGION } = process.env;

if (!AWS_ACCESSKEYID || !AWS_SECRETKEY || !AWS_REGION) {
    throw new Error("AWS configuration error: Missing required environment variables.");
}

AWS.config.update({
    accessKeyId: AWS_ACCESSKEYID,
    secretAccessKey: AWS_SECRETKEY,
    region: AWS_REGION
})

module.exports = AWS;