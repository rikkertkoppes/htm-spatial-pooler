/// <reference path="../node_modules/htm-sdr/dist/index.d.ts" />

import SDR from 'htm-sdr/dist';

/**
 * idea: route the connections not from the columns to 50% of the sdr bits,
 * but the other way around. This allows for dynamic expansion of the sdr
 *
 * "normally" one column would connect to p % of the sdr bits (50% potential)
 * say we have c columns and n bits in the sdr
 *
 * then the number of connections would be p * n * c
 *
 * so every bit also has p % of the number of columns connections
 *
 * When a new bit is added, randomy connect to p % of the columns
 */

interface PoolerState {
    columns: SDR;
    permanences: number[][];
}

//picks a fraction of the numbers between 0 and size
//TODO: maybe make this quicker by storing all possible numbers in an array and
//picking a random index and removing that item from the array
//then repeat
//less repetition -> more bookkeeping
export function randomPool(max, count): number[] {
    var picked = 0;
    var pool = {};
    while (picked < count) {
        //pick a random number between 0 and size
        var index = Math.floor(max * Math.random());
        if (!pool[index]) {
            pool[index] = true;
            picked += 1;
        }
    }
    return Object.keys(pool).map((key) => parseInt(key));
}

export function randomNumbers(max, count): number[] {
    var pool = [];
    while (count--) {
        pool.push(max * Math.random());
    }
    return pool;
}

export class SpatialPooler {
    public permanences: number[][] = [];    //[sdrIndex][permanence]
    public connections: number[][] = [];    //[sdrIndex][columnIndex]
    /**
     * write this as a state transformatio reducer.
     * Take the previous state, the encoded input and produce the next state
     *
     * would this all make sense to put it in a redux / elm format?
     */
    constructor(
        private columns: number,
        private size: number
    ) {
        var connectionFraction = 0.02;
        //create random connections and permanences
        for (var i = 0; i < size; i++) {
            this.connections[i] = randomPool(columns, Math.round(columns * connectionFraction));
            this.permanences[i] = randomNumbers(1, Math.round(columns * connectionFraction));
        }
    }


    private defaultState() {
        return new SDR(this.columns);
    }

    /**
     * create a new column state
     * for every bit in the input, get the columns it is connected to
     * when the input bit is high
     * then, for every column set it to high if the permanence is above the threshold
     * increase that permanence if it was high, decrease if not <-- THIS IS NOT CORRECT
     */
    private updateState({columns, permanences}: PoolerState, input: SDR): PoolerState {
        //magic numbers
        var threshold = 0.5;
        var permanenceInc = 0.05;
        var permanenceDec = 0.008;
        this.connections.forEach((columnsConnected, bitIndex) => {
            //we have the bitindex and the columns connected to it
            if (input.get(bitIndex) === 1) {
                //input neuron active
                columnsConnected.forEach((columnIndex, permanenceIndex) => {
                    var perm = permanences[bitIndex][permanenceIndex];
                    //connection permanence above threshold
                    if (perm > threshold) {
                        //set column active
                        columns.set(columnIndex);
                    }
                    //increase the permanence if the input was active
                    permanences[bitIndex][permanenceIndex] = Math.min(1, perm + permanenceInc);
                })
            } else {
                //descrease permanences
                columnsConnected.forEach((columnIndex, permanenceIndex) => {
                    var perm = permanences[bitIndex][permanenceIndex];
                    //decrease is there was not a match
                    permanences[bitIndex][permanenceIndex] = Math.max(0, perm - permanenceDec);
                })
            }
        });
        return { columns, permanences };
    }

    public update(input: SDR): SDR {
        //recalculate the column state based on current connections and their permanence
        //update permanence based on current values
        var newState = this.updateState({
            columns: this.defaultState(),
            permanences: this.permanences
        }, input);
        this.permanences = newState.permanences;
        return newState.columns;
    }
}