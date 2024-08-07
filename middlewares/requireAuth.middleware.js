import {config} from '../config/index.js'
import {logger} from '../services/logger.service.js'
import {asyncLocalStorage} from '../services/als.service.js'

export function requireAuth(req, res, next) {
  const { loggedInUser } = asyncLocalStorage.getStore()
  req.loggedInUser = loggedInUser
  
  if (!loggedInUser) return res.status(401).json('Not Authenticated')
  next()
}

export function requireAdmin(req, res, next) {
  const { loggedInUser } = asyncLocalStorage.getStore()
  if (!loggedInUser) return res.status(401).send('Not Authenticated')
  if (!config.roles.includes(loggedInUser.role)) {
    logger.warn(loggedInUser.username + 'attempted to perform admin action')
    res.status(403).end('Not Authorized')
    return
  }
  next()
}





