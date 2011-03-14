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