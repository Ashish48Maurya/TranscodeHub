const express = require('express')
const route = express.Router();
const {getPresignedUrl, listObjects} = require('../controller')

route.post('/upload-url',getPresignedUrl)

route.get('/list-objects', listObjects)

module.exports = route;  