import AWS from 'aws-sdk';


export const s3 = new AWS.S3({ region: 'ap-south-1' });


export async function uploadToS3(key: string, data: any) {
    await s3.putObject({
        Bucket: process.env.S3_BUCKET!,
        Key: key,
        Body: JSON.stringify(data),
        ContentType: 'application/json'
    }).promise();
}