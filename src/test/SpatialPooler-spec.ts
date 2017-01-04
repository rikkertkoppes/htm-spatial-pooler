/// <reference path="../../node_modules/htm-sdr/dist/index.d.ts" />
/// <reference path="../../typings/index.d.ts" />

import {expect} from 'chai';
import {SpatialPooler, randomPool} from '../index';
import SDR from 'htm-sdr/dist';


describe('construction', function() {
    it('should setup an initial state', function() {
        var sp = new SpatialPooler(128, 16);
        var sdr = new SDR(16, [0, 1, 2, 3]);
        var sdr2 = new SDR(16, [4,5,6,7]);
        // console.log(sp.connections);
        // console.log(sp.permanences);
        console.log(sp.permanences);
        console.log(sp.connections);
        //learn some permanences for the same repeated input
        for (var i = 0; i < 100; i++) {
            var state = sp.update(sdr);
            console.log(state.toString());
            var state = sp.update(sdr2);
            console.log(state.toString());
        }
        console.log(sp.connections);
        console.log(sp.permanences);
        // expect(state.toString()).to.equal('0000000000000000');
    })
})

describe('randomPool', function() {
    it('should return a fraction of the size', function() {
        expect(randomPool(4, 2).length).to.equal(2);
        expect(randomPool(4, 1).length).to.equal(1);
        expect(randomPool(4, 3).length).to.equal(3);
        expect(randomPool(4, 4).length).to.equal(4);
    });
});