const AWS = require('../config/aws')

const sns = new AWS.SNS();
const topicArn = process.env.AWS_SNS_TOPIC_CATALOG_ARN;

const checkConnection = async () => {
    try {
        const data = await sns.listTopics().promise();
        console.log("Conexão com SNS bem sucedida. Tópicos existentes:", data.Topics)
    }
    catch (error) {
        console.log("Erro ao conectar com o sns:", error);
    }
};

const publishMessage = async (message) => {
    const params = {
        TopicArn: topicArn,
        Message: message
    };

    try {
        const data = await sns.publish(params).promise();
        console.log('MessageId:', data.MessageId);
    } catch (err) {
        console.error('Erro ao publicar mensagem:', err);
    }
};


module.exports = {
    checkConnection,
    publishMessage
};