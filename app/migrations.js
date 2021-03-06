const { DynamoDB } = require('aws-sdk');

const dynamoClient = new DynamoDB({
  region: 'us-east-2',
  endpoint: 'http://localhost:8000',
});

const args = {
  TableName: 'projects',
  KeySchema: [
    { AttributeName: 'id', KeyType: 'HASH' },
  ],
  AttributeDefinitions: [
    { AttributeName: 'id', AttributeType: 'S' },
    { AttributeName: 'ownerId', AttributeType: 'S' }
  ],
  ProvisionedThroughput: {
    ReadCapacityUnits: 5,
    WriteCapacityUnits: 5,
  },
  GlobalSecondaryIndexes: [
    {
      IndexName: 'ownerId-idx',
      KeySchema: [
        { AttributeName: 'ownerId', KeyType: 'HASH' },
      ],
      Projection: {
        NonKeyAttributes: ['title'],
        ProjectionType: 'INCLUDE'
      },
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5,
      },
    }
  ]
};

dynamoClient.createTable(args, function(err, data) {
  if (err) {
    console.error("Unable to create table. Error JSON:", JSON.stringify(err, null, 2));
  } else {
    console.log("Created table. Table description JSON:", JSON.stringify(data, null, 2));
  }
});
