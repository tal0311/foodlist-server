import { dbService } from '../../services/db.service.js'
import { logger } from '../../services/logger.service.js'
import { utilService } from '../../services/util.service.js'
import { socketService } from '../../services/socket.service.js';
import { itemService } from '../item/item.service.js';
import { config } from '../../config/index.js';

import { MongoClient, ObjectId } from 'mongodb';
const mongoId = ObjectId.createFromHexString;



const collectionName = 'recipe'

async function query(filterBy = { txt: '', type: '', admin:'' }, loggedInUser) {

    try {

        const { settings } = loggedInUser

        const collection = await dbService.getCollection(collectionName)

        if (filterBy.admin) {
            const recipes = await collection.find().toArray()
            return recipes
        }
     
        const recipes = await collection.aggregate([
            {
                $project: {
                    _id: 1,
                    group: 1,
                    imgUrl: 1,
                    [settings.lang]: 1
                }
            }
        ]).toArray()

        let recipesCounter = recipes.reduce((acc, curr) => {
            if (acc[curr.group]) {
                acc[curr.group]++

            } else {
                acc[curr.group] = 1
            }
            return acc
        }, {})


        recipesCounter = [{ group: 'all', count: recipes.length }, ...Object.entries(recipesCounter).map(([group, count]) => ({ group, count }))]
        // socket this to front end for filter
     
        // socketService.emitToUser({type :'recipes-labels',data: recipesCounter,userId: loggedInUser._id})

        return recipes.map(recipe => {
            return{
                _id: recipe._id,
                group: recipe.group,
                imgUrl: recipe.imgUrl ||config.DEFAULT_IMG, 
                ...recipe[settings.lang]
            }
        })




    } catch (err) {
        logger.error('cannot find recipe', err)
        throw err
    }
}

async function getById(recipeId, loggedInUser) {
    console.log('recipe.service.js getById recipeId:', recipeId);
    try {
        const collection = await dbService.getCollection(collectionName)

        const { settings } = loggedInUser

        const lang = settings.lang === 'he' ? 'en' : 'he'
        recipeId = mongoId(recipeId)
        const recipe = await collection.findOne({ _id: recipeId }, { projection: { [lang]: false } })
        recipe.ingredients = await itemService.getItemsByIds(recipe.ingredients)

        return recipe
    } catch (err) {
        logger.error(`while finding recipe ${recipeId}`, err)
        throw err
    }
}

async function remove(recipeId) {
    try {
        const collection = await dbService.getCollection(collectionName)
        recipeId = mongoId(recipeId)
        await collection.deleteOne({ _id: recipeId })
        return recipeId
    } catch (err) {
        logger.error(`cannot remove recipe ${recipeId}`, err)
        throw err
    }
}

async function add(recipe) {

    try {
        const collection = await dbService.getCollection(collectionName)
        const inserted = await collection.insertOne(recipe);

        console.log(inserted);

        recipe._id = inserted.insertedId
        return recipe;

    } catch (err) {
        logger.error('cannot insert recipe', err)
        throw err
    }
}

async function update(recipe, recipeId) {
    try {
        const collection = await dbService.getCollection(collectionName)
        //TODO: take only the fields that can be updated
        const recipeToSave = { ...recipe }
        // _id field is immutable
        delete recipeToSave._id
        await collection.updateOne({ _id: mongoId(recipeId) }, { $set: recipeToSave })
        return recipe
    } catch (err) {
        logger.error(`cannot update recipe ${recipe._id}`, err)
        throw err
    }
}

async function getRecipeById(recipeId) {
    try {
        const collection = await dbService.getCollection(collectionName)
        recipeId = mongoId(recipeId)
        console.log('recipeId:', recipeId);
        const recipe = await collection.findOne({ _id: recipeId, type: 'recipe' })
        // return recipe
        // recipe.ingredients= await itemService.getItemsByIds(recipe.ingredients)

        return recipe
    }
    catch (err) {
        logger.error(`while finding recipe ${recipeId}`, err)
        throw err
    }
}


export const recipeService = {
    remove,
    query,
    getById,
    add,
    update,
    getRecipeById
}
