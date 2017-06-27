var q = require("q");

var deferred = q.defer();

exports.resolve = function () {
    deferred.resolve.apply(deferred, arguments);
};

exports.teardown = function () {
    return deferred.promise;
};
