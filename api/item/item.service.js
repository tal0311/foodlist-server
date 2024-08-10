import { dbService } from '../../services/db.service.js'
import { logger } from '../../services/logger.service.js'
import { utilService } from '../../services/util.service.js'
import { socketService } from '../../services/socket.service.js';
import { userService } from '../user/user.service.js';


import { ObjectId } from 'mongodb';
const mongoId = ObjectId.createFromHexString;



const collectionName = 'item'

async function query(filterBy = { txt: '', type: '' }, loggedInUser) {

    const { settings } = loggedInUser

    try {
        const collection = await dbService.getCollection(collectionName)

        if (filterBy.labels) {
            const items = await collection.aggregate([
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

            const user = await setLabels(itemMap, loggedInUser._id)
            console.log(user);
            return filterByUserSettings(settings, itemMap)
        }

        const items = await collection.find({})
        return items.toArray()

    } catch (err) {
        logger.error('cannot find items', err)
        throw err
    }
}

function filterByUserSettings(settings, itemsByLabels) {

    const filterLabels = []
    for (const key in settings) {
        const exclude = ['lang', 'notifications']
        if (settings[key] && !exclude.includes(key)) {
            filterLabels.push(key)
        }
    }

    filterLabels.forEach(prefs => {
        if (prefs === 'isVegan') {
            const noneVeganGroups = ['meat-and-poultry', 'dairy', 'eggs', 'fish', 'honey', 'seafood']
            noneVeganGroups.forEach(group => {
                itemsByLabels[group] && delete itemsByLabels[group]
            })
        }
        if (prefs === 'isGlutenFree') {
            const noneGlutenFreeGroups = ['bread', 'pasta', 'cereal', 'flour', 'baked-goods']
            noneGlutenFreeGroups.forEach(group => {
                itemsByLabels[group] && delete itemsByLabels[group]
            })
        }
        if (prefs === 'isVegetarian') {
            const noneVegetarianGroups = ['meat-and-poultry', 'fish', 'seafood']
            noneVegetarianGroups.forEach(group => {
                itemsByLabels[group] && delete itemsByLabels[group]
            })
        }
        if (prefs === 'isKosher') {
            const noneKosherGroups = ['seafood']
            noneKosherGroups.forEach(group => {
                itemsByLabels[group] && delete itemsByLabels[group]
            })
        }
    })

    return itemsByLabels

}


async function setLabels(list, userId) {

    const user = await userService.getById(userId)
    user._id = user._id.toString()
    // console.log('labels:', user);

    user.labels = !user.labels || user.labels.length !== Object.keys(list).length ? Object.keys(list).map(label => ({ name: label, userInput: "" })) : user.labels;
    user.labels = Object.keys(list).map(label => ({ name: label, userInput: "" }));
    user.labelOrder = !user.labelOrder || user.labelOrder.length != user.labels.length ? user.labels.map(label => label.name) : user.labelOrder;

    // Send socket event to update user in client
    // console.log('**EMITING**', 'update-user', user);
    
    socketService.emitToUser({ type:'update-user',data: user,userId: user._id})
    userService.update(user);
    return user

}

async function getItemsByIds(itemIds) {
    try {
        
        const collection =await dbService.getCollection(collectionName)
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

async function add({ name ='', icon='', group='', readMoreURL='', color='', isSelected='' }) {

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
        const item= await collection.insertOne(itemToAdd)
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


function getEmptyItem(){
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
