var util = require('util');

module.exports = function(template) {
    var collection = template || new Object();

    this.get = function(key) {
        if (!collection.hasOwnProperty(key)) {
            collection[key] = {};
        }
        return collection[key];
    }

    this.has = function(key) {
        return collection.hasOwnProperty(key);
    }

    this.hasSub = function(key, subKey, value) {
        return collection.hasOwnProperty(key) &&
                collection[key].hasOwnProperty(subKey);
    }

    this.addSub = function(key, subKey, value) {
        if (!collection.hasOwnProperty(key)) {
            collection[key] = {};
        }
        collection[key][subKey] = value;
    }

    this.removeSub = function(key, subKey) {
        if (!collection.hasOwnProperty(key)) {
            return;
        }

        if (!collection[key].hasOwnProperty(subKey)) {
            return;
        }

        delete collection[key][subKey];
        if (Object.keys(collection[key]).length == 0) {
            delete collection[key];
        }
    }

}