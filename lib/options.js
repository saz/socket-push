/**
 * options.js - simple command line options parsing.
 *
 * @author R. S. Doiel, <rsdoiel@gmail.com>
 * copyright (c) 2010 R. S. Doiel, all rights reserved
 *
 * Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
 *
 * Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
 * Neither the name of the R. S. Doiel nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 */
var self = { 'argv' : process.ARGV };

/**
 * parse - passing the argument array to process.
 * @param argv - the argument array to process. Usually process.ARGV.
 * @return the arg list to process.
 */
parse = function (argv) {
  self.argv = argv;
  return self.argv;
};


/**
 * isNumeric - a simple function to establish if the contents of a string are numeric.
 * this is provided as a an example of a validator method. E.g. an option --port=NUMBER could be
 * validated with isNumeric.
 * @param value - the value to check
 * @return true if is numeric, false otherwise.
 */
isNumeric = function (value) {
  var n = Number(value);
  if (typeof n === 'number' && n.toString() !== 'NaN') {
    return true;
  }
  return 'isNumeric("' + value + '") failed.';
};


/**
 * isAnOption - internal method for processing options as string, array or object.
 * @param test - the string to test inspect.
 * @param option - the option string/array/object to test against
 * @return true if match found, false otherwise
 */
isAnOption = function (test, option) {
  var i = 0;
  if (test === undefined) {
    return false;
  }
  if (option === undefined) {
    return false;
  }

  switch(typeof option) {
    case 'string':
      if (test.indexOf(option) === 0) {
        return option;
      }
      break;
    case 'object':
      // Check for exact match first.
      if (option[test] !== undefined) {
        return option[test];
      }
      // Check for partial match, e.g. '--this' in '--this=that'
      for (i in option) {
        if (typeof i === 'string' && test.indexOf(i) === 0) {
          return i;
        } else if (test.indexOf(option[i]) === 0) {
          return option[i];
        }
      }
      break;
  }
  return false;
};


/**
 * getOption - process any command line long option args and fire a callback if present.
 * @param option - the command line arg you are looking for. If found it will remove it from
 * from nsh.argv.
 * @param validation - [optional] a function which validates option's values. If undefined then a
 * value is not expected to be paired with the option. If value passed with the option then
 * the validation function should return true otherwise its results will be passed to the callback as the
 * first argument (i.e. callback(validation_error, value).
 * @param callback - the callback function to fire.  First arg is error, the second is the contents
 * of the option. (e.g. --prefix=/home/username, then contents would contain /home/username)
 */
getOption = function(option, validation, callback) {
  var i = 0, k = 0, next = 1, arg = '', opt = '', value, err;
  if (arguments.length == 2) {
    callback = arguments[1];
    validation = undefined;
  }

  arg = self.argv[i];
  while (arg !== undefined) {
    /* Check to see if we have a long option or short */
    if (isAnOption(arg, option)) {
      // Check for long arg versus short arg.
      opt = (self.argv.splice(i,1)).toString();
      if (opt.indexOf('--') === 0) {
        if (arg.indexOf('=') > 0) {
          value = arg.substr(arg.indexOf("=") + 1);
          if (value[0] === '"' || value[0] === "'") {
            value = value.substr(1,value.length - 2);
          }
        } else {
          value = undefined;
        }
      } else {
        /* Do we have a single short option or a short option list?
           Do we have a value to pass with the short option? */
        if (opt.length === 2 && self.argv[i] !== undefined && (self.argv[i]).indexOf('-') < 0) {
          value = (self.argv.splice(i, 1)).toString();
        } else {
          /* We have a short option list so we need to expand the argument list. */
          opts = arg.substr(2).split('');
          k = i; /* The insert point is initailly current location (i.e. value of i),
                    it'll move indepent of i as we insert items */
          for(j in opts) {
            self.argv.splice(k, 0, '-' + opts[j]);
            k += 1;
          }
        }
      }
      if (typeof validation === 'function' && validation(value) !== true) {
        err = validation(value);
      } else {
        err = undefined;
      }
      callback(err, value);
      return true;
    }  else {
      i += 1;
    }
    arg = self.argv[i];
  }
  return false;
};

getArgs = function () {
  return self.argv;
};

getArg = function (position) {
  if (self.argv[position] === undefined) {
    return;
  }
  return self.argv[position];
};

/*
 * Main exports of nsthools' module
 */
exports.parse = parse;
exports.getOption = getOption;
exports.getArgs = getArgs;
exports.getArg = getArg;
exports.isNumeric = isNumeric;