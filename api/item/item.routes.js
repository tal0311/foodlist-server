import express from 'express'
import { requireAuth, requireAdmin } from '../../middlewares/requireAuth.middleware.js'
import { log } from '../../middlewares/logger.middleware.js'
import { getItems, getItemById, addItem, updateItem, removeItem } from './item.controller.js'

const router = express.Router()

// We can add a middleware for the entire router:
// router.use(requireAuth)

router.get('/', log, getItems)
// router.get('/', log, requireAuth, getItems)
router.get('/:id', getItemById)
router.post('/', requireAuth, requireAdmin, addItem)
// router.put('/:id', requireAuth, updateItem)
router.put('/:id', requireAuth, requireAdmin, updateItem)
// router.delete('/:id', requireAuth, removeItem)
router.delete('/:id', requireAuth, requireAdmin, removeItem)



export const itemRoutes = router

