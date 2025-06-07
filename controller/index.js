const { ListObjectsV2Command, GetObjectCommand, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { client } = require('../utils')

exports.getPresignedUrl = async (req, res) => {
    const { fileName, contentType } = req.body;
    const command = new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: fileName,
        ContentType: contentType,
    });
    try {
        const url = await getSignedUrl(client, command, { expiresIn: 60 });
        return res.status(200).json({ url });
    }
    catch (err) {
        return res.status(500).json({ error: "Failed to generate presigned URL" });
    }
}

exports.listObjects = async (req, res) => {
    const { bucketName } = req.query;

    if (!bucketName) {
        return res.status(400).json({ error: "Missing bucketName in query" });
    }

    try {
        const command = new ListObjectsV2Command({ Bucket: bucketName });
        const response = await client.send(command);

        if (!response.Contents || response.Contents.length === 0) {
            return res.status(404).json({ message: "No objects found" });
        }

        const urls = await Promise.all(
            response.Contents.map(async (item) => {
                try {
                    const getObjectCommand = new GetObjectCommand({
                        Bucket: bucketName,
                        Key: item.Key,
                    });

                    const url = await getSignedUrl(client, getObjectCommand, {
                        expiresIn: 3600,
                    });
                    return { key: item.Key, url };
                } catch (err) {
                    console.error("Error generating presigned URL for", item.Key, err);
                    return { key: item.Key, url: null, error: true };
                }
            })
        );
        return res.status(200).json({ urls });
    } catch (error) {
        console.error("Error listing objects:", error);
        return res.status(500).json({ error: "Failed to list objects" });
    }
};