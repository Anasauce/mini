'use strict'

const moment = require('moment')

const { success, die } = require('./script_utils')
const { User, UserDonation, UserPlanLog } = require('../entities')
const {
    ACTIVE,
    CANCELED,
    COMPLETE,
    NEXT,
    REFUNDED
} = require('../lib/constants/UserDonation')

const MigrateUserDonationStatus = async () => {

    try {

        const userStatesWithDonations = await UserState.findAll({
            include: [{
                model: UserDonation,
                include: [{
                    model: UserPlanLog,
                    required: false
                }],
            }, {
                model: User,
                where: {
                    user_type: 'user'
                },
            }]
        })

        const userDonationsToSave = []

        for (let usIdx = 0; usIdx < userStatesWithDonations.length; usIdx++) {
            const userState = userStatesWithDonations[usIdx]

            const userDonations = userState.UserDonations || []
            for (let donationIdx = 0; donationIdx < userDonations.length; donationIdx++) {
                const userDonation = userDonations[donationIdx]

                const donationStatus = determineStatus(userDonation, userDonations, userState.user_donation_id)
                userDonation.status = donationStatus
                userDonationsToSave.push(userDonation)
            }
        }

        await Promise.all(userDonationsToSave.map(donation => donation.save()))

        success('Status Migration Complete')
    } catch (error) {
        if (transaction) transaction.rollback()
        throw error
    }
}

MigrateUserDonationStatus().catch((error) => { die(error) })

const donationIntervalIsActive = (donation) => moment.utc(donation.plan_start).isBefore(moment()) && moment.utc(donation.plan_end).isAfter(moment())
const _findActive = (user_donations = []) => {
    if (!Array.isArray(user_donations) || user_donations.length === 0) return null

    const active_donation = user_donations.find(donation => donationIntervalIsActive(donation) && donation.recurring)
    return active_donation
}

const determineStatus = (userDonation) => {

    const { reference_id, price, recurring, plan_start, plan_end, created_at, deleted_at } = userDonation

    // Data helpers
    const planStartIsPlanEnd = plan_start === plan_end
    const planEndIsBeforeNow = moment.utc(userDonation.plan_end).isBefore(moment())
    const planStartIsBeforeNow = moment.utc(userDonation.plan_start).isBefore(moment())
    const planStartIsAfterNow = moment.utc(userDonation.plan_start).isAfter(moment())
    const isCurrent = (_findActive(userDonations, user_state_selected_purchase_id) || {}).id === userDonation.id
    const isActive = donationIntervalIsActive(userDonation) && userDonation.recurring
    const isCanceled = userDonation.deleted_at && planStartIsBeforeNow
    const isNext = planStartIsAfterNow && deleted_at === null

    // Classification functions
    if (planEndIsBeforeNow) {
        return COMPLETE
    } else if (isNext) {
        return NEXT
    } else if (isActive) {
        return ACTIVE
    } else if (isCanceled) {
        return CANCELED
    }
    return null
}

module.exports = {
    determineStatus
}
