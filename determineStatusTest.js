'use strict'

const expect = require('chai').expect
const { describe, it } = require('mocha')
const { determineStatus } = require('../../../bin/MigrateUserDonationStatus')

const { ACTIVE, CANCELED, COMPLETE, NEXT } = require('/lib/constants/UserDonation')

/**
* Here we utilize a parameterized testing pattern, as described here: https://mochajs.org/#dynamically-generating-tests
*/

describe('determineStatus()', () => {

    const happyTestCases = [{
        args: {
            deleted_at: null,
            plan_end: '2018-09-26 15:45:27',
            plan_start: '2018-08-26 15:45:27',
            recurring: 1,
        },
        expected: ACTIVE
    }, {
        args: {
            deleted_at: '2018-08-26 15:45:27',
            plan_end: '2018-08-26 15:45:27',
            plan_start: '2018-07-26 15:45:27',
            recurring: 1,
        },
        expected: COMPLETE
    }, {
        args: {
            deleted_at: '2018-07-13 01:51:14',
            plan_end: '2018-08-13 01:51:14',
            plan_start: '2018-07-13 01:51:14',
            recurring: 1,
        },
        expected: COMPLETE
    }, {
        args: {
            deleted_at: '2018-07-13 01:51:14',
            plan_end: '2019-08-13 01:51:14',
            plan_start: '2018-08-13 01:51:14',
            recurring: 1,
        },
        expected: ACTIVE
    }, {
        args: {
            deleted_at: '2018-09-12 18:18:34',
            plan_end: '2018-10-12 18:18:34',
            plan_start: '2018-09-12 18:18:34',
            recurring: 1,
        },
        expected: ACTIVE
    }, {
        args: {
            deleted_at: null,
            plan_end: '2018-11-12 18:18:34',
            plan_start: '2018-10-12 18:18:34',
            recurring: 1,
        },
        expected: NEXT
    }]

    happyTestCases.forEach((happyTest) => {
        it('should be the right status', () => expect(determineStatus(happyTest.args)).to.equal(happyTest.expected))
    })
})
