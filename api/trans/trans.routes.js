import express from 'express'
import { requireAuth, requireAdmin } from '../../middlewares/requireAuth.middleware.js'
import { log } from '../../middlewares/logger.middleware.js'
import { getTrans, getTransById, addTrans, updateTrans, removeTrans } from './trans.controller.js'

const router = express.Router()

// We can add a middleware for the entire router:
// router.use(requireAuth)


// router.get('/', log, getTranss)
router.get('/', log,  getTrans)
// router.get('/:id',requireAuth, getTransById)
router.post('/', requireAuth, requireAdmin, addTrans)
// router.put('/:id', requireAuth, updateTrans)
router.put('/:id', requireAuth, requireAdmin, updateTrans)
// router.delete('/:id', requireAuth, removeTrans)
router.delete('/:id', requireAuth, requireAdmin, removeTrans)



export const transRoutes = router

