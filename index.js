"use strict";

var mkdirp = require("mkdirp");
var path = require("path");
var fs = require("fs");
var Q = require("q");
var waitPlugin = require("./plugin.js");

/**
 * Uses passed information to generate a meta data object
 *
 * @param  {Object} result       - The result object of the current test spec.
 * @param  {Object} capabilities - WebDrivers capabilities object containing
 *                                 in-depth information about the Selenium node
 *                                 which executed the test case.
 * @param  {Array}  logs         - Browser console logs
 * @param  {Array}  logsPerf     - (optional) HTTP logs
 * @return {Object} - containig meta data to store
 */
function defaultMetaDataBuilder (result, capabilities, logs, logsPerf) {

    var metaData = {
        id: result.id,
        description: result.fullName,
        status: result.status,
        date: new Date().toISOString(),
        duration: result.duration,
        os: capabilities.get("platform"),
        browser: {
            name: capabilities.get("browserName"),
            version: capabilities.get("version")
        },
        failedExpectations: result.failedExpectations,
        consoleLogs: []
    };

    if (logs && logs.length) {
        var log;
        var i = 0;
        var logsLen = logs.length;
        var consoleReg = /^([^\s]+) (\d+\:\d+) ((?:\n|.)+)$/;

        for (i = 0; i < logsLen; i++) {
            log = logs[i];

            if (consoleReg.test(log.message)) {
                var parsedLog = log.message.match(consoleReg);

                metaData.consoleLogs.push({
                    level: log.level,
                    timestamp: log.timestamp,
                    date: new Date(log.timestamp).toISOString(),
                    stack: {
                        url: parsedLog[1],
                        position: parsedLog[2],
                        message: parsedLog[3]
                    }
                });
            }
        }
    }

    if (logsPerf && logsPerf.length) {
        var logPerf;
        var ii = 0;
        var logsPerfLen = logsPerf.length;

        metaData.httpLogs = [];

        for (ii = 0; ii < logsPerfLen; ii++) {
            logPerf = logsPerf[ii];
            logPerf.message = JSON.parse(logPerf.message);

            if (logPerf.message && logPerf.message.message && logPerf.message.message.method === "Network.responseReceived" && logPerf.message.message.params) {

                if (logPerf.message.message.params.response.status > 200) {
                    metaData.httpLogs.push({
                        level: logPerf.level,
                        timestamp: logPerf.timestamp,
                        date: new Date(logPerf.timestamp).toISOString(),
                        stack: {
                            method: /^\w+/.test(logPerf.message.message.params.response.requestHeadersText) ? logPerf.message.message.params.response.requestHeadersText.match(/^\w+/)[0] : "?",
                            url: logPerf.message.message.params.response.url,
                            status: logPerf.message.message.params.response.status,
                            statusText: logPerf.message.message.params.response.statusText,
                            headers: logPerf.message.message.params.response.headers,
                            requestHeaders: logPerf.message.message.params.response.requestHeaders
                        }
                    });
                }

            }
        }
    }

    return metaData;
}

/**
 * Converts the metaData object to a JSON string and stores it to the file at the given path.
 *
 * @param  {Object} metaData  - Object to save as JSON
 * @param  {Array}  file      - Target file path
 */
function storeMetaData (metaData, file) {
    var json = JSON.stringify(metaData, null, "\t");

    fs.writeFileSync(file, json, "utf8", function (err) {
        if (err) {
            throw new Error("Error while writing metadata file - " + err.message);
        }
    });
}

/**
 * Creates a new reporter using the given `options` object.
 *
 * @param  {Object} options - reporter options
 */
function OvhLogsReporter (opts) {
    var options = opts || {};
    var self = this;

    if (!options.baseDirectory || options.baseDirectory.length === 0) {
        throw new Error("Please pass a valid base directory to store the report into.");
    } else {
        this.baseDirectory = options.baseDirectory;
    }

    this.fileName = options.fileName || "report.json";

    this.enableHttpLogs = options.enableHttpLogs || false;

    return {
        specDone: function (result) {
            // Spec failed!
            if (result.failedExpectations.length > 0) {
                self.haveSpecFailed = true;
                return self.reportSpecResults(result);
            }
        },
        jasmineDone: function () {
            // If all is OK: end
            if (!self.haveSpecFailed) {
                waitPlugin.resolve();
            }
        }
    };
}

/**
 * Called by Jasmine when reporting results for a test spec. It triggers the
 * whole process and stores any relevant information.
 *
 * @param  {Object} result - The result object of the current test spec.
 */
OvhLogsReporter.prototype.reportSpecResults = function (result) {
    var self = this;

    var logs;
    var logsPerf;
    var capabilities;

    var promises = [
        global.browser.driver.manage().logs().get("browser").then(function (datas) {
            logs = datas;
        }),
        global.browser.getCapabilities().then(function (datas) {
            capabilities = datas;
        })
    ];

    if (self.enableHttpLogs) {
        promises.push(global.browser.driver.manage().logs().get("performance").then(function (datas) {
            logsPerf = datas;
        }));
    }

    Q.all(promises).then(function () {

        var metaDataPath = path.join(self.baseDirectory, self.fileName);

        // pathBuilder can return a subfoldered path too. So extract the
        // directory path without the baseName
        var directory = path.dirname(metaDataPath);

        var metaData = defaultMetaDataBuilder(result, capabilities, logs, logsPerf);

        // Create directory
        mkdirp.sync(directory);

        // Write report file
        storeMetaData(metaData, metaDataPath);

        waitPlugin.resolve();

    }, function (err) {
        waitPlugin.reject("Error while getting suite informations - " + err.message);
    });
};

module.exports = OvhLogsReporter;
