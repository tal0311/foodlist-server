import { dbService } from '../../services/db.service.js'
import { logger } from '../../services/logger.service.js'
import { utilService } from '../../services/util.service.js'
import { socketService } from '../../services/socket.service.js';
import { itemService } from '../item/item.service.js';

import { MongoClient, ObjectId } from 'mongodb';
const mongoId = ObjectId.createFromHexString;



const collectionName = 'list'

async function query(filterBy = { txt: '', type: '', admin: false }, loggedInUser) {

    try {
        const collection = await dbService.getCollection(collectionName)

        // if admin is true, return all lists from admin page
        if (filterBy.admin) {
            let lists = await collection.find({}).toArray()
            lists = await Promise.all(lists.map(async list => {
                list.items = await itemService.getItemsByIds(list.items)
                return list
            }));

            return lists
        }
        const criteria = {
            'owner.id': loggedInUser._id
        }
        // allow to search only public lists
        if (filterBy.visibility === 'public') {
            criteria.visibility = 'public'
            // this is to not show the user's lists
            delete criteria['owner.id'] 
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
    const listToSave = {
         title: list.title,
         items: list.items,
         owner: list.owner,
         visibility: 'private',
         createdAt: Date.now(),
         updatedAt: Date.now(),
     }
 
     try {
         const collection = await dbService.getCollection(collectionName)
         await collection.insertOne(listToSave)
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
