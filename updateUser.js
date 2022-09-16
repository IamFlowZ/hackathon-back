const AWS = require('aws-sdk');
const ddb = new AWS.DynamoDB.DocumentClient({region: 'us-east-1'});

async function getAllLocations() {
    const params = {
        TableName: 'store-data',
    };
    let lastEvaluatedKey = 'dummy'; // string must not be empty
    const itemsAll = [];
    while (lastEvaluatedKey) {
        const data = await ddb.scan(params).promise();
        itemsAll.push(...data.Items);
        lastEvaluatedKey = data.LastEvaluatedKey;
        if (lastEvaluatedKey) {
          params.ExclusiveStartKey = lastEvaluatedKey;
        }
      }
      return itemsAll.filter(item => item.sk0 === 'location').map(loc => ({value: loc.value, id: loc.pk0}));
}

exports.default = async({ Location }) => {
    const locations = await getAllLocations();
    console.log('locations', locations);
    
    let content = '';
    const validLocation = locations.find(loc => loc.value.toUpperCase().match(Location.toUpperCase()));
    if (validLocation) {
        const updateParams = {
            TableName: 'user',
            Item: {
                user: 'demo-user',
                store: validLocation.id
            }
        };
        await ddb.put(updateParams).promise();
        content = 'Ok! I have updated your preference';
    }
    else content = 'Unable to find that store!';
    
    return content;
}
