import express from 'express'
import { requireAuth } from '../../middlewares/requireAuth.middleware.js'
import { log } from '../../middlewares/logger.middleware.js'
import { getRecipes, getRecipeById, addRecipe, updateRecipe, removeRecipe } from './recipe.controller.js'


const router = express.Router()

// We can add a middleware for the entire router:
// router.use(requireAuth)

router.get('/', log,requireAuth, getRecipes)
router.get('/:id',requireAuth, getRecipeById)
router.post('/', requireAuth, addRecipe)
// router.put('/:id', requireAuth, updateRecipe)
router.put('/:id',  updateRecipe)
router.delete('/:id', requireAuth, removeRecipe)
// router.delete('/:id', requireAuth, requireAdmin, removeRecipe)

export const recipeRoutes = router
