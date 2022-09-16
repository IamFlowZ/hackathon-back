
const AWS = require('aws-sdk');
// Set the region 
AWS.config.update({region: 'us-east-1'});

// Create the DynamoDB service object
const ddb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

const params = {
  TableName: 'store-data',
  Key: {
    'pk0': {S: 'store-0'},
    'sk0': {S: 'serviceTimes'}
  },
};

exports.default = async ({item, waitType}) => {
    const result = await ddb.getItem(params).promise();
    console.log('here', result.Item.value, waitType);
    
    const waitTypeTodbType = {
        drivethrough: 'drive',
        'drive through': 'drive',
        drive: 'drive',
        walkin: 'walkIn',
        'walk in': 'walkIn',
        'walk': 'walkIn',
        'in': 'walkIn',
        delivery: 'delivery'
    };
    
    const waitTime = result.Item.value.M[waitTypeTodbType[waitType.toLowerCase()]].N;
    console.log(waitTime);
    return `For ${item} via ${waitType}. your expected wait time is ${waitTime} minutes.`
}