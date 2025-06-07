require('dotenv').config();
const { ECSClient, RunTaskCommand } = require('@aws-sdk/client-ecs');
const { S3Client } = require('@aws-sdk/client-s3');
const { SQSClient, ReceiveMessageCommand, DeleteMessageCommand } = require('@aws-sdk/client-sqs');

const client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

const sqsClient = new SQSClient({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

const ecsClient = new ECSClient({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

let io = null;

function setSocketIO(ioInstance) {
    io = ioInstance;
}

async function init() {
    try {
        const command = new ReceiveMessageCommand({
            QueueUrl: process.env.AWS_SQS_URL,
            MaxNumberOfMessages: 1,
            WaitTimeSeconds: 10, // Long polling
            VisibilityTimeout: 30 // Message visibility timeout
        });
        while (true) {
            const response = await sqsClient.send(command);
            if (response.Messages && response.Messages.length > 0) {
                let ecsStarted = false;
                for (const message of response.Messages) {
                    //validate the event
                    const event = JSON.parse(message.Body);
                    if ("Service" in event && "Event" in event) {
                        if (event.Event === "s3.TestEvent") {  // skip test events
                            await sqsClient.send(new DeleteMessageCommand({
                                QueueUrl: process.env.AWS_SQS_URL,
                                ReceiptHandle: message.ReceiptHandle
                            }));
                            continue;
                        }
                    }
                    //trigger or some how let the frontend know that the video transcoding is started
                    for (const record of event.Records) {
                        if (record.s3 && record.s3.object && record.s3.object.key) {
                            const key = record.s3.object.key;
                            const bucket = record.s3.bucket.name;
                            console.log(`Processing S3 event for bucket: ${bucket}, key: ${key}`);
                            // spin docker container
                            const runTaskCommand = new RunTaskCommand({
                                cluster: "arn:aws:ecs:ap-south-1:880422432219:cluster/alert-wolf-elqy5k",
                                taskDefinition: 'arn:aws:ecs:ap-south-1:880422432219:task-definition/video_transcoding',
                                launchType: 'FARGATE',
                                networkConfiguration: {
                                    awsvpcConfiguration: {
                                        subnets: ['subnet-00401f4a03a559f5e', 'subnet-0468b1b6caef7732d', 'subnet-09bd85cabaffc6f98'],
                                        assignPublicIp: 'ENABLED',
                                        securityGroups: ['sg-0d8e4c1a2cc1c3aa3']
                                    }
                                },
                                overrides: {
                                    containerOverrides: [
                                        {
                                            name: 'video_transcoding', // Replace with your container name
                                            command: ['node', 'server.js'], // Command to run in the container
                                            environment: [
                                                { name: 'BUCKET', value: bucket },
                                                { name: 'KEY', value: key }
                                            ]
                                        }
                                    ]
                                }
                            });
                            try {
                                await ecsClient.send(runTaskCommand);
                                ecsStarted = true;
                                console.log(`Started ECS task for video transcoding: ${key} in bucket ${bucket}`);
                            } catch (err) {
                                console.error("ECS Error:", err);
                                if (err.$response) {
                                    console.error("AWS response:", err.$response);
                                }
                            }
                        } else {
                            console.error('Invalid S3 event record:', record);
                        }
                    }
                    //trigger or some how let the frontend know that the video transcoding is completed
                    if (ecsStarted && io) {
                        console.log('Emitting transcoding-completed event');
                        io.emit('transcoding-completed',{bucketName:process.env.AWS_PRD_BUCKET});
                    }
                    if (ecsStarted) {
                        await sqsClient.send(new DeleteMessageCommand({
                            QueueUrl: process.env.AWS_SQS_URL,
                            ReceiptHandle: message.ReceiptHandle
                        }));
                    } else {
                        console.warn('Skipping message deletion since ECS task did not start');
                    }
                }
            } else {
                console.log('No messages received, waiting...');
            }
            await new Promise(resolve => setTimeout(resolve, 5000)); // 5 seconds delay
        }
    }
    catch (error) {
        console.error('Error receiving messages:', error);
    }
}

module.exports = { client, init, setSocketIO };