const redis = require("redis");
const client = redis.createClient();

client.on('connection', () => console.log('Redis Connected'));
client.on('error', (err) => console.log(`Redis Error ${err}`));

const getUserData = uuid => {
    const promise = new Promise((resolve, reject) => {
        client.get(uuid, (err, reply) => {
            if (err) return reject(err);

            resolve(JSON.parse(reply));
        });
    });

    return promise;
};

const setUserData = async (uuid, data) => {
    const promise = new Promise(async (resolve, reject) => {
        const payload = JSON.stringify(await data);
        client.setex(uuid, 10000, payload, (err, res) => {
            if (err) return reject(err);

            resolve(res);
        });
    });

    return promise;
};

module.exports = { setUserData, getUserData };