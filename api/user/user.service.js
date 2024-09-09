import { dbService } from '../../services/db.service.js'
import { logger } from '../../services/logger.service.js'
import { utilService } from '../../services/util.service.js'
import { config } from '../../config/index.js'
import bcrypt from 'bcryptjs'
import mongodb from 'mongodb'
const { ObjectId } = mongodb
const mongoId = ObjectId.createFromHexString

const collectionName = 'user'
export const userService = {
    add,            // Create (Signup)
    getById,        // Read (Profile page)
    update,         // Update (Edit profile)
    remove,         // Delete (remove user)
    query,          // List (of users)
    getByEmail,   // Used for Login in DEV
    getEmptyUser

}

async function query(filterBy = {}) {
    // const criteria = _buildCriteria(filterBy)
    try {
        const collection = await dbService.getCollection(collectionName)
        var users = await collection.find({}, { projection: { password: false } }).toArray()
        return users
    } catch (err) {
        logger.error('cannot find users', err)
        throw err
    }
}


async function getById(userId) {
    try {
        const collection = await dbService.getCollection(collectionName)
        const user = await collection.findOne({ _id: mongoId(userId) })


        return user
    } catch (err) {
        logger.error(`while finding user by id: ${userId}`, err)
        throw err
    }
}


// This is just for login purposes
async function getByEmail(email) {
    try {
        const collection = await dbService.getCollection(collectionName)
        const user = await collection.findOne({ email })
        return user
    } catch (err) {
        logger.error(`while finding user by username: ${username}`, err)
        throw err
    }
}

async function remove(userId) {
    try {
        const collection = await dbService.getCollection(collectionName)
        userId = mongoId(userId)
        await collection.deleteOne({ _id: userId })
    } catch (err) {
        logger.error(`cannot remove user ${userId}`, err)
        throw err
    }
}

async function update(user) {
    try {
        // peek only updatable properties

        const keysToUpdate = ['username', 'email', 'settings', 'labels', 'labelOrder', 'history', 'age', 'achievements', 'points', 'level', 'settings', 'goals']

        let userToSave = keysToUpdate.reduce((acc, key) => {
            if (user[key]) acc[key] = user[key]
            return acc
        }, {})

        userToSave._id = mongoId(user._id)
        const collection = await dbService.getCollection(collectionName)
        await collection.updateOne({ _id: userToSave._id }, { $set: userToSave })
        return userToSave
    } catch (err) {
        logger.error(`cannot update user ${user._id}`, err)
        throw err
    }
}

async function add(user) {
    try {

        user = getEmptyUser(user)
        const hash = await bcrypt.hash(user.password, config.saltRounds)
        user.password = hash

        const collection = await dbService.getCollection(collectionName)
        const result = await collection.insertOne(user)
        user._id = result.insertedId.toString()
        delete user.password


        return user
    } catch (err) {
        logger.error('cannot add user', err)
        throw err
    }
}

function getEmptyUser({ username, password, imgUrl, email, googleID }) {
    return {
        username,
        email,
        password: password || utilService.makeId(8),
        goals: [],
        settings: {
            lang: "he",
            notifications: true,
            isVegan: false,
            isVegetarian: false,
            isGlutenFree: false,
            isLactoseFree: false,
            isKosher: false
        },
        level: 1,
        points: 0,
        achievements: [],
        selectedItems: [],
        imgUrl: imgUrl || 'https://ui-avatars.com/api/?name=Guest%user&rounded=true',
        age: null,
        city: "",
        labels: [],
        history: [],
        personalTxt: "",
        role: "user",
        exItems: [],
        googleID: googleID || ''
    }

}




// function _buildCriteria(filterBy) {
//     const criteria = {}
//     if (filterBy.txt) {
//         const txtCriteria = { $regex: filterBy.txt, $options: 'i' }
//         criteria.$or = [
//             {
//                 username: txtCriteria
//             },
//             {
//                 fullname: txtCriteria
//             }
//         ]
//     }
//     if (filterBy.minBalance) {
//         criteria.score = { $gte: filterBy.minBalance }
//     }
//     return criteria
// }




