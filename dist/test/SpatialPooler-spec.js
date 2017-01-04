"use strict";
var chai_1 = require('chai');
var index_1 = require('../index');
var dist_1 = require('htm-sdr/dist');
describe('construction', function () {
    it('should setup an initial state', function () {
        var sp = new index_1.SpatialPooler(128, 16);
        var sdr = new dist_1.default(16, [0, 1, 2, 3]);
        var sdr2 = new dist_1.default(16, [4, 5, 6, 7]);
        console.log(sp.permanences);
        console.log(sp.connections);
        for (var i = 0; i < 100; i++) {
            var state = sp.update(sdr);
            console.log(state.toString());
            var state = sp.update(sdr2);
            console.log(state.toString());
        }
        console.log(sp.connections);
        console.log(sp.permanences);
    });
});
describe('randomPool', function () {
    it('should return a fraction of the size', function () {
        chai_1.expect(index_1.randomPool(4, 2).length).to.equal(2);
        chai_1.expect(index_1.randomPool(4, 1).length).to.equal(1);
        chai_1.expect(index_1.randomPool(4, 3).length).to.equal(3);
        chai_1.expect(index_1.randomPool(4, 4).length).to.equal(4);
    });
});
