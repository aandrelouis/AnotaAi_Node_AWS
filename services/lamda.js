import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3"

const client = new S3Client({ region: "us-east-2" });

export const handler = async (event) => {
    try {
        //? possibilidade da fila acumular
        for (const record of event.Records) {
            const rowBody = JSON.parse(record.body);
            const body = JSON.parse(rowBody.Message)
            const ownerId = body.ownerId;

            try {
                //? busca do bucket
                var bucketName = "anotaai-catalog-louis"
                var filename = `${ownerId}-catalog.json`
                const catalog = await getS3Object(bucketName, filename);
                const catalogData = JSON.parse(catalog);

                //? Identifica o tipo de operação
                if (body.type == "product") {
                    updateOrAddItem(catalogData.products, body);
                }
                else if (body.type == "category") {
                    updateOrAddItem(catalogData.categories, body);
                }
                else if (body.type == "category_deleted") {
                    removeItem(catalogData.categories, body)
                } else if (body.type == "product_deleted") {
                    removeItem(catalogData.products, body)
                }
                //? salva os dados modificados
                await putS3Object(bucketName, filename, JSON.stringify(catalogData));
            } catch (error) {
                //? Primeira inicialização
                if (error.message === "Error getting object from bucket") {
                    const newCatalog = { products: [], categories: [] };
                    if (body.type == "product") {
                        newCatalog.products.push(body);
                    }
                    else {
                        newCatalog.categories.push(body);
                    }
                    await putS3Object(bucketName, filename, JSON.stringify(newCatalog))
                } else {
                    throw error
                }
            }
        }
        //? Finalizando
        return { status: "sucesso" };
    }
    catch (error) {
        console.log("Error", error)
        throw new Error("Erro ao processarr mensagem do SQS");
    }
};

const updateOrAddItem = (catalog, newItem) => {
    const index = catalog.findIndex((item) => item._id === newItem._id);
    if (index !== -1) {
        catalog[index] = { ...catalog[index], ...newItem }
    }
    else {
        catalog.push(newItem);
    }
};

const removeItem = (catalog, newItem) => {
    const index = catalog.findIndex((item) => item._id == newItem._id);
    try {
        if (index !== -1) {
            catalog.splice(index, 1);
        }
    } catch (error) {
        throw new Error("Erro ao deletar um item!");
    }
};

async function putS3Object(dstBucket, dstKey, content) {
    try {
        const putCommand = new PutObjectCommand({
            Bucket: dstBucket,
            Key: dstKey,
            Body: content,
            ContentType: "application/json"
        });

        const putResult = await client.send(putCommand);

        return putResult;

    } catch (error) {
        console.log(error);
        return;
    }
}

//? Recebe dados do S3 como stream
async function getS3Object(bucket, key) {
    const getCommand = new GetObjectCommand({
        Bucket: bucket,
        Key: key
    });

    try {
        const response = await client.send(getCommand);
        //?Lendo o stream e convertendo para String
        return streamToString(response.Body);
    }
    catch (error) {
        throw new Error('Error getting object from bucket');
    }
}

function streamToString(stream) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        stream.on('data', (chunk) => chunks.push(chunk));
        stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
        stream.on('error', reject);
    });
}