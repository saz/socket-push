var util = require('util');

exports.proxiedObject = {
    foo: function(arg1, arg2) {
        if (arg2 == undefined) {
            throw "Foo";
        }
        return [arg1, arg2];
    }
};

exports.serviceDesc = {
    'name': 'fooservice',
    'methods': {
        'foo': {
            'params': [
                {'name': 'arg1', type: 'string'},
                {'name': 'arg2', type: 'string'}
            ]
        }
    }
};

exports.proxiedShardInt = {
    foo: function(arg1, arg2) {
        return 0;
    }
};

exports.proxiedShardInt2 = {
    foo: function(arg1, arg2) {
        return 1;
    }
};

exports.serviceShardInt = {
    'name': 'fooservice',
    'methods': {
        'foo': {
            'params': [
                {'name': 'arg1', type: 'number'},
                {'name': 'arg2', type: 'number'}
            ]
        }
    }
};

exports.proxiedShardString = {
    foo: function(arg1, arg2) {
        return 1;
    }
};

exports.proxiedShardString2 = {
    foo: function(arg1, arg2) {
        return 2;
    }
};

exports.serviceShardString = {
    'name': 'fooservice',
    'methods': {
        'foo': {
            'params': [
                {'name': 'arg1', type: 'string'},
                {'name': 'arg2', type: 'string'}
            ]
        }
    }
};