
const AWS = require('aws-sdk');
// Set the region 
AWS.config.update({region: 'us-east-1'});

// Create the DynamoDB service object
const ddb = new AWS.DynamoDB.DocumentClient({apiVersion: '2012-08-10'});

exports.default = async ({ itemType }) => {
    const params = {
      TableName: 'store-data',
      Key: {
        pk0: 'store-0',
        sk0: 'availableProducts'
      },
    };
    
         
    // Call DynamoDB to read the item from the table
    const result = await ddb.get(params).promise();
    const items = result.Item.value;
    console.log('here', JSON.stringify(items, null, 2), itemType);
    
    const filteredItems = items.filter(item => item.dietType.toUpperCase().match(itemType.toUpperCase()));
    const filterNames = filteredItems.map(item => item.name);
    
    let returnMessage;
    if (filterNames.length > 0) {
        let itemString = '';
        for (let i = 0; i < filterNames.length; i++) {
            itemString += filterNames[i];
            if (i < filterNames.length - 2) itemString += ', ';
            if (i === filterNames.length - 2) itemString += `, and `;
        }
        returnMessage = `Your McDonald's has some ${itemType} options. They are ${itemString}`;
    } else {
        returnMessage = `Sorry your McDonald\'s doesn\'t carry any of ${itemType} options.`;
    }

    return returnMessage;
}