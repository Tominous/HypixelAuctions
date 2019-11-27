const nbt = require('nbt');
const atob = require('atob');
const pako = require('pako');
const items = require('minecraft-items');

class Item {
    constructor(name, data) {
        this.name = name;
        this.data = data;

        this.parsed = null;
    }

    async parseItem() {
        const inflated = pako.inflate(atob(this.data));

        const promise = new Promise((res, rej) => {
            nbt.parse(inflated, (e, d) => {
                if (e) rej(e);
             
                this.parsed = d.value.i.value.value[0];
                res(d.value.i.value.value[0]);
            });
        });
    
        return promise;
    }

    getName() {
        return this.name;
    }

    get enchantments() {
        if (!this.parsed.tag.value.ExtraAttributes.value.enchantments) return [];

        const itemData = this.parsed.tag.value.ExtraAttributes.value.enchantments.value;
        const enchants = Object.keys(itemData);

        return enchants;
    }

    async getMinecraftData() {
        return items.get(await this.parseItem().Id.value);
    }

    async getIcon() {
        const data = await this.parseItem();
        if (!data.id.value) return items.get(166).icon;

        return items.get(data.id.value).icon;
    }

    async getID() {
        return await this.parseItem().Id.value;
    }

    async getSize() {
        const data = await this.parseItem();
        if (!data) return 1;

        return data.Count.value;
    }
}

module.exports = Item;