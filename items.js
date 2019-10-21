const nbt = require('nbt');
const atob = require('atob');
const pako = require('pako');

const parseItemData = encoded => {
    const promise = new Promise((resolve, reject) => {
        nbt.parse(encoded, (error, data) => {
            if (error) reject(error);
         
            resolve(data);
        }); 
    });

    return promise;
};

const getItemData = async (encoded) => {
    const inflated = pako.inflate(atob(encoded));
    const itemData = await parseItemData(inflated);

    return itemData.value.i.value.value[0];
};

module.exports = { getItemData };