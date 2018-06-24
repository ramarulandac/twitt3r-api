'use strict'

const {send, json} = require('micro')
const httpHash = require('http-hash')
const Db = require('twitt3r-db')
const config = require('./config').db
const utils = require('./lib/utils')

let hash = httpHash()
let db = new Db(config)

hash.set('POST /', async function newNote (req, res, params) {

  let note = await json(req)

  db.connect()
  let result = await db.newNote(note)

  if (result['result'].ok == 1) {
    send(res, 200, result['ops'][0])
  } else {
    send(res, 500, {error:'Error creating a new Note'})
  }

  await db.disconnect()

})

hash.set('GET /:username', async function getNotes (req, res, params) {

  db.connect()
  let username = params.username
  let result = await db.getUser(username)

  if (result) {

    result = await db.getNotes(null,10)
    if (result.length != 0) {
      send(res, 200, result)
    } else {
      send(res, 200, {warning:'No notes found'})
    }
  } else {
      send(res, 200, {warning:'User Not Found'})
  }

  await db.disconnect()
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
