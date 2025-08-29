import {logger} from '../services/logger.service.js'

export async function log(req, res, next) {
  console.log('===Request===');
  console.log('req.body', req.body)
  console.log('req.params', req.params)
  console.log('req.query', req.query)
  console.log('req.method', req.method)
  console.log('req.originalUrl', req.originalUrl)
  console.log('===Request End===');
  
  next()
}

