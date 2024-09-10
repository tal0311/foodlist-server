import { dbService } from '../../services/db.service.js'
import { logger } from '../../services/logger.service.js'
import { utilService } from '../../services/util.service.js'
import { socketService } from '../../services/socket.service.js';
import { userService } from '../user/user.service.js';


import { ObjectId } from 'mongodb';
const mongoId = ObjectId.createFromHexString;



const collectionName = 'trans'
// TODO:fix items filter for user prefs and labels (still showing non kosher group name)
async function query() {
    try {
        const collection = await dbService.getCollection(collectionName)
        const transItems = await collection.find({}).project({'foodlist':true}).toArray()
        return transItems[0].foodlist
    } catch (error) {
        logger.error('cannot find items', error)
        throw error

    }


}

async function getById(itemId) {
    console.log('item.service.js getById itemId:', itemId);
    try {
        const collection = await dbService.getCollection(collectionName)
        itemId = mongoId(itemId)
        const item = await collection.findOne({ _id: itemId })
        return item
    } catch (err) {
        logger.error(`while finding item ${itemId}`, err)
        throw err
    }
}

async function remove(itemId) {
    try {
        const collection = await dbService.getCollection(collectionName)
        itemId = mongoId(itemId)
        await collection.deleteOne({ _id: itemId })
        return itemId
    } catch (err) {
        logger.error(`cannot remove item ${itemId}`, err)
        throw err
    }
}

async function add(translation) {
    try {
        const collection = await dbService.getCollection(collectionName); // Replace with your actual collection name
        const _id = '66dfe8806c4093e91bca3d48'; // Replace with your actual _id for the document

        // Check if the key exists in the foodlist
        const existingDoc = await collection.findOne(
            { _id: mongoId(_id), [`foodlist.${translation.name}`]: { $exists: true } }
        );

        if (existingDoc) {
            // Key already exists
            throw new Error(`The key ${translation.name} already exists in the foodlist.`);
        }

        // Prepare the new translation object
        const transItems = {
            [`foodlist.${translation.name}`]: {
                he: translation.he.val,
                es: translation.es.val,
                en: translation.en.val
            }
        };

        // Update the document by adding the new translation
        const result = await collection.updateOne(
            { _id: mongoId(_id) },
            { $set: transItems }
        );

        return result;
    } catch (err) {
        console.error('Cannot insert item', err);
        throw err;
    }
}


async function update(item) {
    try {


        const collection = await dbService.getCollection(collectionName)
        const itemToSave = { ...item }
        // _id field is immutable
        delete itemToSave._id
        await collection.updateOne({ _id: mongoId(item._id) }, { $set: itemToSave })
        return item
    } catch (err) {
        logger.error(`cannot update item ${item._id}`, err)
        throw err
    }
}


function getEmptyItem() {
    return {
        name: '',
        icon: '',
        group: '',
        readMoreURL: '',
        color: '',
        isSelected: false,
    }
}


export const transService = {
    remove,
    query,
    getById,
    add,
    update,
    // getItemsByIds,
}
