import { dbService } from '../../services/db.service.js'
import { logger } from '../../services/logger.service.js'
import { utilService } from '../../services/util.service.js'
import { socketService } from '../../services/socket.service.js';
import { itemService } from '../item/item.service.js';

import { MongoClient, ObjectId } from 'mongodb';
const mongoId = ObjectId.createFromHexString;



const collectionName = 'list'

async function query(filterBy = { txt: '', type: '' }, loggedInUser) {

    try {
        const collection = await dbService.getCollection(collectionName)
        const criteria = {
            'owner.id': loggedInUser._id
        }
        // allow to search only public lists
        if (filterBy.visibility === 'public') {
            criteria.visibility = 'public'
        }
        
        // Recipe is a list with type recipe
        if(filterBy.type ==='recipe'){
            criteria.type = 'recipe'
            criteria.visibility = 'public'
            return await collection.find(criteria).project({items:false}).toArray()
        }

        return await collection.find(criteria).toArray()

    } catch (err) {
        logger.error('cannot find list', err)
        throw err
    }
}

async function getById(listId, loggedInUser) {
    console.log('list.service.js getById listId:', listId);
    try {
        const collection = await dbService.getCollection(collectionName)

        listId = mongoId(listId)
        const list = await collection.findOne({ _id: listId })
        if (list.owner.id !== loggedInUser._id && list.visibility === 'private') {
            throw new Error('Unauthorized')
        }

        return list
    } catch (err) {
        logger.error(`while finding list ${listId}`, err)
        throw err
    }
}

async function remove(listId) {
    try {
        const collection = await dbService.getCollection(collectionName)
        listId = mongoId(listId)
        await collection.deleteOne({ _id: listId })
        return listId
    } catch (err) {
        logger.error(`cannot remove list ${listId}`, err)
        throw err
    }
}

async function add(list) {

    try {
        const collection = await dbService.getCollection(collectionName)
        await collection.insertOne(list)
        return list
    } catch (err) {
        logger.error('cannot insert list', err)
        throw err
    }
}

async function update(list, listId) {
    try {
        const collection = await dbService.getCollection(collectionName)
        //TODO: take only the fields that can be updated
        const listToSave = { ...list }
        // _id field is immutable
        delete listToSave._id
        await collection.updateOne({ _id: mongoId(listId) }, { $set: listToSave })
        return list
    } catch (err) {
        logger.error(`cannot update list ${list._id}`, err)
        throw err
    }
}


export const listService = {
    remove,
    query,
    getById,
    add,
    update,

}
