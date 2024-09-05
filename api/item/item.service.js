import { dbService } from '../../services/db.service.js'
import { logger } from '../../services/logger.service.js'
import { utilService } from '../../services/util.service.js'
import { socketService } from '../../services/socket.service.js';
import { userService } from '../user/user.service.js';


import { ObjectId } from 'mongodb';
const mongoId = ObjectId.createFromHexString;



const collectionName = 'item'
// TODO:fix items filter for user prefs and labels (still showing non kosher group name)
async function query(filterBy = { txt: '', type: '', labels: '' }, loggedInUser) {

    const { settings, labelsOrder, labels ,exItems} = loggedInUser
    const objectIdExItems = exItems?.map(id => mongoId(id));
    try {
        const collection = await dbService.getCollection(collectionName)
        if (filterBy.labels) {
            const items = await collection.aggregate([
                {
                    $match: {
                        _id: { $nin: objectIdExItems || [] } //array of items to exclude or empty array as default
                    }
                },
                {
                    $group: {
                        _id: "$group",
                        items: { $push: "$$ROOT" }
                    }
                },

            ]).toArray()

           

            let itemMap = items.reduce((acc, itemGroup) => {
                acc[itemGroup._id] = itemGroup.items;
                return acc
            }, {});

            const updatedUser = await setLabels(itemMap, loggedInUser._id)

            return filterByUserSettings(updatedUser, itemMap)
        }

        const items = await collection.find({})
        return items.toArray()

    } catch (err) {
        logger.error('cannot find items', err)
        throw err
    }
}

async function filterByUserSettings(user, itemsByLabels) {
    let { settings, _id } = user

    const filterLabels = []
    for (const key in settings) {
        const exclude = ['lang', 'notifications']
        if (settings[key] && !exclude.includes(key)) {
            filterLabels.push(key)
        }
    }

    const nonItemsMap = {
        'isVegan': ['meat-and-poultry', 'dairy', 'eggs', 'fish', 'honey', 'seafood'],
        'isGlutenFree': ['bread', 'pasta', 'cereal', 'flour', 'baked-goods'],
        'isVegetarian': ['meat-and-poultry', 'fish', 'seafood'],
        'isKosher': ['seafood']
    }
    
    filterLabels.forEach(prefs => {
        nonItemsMap[prefs].forEach(group => {

            user.labelOrder = user.labelOrder.filter(label => label !== group);
            user.labels = user.labels.filter(label => label.name !== group);

            delete itemsByLabels[group];
        });

    });

    socketService.emitToUser({ type: 'update-user', data: user, userId: _id })
    await userService.update(user);

    return itemsByLabels

}


async function setLabels(list, userId) {
    try {

        const user = await userService.getById(userId)
        user._id = user._id.toString()


        user.labels = !user.labels || user.labels.length !== Object.keys(list).length ? Object.keys(list).map(label => ({ name: label, userInput: "" })) : user.labels;

        user.labelOrder = !user.labelOrder || user.labelOrder.length != user.labels.length ? user.labels.map(label => label.name) : user.labelOrder;


        return user
    } catch (error) {
        logger.error('cannot set labels', error)

    }


}

async function getItemsByIds(itemIds) {
    try {

        const collection = await dbService.getCollection(collectionName)
        const itemIdsToQuery = itemIds.map(itemId => mongoId(itemId))
        return await collection.find({ _id: { $in: itemIdsToQuery } }).toArray()
    } catch (error) {
        logger.error('cannot find items', err)
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

async function add({ name = '', icon = '', group = '', readMoreURL = '', color = '', isSelected = '' }) {

    try {


        const itemToAdd = {
            name,
            icon,
            group,
            readMoreURL,
            color,
            isSelected,
        }


        const collection = await dbService.getCollection(collectionName)
        const item = await collection.insertOne(itemToAdd)
        return item
    } catch (err) {
        logger.error('cannot insert item', err)
        throw err
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


export const itemService = {
    remove,
    query,
    getById,
    add,
    update,
    getItemsByIds,
}
