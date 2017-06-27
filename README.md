![githubbanner](https://user-images.githubusercontent.com/3379410/27423240-3f944bc4-5731-11e7-87bb-3ff603aff8a7.png)

[![Maintenance](https://img.shields.io/maintenance/yes/2017.svg)]() [![Chat on gitter](https://img.shields.io/gitter/room/ovh/ux.svg)](https://gitter.im/ovh/ux) [![Build Status](https://travis-ci.org/ovh-ux/ovh-protractor-jasmine2-logs-reporter.svg)](https://travis-ci.org/ovh-ux/ovh-protractor-jasmine2-logs-reporter)

[![NPM](https://nodei.co/npm/ovh-protractor-jasmine2-logs-reporter.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/ovh-protractor-jasmine2-logs-reporter/)

OVH Logs Reporter
=================

Angular logs reporter for Protractor and Jasmine2.

It creates a JSON report file with all logs informations (console and HTTP errors (only chrome)).

## Install

### NPM

```
$ npm install ovh-protractor-jasmine2-logs-reporter --save
```

## Get the sources

```bash
$ git clone https://github.com/ovh-ux/ovh-protractor-jasmine2-logs-reporter.git
$ cd ovh-protractor-jasmine2-logs-reporter
$ npm install
$ bower install
```


## Usage

Into your protractor.conf.js:

```javascript
    plugins : [{
        path: "node_modules/ovh-protractor-jasmine2-logs-reporter/plugin.js"
    }],

    onPrepare: function () {
        // add logs reporter
        var OvhLogsReporter = require("ovh-protractor-jasmine2-logs-reporter");
        jasmine.getEnv().addReporter(new OvhLogsReporter({
            baseDirectory: "./reports",     // The directory to store the file
            fileName: "report.json",        // (Optional) The report file
            enableHttpLogs: true            // CHROME ONLY: log HTTP errors
        }));
    },
```

(CHROME ONLY)
It can logs HTTP errors too (> HTTPCODE 200).

In addition of above code, add this in your protractor.conf.js:

```javascript
    capabilities: {
        "browserName": "chrome",
        "chromeOptions": { "args": ["incognito", "disable-extensions"] },
        "loggingPrefs": {
            "browser": "ALL",
            "performance": "ALL"
        },
        "perfLoggingPrefs": {
            "enableNetwork": true,
            "enablePage": false,
            "enableTimeline": false
        }
    },

    plugins : [{
        path: "node_modules/ovh-protractor-jasmine2-logs-reporter/plugin.js"
    }],

    onPrepare: function () {
        // add logs reporter
        var OvhLogsReporter = require("ovh-protractor-jasmine2-logs-reporter");
        jasmine.getEnv().addReporter(new OvhLogsReporter({
            baseDirectory: "./reports",     // The directory to store the file
            fileName: "report.json",        // (Optional) The report file
            enableHttpLogs: true            // CHROME ONLY: log HTTP errors
        }));
    },

```

# Contributing

You've developed a new cool feature ? Fixed an annoying bug ? We'd be happy
to hear from you !

Have a look in [CONTRIBUTING.md](https://github.com/ovh-ux/ovh-protractor-jasmine2-logs-reporter/blob/master/CONTRIBUTING.md)

## Run the tests

```
$ npm test
```

## Related links

 * Contribute: https://github.com/ovh-ux/ovh-protractor-jasmine2-logs-reporter/blob/master/CONTRIBUTING.md
 * Report bugs: https://github.com/ovh-ux/ovh-protractor-jasmine2-logs-reporter/issues
 * Get latest version: https://github.com/ovh-ux/ovh-protractor-jasmine2-logs-reporter

# License

See https://github.com/ovh-ux/ovh-protractor-jasmine2-logs-reporter/blob/master/LICENSE
