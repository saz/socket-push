function auth() {
    var authList = {};
    var userList = {};

    this.set = function(userId, authKey) {
        if (userList.hasOwnProperty(userId)) {
            var oldAuth = userList[userId];
            delete authList[oldAuth];
        }

        authList[authKey] = userId;
        userList[userId] = authKey;
    }

    this.check = function(authKey) {
        if (!authList.hasOwnProperty(authKey)) {
            throw new Error("Authorization failed");
        }

        return authList[authKey];
    }

    this.remove = function(userId) {
        if (userList.hasOwnProperty(userId)) {
            var oldAuth = userList[userId];
            delete authList[oldAuth];
            delete userList[userId];
        }

    }

    this.reset = function() {
        authList = {};
        userList = {};
    }    
}

module.exports = function() {
    return new auth();
}