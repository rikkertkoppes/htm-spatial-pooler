"use strict";
var dist_1 = require('htm-sdr/dist');
function randomPool(max, count) {
    var connected = 0;
    var pool = {};
    while (connected < count) {
        var index = Math.floor(max * Math.random());
        if (!pool[index]) {
            pool[index] = true;
            connected += 1;
        }
    }
    return Object.keys(pool).map(function (key) { return parseInt(key); });
}
exports.randomPool = randomPool;
function randomNumbers(max, count) {
    var pool = [];
    while (count--) {
        pool.push(max * Math.random());
    }
    return pool;
}
exports.randomNumbers = randomNumbers;
var SpatialPooler = (function () {
    function SpatialPooler(columns, size) {
        this.columns = columns;
        this.size = size;
        this.permanences = [];
        this.connections = [];
        var connectionFraction = 0.02;
        for (var i = 0; i < size; i++) {
            this.connections[i] = randomPool(columns, Math.round(columns * connectionFraction));
            this.permanences[i] = randomNumbers(1, Math.round(columns * connectionFraction));
        }
    }
    SpatialPooler.prototype.defaultState = function () {
        return new dist_1.default(this.columns);
    };
    SpatialPooler.prototype.updateState = function (_a, input) {
        var columns = _a.columns, permanences = _a.permanences;
        var threshold = 0.5;
        var permanenceInc = 0.05;
        var permanenceDec = 0.008;
        this.connections.forEach(function (columnsConnected, bitIndex) {
            if (input.get(bitIndex) === 1) {
                columnsConnected.forEach(function (columnIndex, permanenceIndex) {
                    var perm = permanences[bitIndex][permanenceIndex];
                    if (perm > threshold) {
                        columns.set(columnIndex);
                    }
                    permanences[bitIndex][permanenceIndex] = Math.min(1, perm + permanenceInc);
                });
            }
            else {
                columnsConnected.forEach(function (columnIndex, permanenceIndex) {
                    var perm = permanences[bitIndex][permanenceIndex];
                    permanences[bitIndex][permanenceIndex] = Math.max(0, perm - permanenceDec);
                });
            }
        });
        return { columns: columns, permanences: permanences };
    };
    SpatialPooler.prototype.update = function (input) {
        var newState = this.updateState({
            columns: this.defaultState(),
            permanences: this.permanences
        }, input);
        this.permanences = newState.permanences;
        return newState.columns;
    };
    return SpatialPooler;
}());
exports.SpatialPooler = SpatialPooler;
