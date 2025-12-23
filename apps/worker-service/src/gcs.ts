import { Storage } from '@google-cloud/storage';


const storage = new Storage();
const bucket = storage.bucket(process.env.GCS_BUCKET!);


export async function uploadToGCS(key: string, data: any) {
    await bucket.file(key).save(JSON.stringify(data));
}