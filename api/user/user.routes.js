import express from 'express'
import { requireAuth, requireAdmin } from '../../middlewares/requireAuth.middleware.js'
import { getUser, getUsers, deleteUser, updateUser, addUser } from './user.controller.js'

const router = express.Router()

router.get('/', requireAdmin, getUsers)
router.get('/:id', requireAdmin, getUser)
// router.put('/:id',requireAdmin ,requireAuth, addUser)
router.put('/:id', requireAuth, updateUser)
// router.delete('/:id', requireAuth, requireAdmin, deleteUser)
router.delete('/:id',requireAdmin, deleteUser)

export const userRoutes = router
