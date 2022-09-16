function average(array) {
    const total = array.reduce((acc, c) => acc + c, 0);
    return total / array.length;
}

function findBestStore(data, item) {
    let bestStore = null;
    data.forEach(store => {
        const storeMenuItem = store.menu.find(i => i.name.toUpperCase().match(item.toUpperCase()) || i.description.toUpperCase().match(item.toUpperCase()));

        if (!bestStore && storeMenuItem) {
            bestStore = {
                location: store.location,
                quality: storeMenuItem.quality
            };
            return;
        } else if (storeMenuItem) {
            if (storeMenuItem.quality > bestStore.quality) {
                bestStore.location = store.location;
                bestStore.quality = storeMenuItem.quality;
            }
        }
    })
    console.log(bestStore);
    return bestStore;
}


function findWorstStore(data, item) {
    let bestStore = null;
    data.forEach(store => {
        const storeMenuItem = store.menu.find(i => i.name.toUpperCase().match(item.toUpperCase()) || i.description.toUpperCase().match(item.toUpperCase()));

        if (!bestStore && storeMenuItem) {
            bestStore = {
                location: store.location,
                quality: storeMenuItem.quality
            };
            return;
        } else if (storeMenuItem) {
            if (storeMenuItem.quality < bestStore.quality) {
                bestStore.location = store.location;
                bestStore.quality = storeMenuItem.quality;
            }
        }
    })
    return bestStore;
}


function findFastestStore(data, item) {
    let fastest = null;
    data.forEach(store => {
        const storeMenuItem = store.menu.find(i => i.name.toUpperCase().match(item.toUpperCase()) || i.description.toUpperCase().match(item.toUpperCase()));
        const time = average(Object.values(store.serviceTimes));
        if (!fastest && storeMenuItem) {
            fastest = {
                location: store.location,
                time,
            };
            return;
        } else if (storeMenuItem) {
            if (time < fastest.time) {
                fastest.location = store.location;
                fastest.time = time;
            }
        }
    })
    return fastest;
}

function findSlowestStore(data, item) {
    let slowest = null;
    data.forEach(store => {
        const storeMenuItem = store.menu.find(i => i.name.toUpperCase().match(item.toUpperCase()) || i.description.toUpperCase().match(item.toUpperCase()));
        const time = average(Object.values(store.serviceTimes));
        if (!slowest && storeMenuItem) {
            slowest = {
                location: store.location,
                time,
            };
            return;
        } else if (storeMenuItem) {
            if (time > slowest.time) {
                slowest.location = store.location;
                slowest.time = time;
            }
        }
    })
    return slowest;
}

module.exports = {
    findBestStore,
    findWorstStore,
    findSlowestStore,
    findFastestStore,
};