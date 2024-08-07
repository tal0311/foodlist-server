import express from 'express'
import { requireAuth, requireAdmin } from '../../middlewares/requireAuth.middleware.js'
import { getUser, getUsers, deleteUser, updateUser } from './user.controller.js'

const router = express.Router()

router.get('/', getUsers)
router.get('/:id', getUser)
// router.put('/:id', requireAuth, updateUser)
router.put('/:id',  updateUser)
// router.delete('/:id', requireAuth, requireAdmin, deleteUser)
router.delete('/:id',  deleteUser)

export const userRoutes = router
