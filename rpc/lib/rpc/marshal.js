
exports.fromHttpParams = function(params, definition) {
    var args = [];
    definition.forEach(function(param) {
        args.push(exports.fromHttpValue(params[param.name], param.type));
    });
    return args;
}

exports.fromHttpValue = function(value, type) {
    return ({
        number: exports.fromHttpNumber,
        string: exports.fromHttpString,
        object: exports.fromHttpObject
    })[type](value);
}

exports.fromHttpNumber = function(value) {
    value = parseInt(value, 10);
    if (isNaN(value)) {
        throw "Expected numeric literal";
    }
    return value;
}

exports.fromHttpString = function(value) {
    if (typeof value !== 'string') {
        throw "Expected string";
    }
    return value;
}

exports.fromHttpObject = function(value) {
    if (typeof value !== 'string') {
        throw "Expected string";
    }
    return JSON.parse(value);
}

exports.toHttpParams = function(args, definition) {
    var params = {};
    var x = 0;
    args.forEach(function(arg) {
        var param = definition[x];
        params[param.name] = exports.toHttpValue(arg, param.type);
        x++;
    });
    return params;
}

exports.toHttpValue = function(value, type) {
    return ({
        number: exports.toHttpNumber,
        string: exports.toHttpString,
        object: exports.toHttpObject
    })[type](value);
}

exports.toHttpNumber = function(value) {
    if (typeof value !== 'number') {
        throw "Expected integer";
    }
    return value.toString();
}

exports.toHttpString = function(value) {
    if (typeof value !== 'string') {
        throw "Expected string";
    }
    return encodeURIComponent(value);
}

exports.toHttpObject = function(value) {
    return encodeURIComponent(JSON.stringify(value));
}

