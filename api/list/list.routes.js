import express from 'express'
import { requireAuth } from '../../middlewares/requireAuth.middleware.js'
import { log } from '../../middlewares/logger.middleware.js'
import { getLists, getListById, addList, updateList, removeList,getRecipeById } from './list.controller.js'


const router = express.Router()

// We can add a middleware for the entire router:
// router.use(requireAuth)

router.get('/', log,requireAuth, getLists)
router.get('/recipe/:id', requireAuth, getRecipeById)
router.get('/:id',requireAuth, getListById)
router.post('/', requireAuth, addList)
// router.put('/:id', requireAuth, updateList)
router.put('/:id',  updateList)
router.delete('/:id', requireAuth, removeList)
// router.delete('/:id', requireAuth, requireAdmin, removeList)

export const listRoutes = router
