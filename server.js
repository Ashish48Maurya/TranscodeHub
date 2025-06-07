const fs = require('fs');
const fsp = require('fs/promises')
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const { S3Client, GetObjectCommand, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');

const client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});


const RESOLUTIONS = [
    { width: 640, height: 360, label: '360p' },
    { width: 854, height: 480, label: '480p' },
    { width: 1280, height: 720, label: '720p' }
];

async function uploadWithRetry(putCommand, maxRetries = 5) {
    let attempt = 0;
    while (attempt <= maxRetries) {
        try {
            await client.send(putCommand);
            return;
        } catch (error) {
            if (error.Code === 'SlowDown') {
                attempt++;
                const delay = 500 * 2 ** attempt; // exponential backoff: 1s, 2s, 4s, 8s, ...
                console.warn(`SlowDown error detected. Retrying upload in ${delay}ms (attempt ${attempt})`);
                await new Promise(res => setTimeout(res, delay));
            } else {
                throw error;
            }
        }
    }
    throw new Error('Max retries reached for upload');
}


async function init() {
    const bucket = process.env.BUCKET;
    const key = process.env.KEY;

    const command = new GetObjectCommand({
        Bucket: bucket,
        Key: key
    });

    try {
        const data = await client.send(command);
        console.log(`Successfully retrieved object ${key} from bucket ${bucket}`);

        const originalFilePath = `/tmp/${key}`;
        await fsp.writeFile(originalFilePath, data.Body);
        const originalVideoPath = path.resolve(originalFilePath);
        console.log(`File saved to ${originalVideoPath}`);

        for (const resolution of RESOLUTIONS) {
            const outputFilePath = path.resolve(`/tmp/${resolution.label}-${key}`);
            console.log(`Transcoding to ${resolution.label} at ${outputFilePath}`);

            await new Promise((resolve, reject) => {
                ffmpeg(originalVideoPath)
                    .output(outputFilePath)
                    .withVideoCodec('libx264')
                    .withAudioCodec('aac')
                    .withSize(`${resolution.width}x${resolution.height}`)
                    .format('mp4')
                    .on('start', (commandLine) => {
                        console.log(`Started transcoding to ${resolution.label} with command: ${commandLine}`);
                    })
                    .on('end', () => {
                        console.log(`Transcoding to ${resolution.label} completed.`);
                        resolve();
                    })
                    .on('error', (err) => {
                        console.error(`Error during transcoding to ${resolution.label}:`, err);
                        reject(err);
                    })
                    .run();
            });

            const putCommand = new PutObjectCommand({
                Bucket: process.env.AWS_PRD_BUCKET,
                Key: `${resolution.label}-${key}`,
                Body: fs.createReadStream(outputFilePath),
            });

            await uploadWithRetry(putCommand);

            console.log(`Uploaded transcoded file to ProductionBucket: ${resolution.label}-${key}`);

            await new Promise(res => setTimeout(res, 1000));
        }

        try {
            await client.send(new DeleteObjectCommand({
                Bucket: bucket,
                Key: key
            }));
            console.log(`Deleted original file ${key} from bucket ${bucket}`);
        } catch (err) {
            console.error(`Failed to delete original file ${key} from bucket ${bucket}:`, err);
        }
        console.log('Processing complete. Exiting.');
        process.exit(0);
    } catch (error) {
        console.error(`Error processing ${key} from bucket ${bucket}:`, error);
    }
}


init().catch((error) => {
    console.error('Error in initialization:', error);
    process.exit(1);
});