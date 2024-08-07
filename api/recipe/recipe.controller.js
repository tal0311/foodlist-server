import { recipeService } from './recipe.service.js'
import { logger } from '../../services/logger.service.js'
import { log } from '../../middlewares/logger.middleware.js'

export async function getRecipes(req, res) {
  try {
    logger.debug('Getting Recipes:', req.query)
    const filterBy = {
      txt: req.query.txt || '',
      type: req.query.type || ''
    }
    const {loggedInUser}= req
    const recipes = await recipeService.query(filterBy, loggedInUser)
    res.json(recipes)

  } catch (err) {
    logger.error('Failed to get recipes', err)
    res.status(400).send({ err: 'Failed to get recipes' })
  }
}

export async function getRecipeById(req, res) {
  try {
    logger.debug('Getting Recipe:', req.params.id)
    const recipeId = req.params.id
    const {loggedInUser}= req
    const recipe = await recipeService.getById(recipeId, loggedInUser)
    res.json(recipe)
  } catch (err) {
    logger.error('Failed to get recipe', err)
    res.status(400).send({ err: 'Failed to get recipe' })
  }
}

export async function addRecipe(req, res) {
  const { loggedInUser : {username, _id:id , imgUrl,} } = req

  try {
    const recipe = req.body
    recipe.owner = { id , username, imgUrl }
    
    const addedRecipe = await recipeService.add(recipe)
    res.json(addedRecipe)
  } catch (err) {
    logger.error('Failed to add recipe', err)
    res.status(400).send({ err: 'Failed to add recipe' })
  }
}


export async function updateRecipe(req, res) {
  try {
    const recipeId= req.params.id 
    const recipe = req.body
    const updatedRecipe = await recipeService.update(recipe, recipeId)
    res.json(updatedRecipe)
  } catch (err) {
    logger.error('Failed to update recipe', err)
    res.status(400).send({ err: 'Failed to update recipe' })

  }
}

export async function removeRecipe(req, res) {
  try {
    const recipeId = req.params.id
    const { loggedInUser } = req

    const recipe= await recipeService.getById(recipeId)
    

    if (loggedInUser._id !== recipe.owner.id) {
      return res.status(401).send('Not Authenticated')
    }
    const removedId = await recipeService.remove(recipeId)
    res.send(removedId)
  } catch (err) {
    logger.error('Failed to remove recipe', err)
    res.status(400).send({ err: 'Failed to remove recipe' })
  }
}



