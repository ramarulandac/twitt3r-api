'use strict'

const {send, json} = require('micro')
const httpHash = require('http-hash')
const Db = require('twitt3r-db')
const config = require('./config').db
const utils = require('./lib/utils')

const env = process.env.NODE_ENV || 'production'
let hash = httpHash()
let db = new Db(config)

hash.set('GET /', async function newUser (req, res, params) {

  db.connect()
  let result = await db.newUser(utils.newUser())
  await db.disconnect()
  if (result['result'].ok == 1) {
    send(res, 200, result['ops'][0])
  } else {
    send(res, 500, {error:'Error getting a User Name'})
  }

})

module.exports = async function main (req, res) {

  let { method, url } = req

  let match = hash.get(`${method.toUpperCase()} ${url}`)

  if (match.handler) {

     try {
       match.handler(req, res, match.params)
     } catch(e){

       send(res, 500, {error: e.message})
     }

  } else {
    send(res, 404, {error:'Route not found'})
  }
}
