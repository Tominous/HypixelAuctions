const nbt = require('nbt');
const atob = require('atob');
const pako = require('pako');
const items = require('minecraft-items');

class Item {
    constructor(name, data) {
        this.name = name;
        this.data = data;
    }

    async parseItem() {
        const inflated = pako.inflate(atob(this.data));

        const promise = new Promise((res, rej) => {
            nbt.parse(inflated, (e, d) => {
                if (e) rej(e);
             
                res(d.value.i.value.value[0]);
            }); 
        });
    
        return promise;
    }

    getName() {
        return this.name;
    }

    async getMinecraftData() {
        return await items.get(this.parseItem().Id.value);
    }

    async getIcon() {
        return await items.get(this.parseItem().Id.value).icon;
    }

    async getID() {
        return await this.parseItem().Id.value;
    }

    async getSize() {
        return await this.parseItem().Count.value;
    }
}

module.exports = Item;