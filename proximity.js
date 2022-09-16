
const AWS = require('aws-sdk');
// Set the region 
AWS.config.update({region: 'us-east-1'});

// Create the DynamoDB service object
const ddb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

exports.default = async() => {
    const storeids = [0,1,2,3];
    
    const storePromises = storeids.map(async store => {
        const params = {
          TableName: 'store-data',
          Key: {
            'pk0': {S: `store-${store}`},
            'sk0': {S: 'location'}
          },
        };
        // Call DynamoDB to read the item from the table
        const result = await ddb.getItem(params).promise();
        console.log('here', result.Item.value.S);
        return result.Item.value.S;
    })
    
    const stores = await Promise.all(storePromises);
    return `There are four stores near you. They are located at ${stores.join('. ')}`
}