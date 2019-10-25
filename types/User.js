class User {
    constructor(id, data, ws) {
        this.id = id;
        this.user = data;

        this.watchingAuctions = this.user.watchingAuctions;
        this.ws = ws;

        this.ws.on('message', msg => this.handleMessage(msg));
    }

    parseMessage(msg) {
        try {
            return JSON.parse(msg);
        } catch (e) { 
            return {};
        }
    }

    handleMessage(msg) {
        const data = this.parseMessage(msg);

        switch(data.op) {

        }
    }

    get ws() {
        return this.ws;
    }

    get id() {
        return this.id;
    }

    get watchingAuctions() {
        return this.watchingAuctions;
    }

    get user() {
        return this.user;
    }
}

module.exports = User;