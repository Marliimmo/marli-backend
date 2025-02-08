require("dotenv").config();
const S3 = require('aws-sdk/clients/s3');
const fs = require('fs');

const bucketName = process.env.AWS_S3_BUCKET_NAME;
const region = process.env.AWS_S3_REGION_AWS;
const accessKeyId = process.env.AWS_S3_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_S3_SECRET_ACCESS_KEY;

const s3 = new S3({
    region,
    accessKeyId,
    secretAccessKey
})


// enregistrement d'une key comme image dans aws s3
function uploadFile (file, repertoire, pseudoUser){
    if(repertoire !== undefined){
        const fileStream = fs.createReadStream(file.path);
    
        const uploadParams = {
            Bucket: `${bucketName}/${repertoire}`,
            Body: fileStream,
            Key: `${repertoire}_${pseudoUser}_${file.filename}`
        }
    
        return s3.upload(uploadParams).promise()
    }
    return
}
exports.uploadFile = uploadFile;


// telechargement l'image correspondate grace à la key
async function getFileStream(fileKey, repertoire) {
    if (repertoire !== undefined) {
        try {
            const downloadParams = {
                Key: fileKey,
                Bucket: `${bucketName}/${repertoire}`
            };

            await s3.headObject(downloadParams).promise();
            return s3.getObject(downloadParams).createReadStream();
        } catch (error) {
            // console.error('Erreur lors de la récupération du fichier :', error);
            return false;
        }
    }
    return false;
}
exports.getFileStream = getFileStream;


// suppression de l'image sur le cloud
async function deleteFile (fileKey, repertoire){
    if(repertoire !== undefined){
        const params = {
            Key: fileKey,
            Bucket: `${bucketName}/${repertoire}`
        }
        return s3.deleteObject(params).promise();
    }
    return
}
exports.deleteFile = deleteFile;