var authList = {};
var userList = {};

exports.setAuth = function(userId, authKey) {
    if (userList.hasOwnProperty(userId)) {
        var oldAuth = userList[userId];
        delete authList[oldAuth];
    }

    authList[authKey] = userId;
    userList[userId] = authKey;
}

exports.authenticate = function(authKey) {
    if (!authList.hasOwnProperty(authKey)) {
        throw "Authorization failed";
    }

    return authList[authKey];
}

exports.deleteAuth = function(userId) {
    if (userList.hasOwnProperty(userId)) {
        var oldAuth = userList[userId];
        delete authList[oldAuth];
        delete userList[userId];
    }

}

exports.reset = function() {
    authList = {};
    userList = {};
}