const AWS = require('aws-sdk');
// Set the region
AWS.config.update({region: 'us-east-1'});

// Create the DynamoDB service object
const ddb = new AWS.DynamoDB.DocumentClient({apiVersion: '2012-08-10'});

exports.default = async({item}) => {
    const params = {
      TableName: 'store-data',
      Key: {
        pk0: 'store-0',
        sk0: 'productOutage'
      },
    };

    const dbResponse = await ddb.get(params).promise();
    const outItems = dbResponse?.Item?.value;
    console.log(JSON.stringify(outItems, null, 2));
    
    
    let returnMessage;
    if (!item) {
        let unavailableItems = outItems.map(item => item.name);
        if (unavailableItems.length === 0) returnMessage = 'All menu items are online!';
        else {
            let itemString = '';
            for (let i = 0; i < unavailableItems.length; i++) {
                itemString += unavailableItems[i];
                if (i < unavailableItems.length - 2) itemString += ', ';
                if (i === unavailableItems.length - 2) itemString += `, and `;
            }
            const p = unavailableItems.length > 1;
            returnMessage = `${itemString} ${p ? 'are' : 'is'} currently unavailble.`;
        }
    } else {
        // figure out if they passed in a plural item (burgers)
        const itemStringList = item.split('');
        const plural = itemStringList[itemStringList.length - 1] === 's';
        if (plural) returnMessage = `${item} are `;
        else returnMessage = `a ${item} is `;
        returnMessage += `currently unavailable at your McDonald\'s`;
        
        // get the restore time
        const storeMenuItem = outItems.find(i => i.name.toUpperCase().match(item.toUpperCase()));
        if (storeMenuItem?.timeToRestore) returnMessage += ` with an estimated repair time of ${storeMenuItem.timeToRestore} minutes`
    }
    return returnMessage;
}