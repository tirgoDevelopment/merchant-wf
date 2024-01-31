// src/shared/aws-config.ts
const { S3Client } = require('@aws-sdk/client-s3');

const s3Client = new S3Client({
    region: 'ap-south-1', // Use the correct region code
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.SECRET_ACCESS_KEY,
    },
});
export const s3 = s3Client;
