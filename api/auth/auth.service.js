import Cryptr from 'cryptr'
import bcrypt from 'bcryptjs'

import { userService } from '../user/user.service.js'
import { utilService } from '../../services/util.service.js'
import { logger } from '../../services/logger.service.js'
import { config } from '../../config/index.js'

const cryptr = new Cryptr(process.env.SECRET || 'Secret-Puk-1234')

export const authService = {
    signup,
    login,
    getLoginToken,
    validateToken,
    loginAsGuest
}

async function login(credentials, body) {

    try {

        const { email, password, googleID, loginType } = credentials

        logger.debug(`auth.service - login with ${loginType}: ${JSON.stringify(credentials)}`)
        const user = await userService.getByEmail(email)
        // service have not found a user
        if (!user && (loginType === 2)) {
            const user = await signup(body, loginType)
            return user

        }
        if (!user && (loginType !== 2)) return Promise.reject('Invalid username or password')

        // service have found a user
        if ((loginType === 1) && password) {
            const match = await bcrypt.compare(password, user.password)
            if (!match) return Promise.reject('Invalid username or password')

        }
        if (loginType === 2 && googleID) {

            if (user.googleID !== googleID) {
                return Promise.reject('Invalid email or password')
            }
            // signup with google

        }
        delete user.password
        user._id = user._id.toString()
        return user
    } catch (error) {
        logger.error('Failed to login from service ' + error)
        throw new Error('Failed to login')

    }
}

async function signup(userToAdd, signInType) {


    const { username, password, fullname, imgUrl, email, googleID } = userToAdd

    let userExist = null
    switch (signInType) {
        case 1:
            userExist = await userService.getByEmail(email)
            if (userExist) return Promise.reject('email already taken')

            logger.debug(`auth.service - signup with username: ${email}, fullname: ${fullname}`)
            if (!email || !password) return Promise.reject('Missing required signup information')
            break;

        case 2:
        case 3:
            userExist = await userService.getByEmail(email)
            if (userExist) return Promise.reject('email already taken')
            break;

        default:
            break;
    }

    return userService.add(userToAdd)
}

async function loginAsGuest() {
    const guestUser = {

        username: 'Guest-' + utilService.makeId(8) + '-' + utilService.makeId(8),
        password: 'Guest',
        fullname: 'Guest',
        imgUrl: 'https://ui-avatars.com/api/?name=Guest%user&rounded=true',
        role: 'guest'
    }

    const hash = await bcrypt.hash(guestUser.password, config.saltRounds)
    return await userService.add(guestUser)

}

function getLoginToken(user) {
    return cryptr.encrypt(JSON.stringify(user))
}

function validateToken(loginToken) {
    try {
        const json = cryptr.decrypt(loginToken)
        const loggedInUser = JSON.parse(json)
        return loggedInUser

    } catch (err) {
        console.log('Invalid login token')
        // throw new Error('Invalid login token')
    }
    return null
}


export function encryptPassword(password) {
    return cryptr.encrypt(password)
}

export function decryptPassword(password) {
    return cryptr.decrypt(password)
}
