import dotenv from 'dotenv';
import AWS from 'aws-sdk';
import { Storage } from '@google-cloud/storage';

// Load .env from project root
dotenv.config({ path: '../../.env' });

const s3 = new AWS.S3({
    region: process.env.AWS_REGION || 'ap-southeast-2'
});

const gcs = new Storage();

export async function uploadToCloud(city: string, data: any) {
    const key = `weather/${city}-${Date.now()}.json`;
    const body = JSON.stringify(data);

    console.log(`📤 Uploading to S3: ${key}`);
    console.log(`📦 Data size: ${body.length} bytes`);

    try {
        // S3 Upload
        const result = await s3.putObject({
            Bucket: process.env.AWS_S3_BUCKET!,
            Key: key,
            Body: body,
            ContentType: 'application/json'
        }).promise();

        console.log(`✅ S3 Upload successful!`);
        console.log(`   Bucket: ${process.env.AWS_S3_BUCKET}`);
        console.log(`   Key: ${key}`);
        console.log(`   ETag: ${result.ETag}`);
        console.log(`   URL: https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION || 'ap-southeast-2'}.amazonaws.com/${key}`);

        return {
            success: true,
            bucket: process.env.AWS_S3_BUCKET,
            key,
            etag: result.ETag,
            url: `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION || 'ap-southeast-2'}.amazonaws.com/${key}`
        };
    } catch (error: any) {
        console.error(`❌ S3 Upload failed:`, error.message);
        console.error(`   Bucket: ${process.env.AWS_S3_BUCKET}`);
        console.error(`   Key: ${key}`);
        console.error(`   Error Code: ${error.code}`);
        throw error;
    }

    // GCS (uncomment when ready)
    // try {
    //     const bucket = gcs.bucket(process.env.GCS_BUCKET!);
    //     await bucket.file(key).save(body);
    //     console.log(`✅ GCS Upload successful: ${key}`);
    // } catch (error: any) {
    //     console.error(`❌ GCS Upload failed:`, error.message);
    // }
}
