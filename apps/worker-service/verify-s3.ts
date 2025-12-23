import AWS from 'aws-sdk';
import 'dotenv/config';

const s3 = new AWS.S3({
    region: process.env.AWS_REGION || 'ap-southeast-2'
});

/**
 * List all files in the weather folder
 */
async function listWeatherFiles() {
    try {
        const result = await s3.listObjectsV2({
            Bucket: process.env.AWS_S3_BUCKET!,
            Prefix: 'weather/'
        }).promise();

        console.log(`\n📂 Files in bucket: ${process.env.AWS_S3_BUCKET}`);
        console.log(`   Prefix: weather/`);
        console.log(`   Total files: ${result.KeyCount}\n`);

        if (result.Contents && result.Contents.length > 0) {
            result.Contents.forEach((file, index) => {
                console.log(`${index + 1}. ${file.Key}`);
                console.log(`   Size: ${file.Size} bytes`);
                console.log(`   Last Modified: ${file.LastModified}`);
                console.log(`   ETag: ${file.ETag}\n`);
            });
        } else {
            console.log('   No files found.\n');
        }
    } catch (error: any) {
        console.error('❌ Error listing files:', error.message);
    }
}

/**
 * Get a specific file from S3
 */
async function getFile(key: string) {
    try {
        const result = await s3.getObject({
            Bucket: process.env.AWS_S3_BUCKET!,
            Key: key
        }).promise();

        console.log(`\n📄 File: ${key}`);
        console.log(`   Content Type: ${result.ContentType}`);
        console.log(`   Size: ${result.ContentLength} bytes`);
        console.log(`   Last Modified: ${result.LastModified}`);
        console.log(`   ETag: ${result.ETag}\n`);
        console.log('Content:');
        console.log(result.Body?.toString());
    } catch (error: any) {
        console.error(`❌ Error getting file ${key}:`, error.message);
    }
}

/**
 * Check if a file exists
 */
async function fileExists(key: string): Promise<boolean> {
    try {
        await s3.headObject({
            Bucket: process.env.AWS_S3_BUCKET!,
            Key: key
        }).promise();

        console.log(`✅ File exists: ${key}`);
        return true;
    } catch (error: any) {
        if (error.code === 'NotFound') {
            console.log(`❌ File not found: ${key}`);
            return false;
        }
        console.error(`❌ Error checking file:`, error.message);
        return false;
    }
}

// Run the script
const command = process.argv[2];
const arg = process.argv[3];

if (command === 'list') {
    listWeatherFiles();
} else if (command === 'get' && arg) {
    getFile(arg);
} else if (command === 'exists' && arg) {
    fileExists(arg);
} else {
    console.log(`
Usage:
  tsx verify-s3.ts list                    # List all weather files
  tsx verify-s3.ts get <key>               # Get a specific file
  tsx verify-s3.ts exists <key>            # Check if file exists

Examples:
  tsx verify-s3.ts list
  tsx verify-s3.ts get weather/London-1234567890.json
  tsx verify-s3.ts exists weather/London-1234567890.json
    `);
}
