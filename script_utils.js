'use strict'

//scripts for reporting to loggly
const term = require('terminal-kit').terminal

const text = (text) => {
    term.bold(`${text}\n`)
}

const success = (value) => {
    term.green(`${value}\n`)
}

const fail = (value) => {
    term.red(`${value}\n`)
}

const question = async (question) => {
    term.bold(question)

    term.bold('\n')

    const answer = await term.inputField().promise

    term.bold('\n')

    return answer
}


const die = (error) => {
    term.red(error)
    term.bold('\n')
    term.processExit(1)
}

module.exports = {
    die,
    fail,
    question,
    success,
    text,
}
