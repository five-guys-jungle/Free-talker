import AWS from "aws-sdk";
import dotenv from "dotenv";
dotenv.config({ path: __dirname + "/../.env" });

const tableName = process.env.DYNAMODB_TABLE_NAME;

const key = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: "ap-northeast-2",
};

// console.log(key);

AWS.config.update(key);

const dynamoDB = new AWS.DynamoDB.DocumentClient();

const put: AWS.DynamoDB.DocumentClient.PutItemInput = {
    TableName: tableName,
    Item: {
        userId: "userId001",
        userPw: "userPw001",
    },
};

dynamoDB.put(put, (error, data) => {
    if (error) {
        console.log(error);
    } else {
        console.log(data);
    }
});
