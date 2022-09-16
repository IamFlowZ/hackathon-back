const {
    findBestStore,
    findWorstStore,
    findSlowestStore,
    findFastestStore,
} = require('./bestStore');

const AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-1'});

// Create the DynamoDB service object
const ddb = new AWS.DynamoDB.DocumentClient({apiVersion: '2012-08-10'});

exports.default = async({MenuItem, QualityItem}) => {
    
    const item = MenuItem;
    const quality = QualityItem;
    
    // get all store info
    const results = [];
    for (let i = 0; i < 4; i ++) {
        const paramsMenu = {
            TableName: 'store-data',
            Key: {
                pk0: `store-${i}`,
                sk0: 'menu',
            },
        }
        const menu = await ddb.get(paramsMenu).promise();
        
        const paramsLocation = {
            TableName: 'store-data',
            Key: {
                pk0: `store-${i}`,
                sk0: 'location',
            },
        }
        const location = await ddb.get(paramsLocation).promise();
        
        const paramsServiceTimes = {
            TableName: 'store-data',
            Key: {
                pk0: `store-${i}`,
                sk0: 'serviceTimes',
            },
        }
        const serviceTimes = await ddb.get(paramsServiceTimes).promise();
        
        results.push({
            location: location.Item.value,
            menu: menu.Item.value,
            serviceTimes: serviceTimes.Item.value,
        });
    }
    
    // do logic based on quality
    let textResult = 'there is no data for these parameters';
    console.log('results', results);
    
    if (quality === 'best') {
        const best = findBestStore(results, item)
        if (best)  textResult = `The best place for ${item} is at ${best.location}`;
    }
    if (quality === 'worst') {
        const worst = findWorstStore(results, item)
        if (worst) textResult = `The worst place for ${item} is at ${worst.location}`;
    }
    
    if (quality === 'fastest') {
        const best = findFastestStore(results, item)
        if (best)  textResult = `The fastest place for ${item} is at ${best.location}`;
    }
    
    if (quality === 'slowest') {
        const best = findSlowestStore(results, item)
        if (best)  textResult = `The slowest place for ${item} is at ${best.location}`;
    }
    
    return textResult;
}