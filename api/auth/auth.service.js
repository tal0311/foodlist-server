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

async function login({ email, password, googleID, loginType }) {
    logger.debug(`auth.service - login with email: ${email}`)
    const user = await userService.getByEmail(email)
    if (!user) return Promise.reject('Invalid email or password')
    // TODO: un-comment for real login
    if (loginType===1 &&  googleID) {
        if (user.googleID !== googleID) return Promise.reject('Invalid email or password')
        // signup with google
    }
    if(loginType ===2 && password){
        const match = await bcrypt.compare(password, user.password)
        if (!match) return Promise.reject('Invalid username or password')

    }


    user._id = user._id.toString()
    console.log('user:', user);
    
    return user
}



async function signup({ username, password, fullname, imgUrl, email }) {


    logger.debug(`auth.service - signup with username: ${username}, fullname: ${fullname}`)
    if (!username || !password || !fullname) return Promise.reject('Missing required signup information')

    const userExist = await userService.getByEmail(username)
    if (userExist) return Promise.reject('Username already taken')

    const hash = await bcrypt.hash(password, config.saltRounds)
    console.log(hash);
    return userService.add({ username, password: hash, fullname, imgUrl, email })
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
