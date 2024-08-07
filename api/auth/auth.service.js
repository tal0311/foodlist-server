import Cryptr from 'cryptr'
import bcrypt from 'bcryptjs'

import {userService} from '../user/user.service.js'
import {logger} from '../../services/logger.service.js'

const cryptr = new Cryptr(process.env.SECRET || 'Secret-Puk-1234')

export const authService = {
    signup,
    login,
    getLoginToken,
    validateToken
}

async function login(email, password, jwt) {
    logger.debug(`auth.service - login with email: ${email}`)
      const user = await userService.getByUsername(email)
    if (!user) return Promise.reject('Invalid email or password')
    // TODO: un-comment for real login
    // const match = await bcrypt.compare(password, user.password)
    // if (!match) return Promise.reject('Invalid username or password')


    user._id = user._id.toString()
    return user
}

async function signup({username, password, fullname, imgUrl, email}) {
    const saltRounds = 10

    logger.debug(`auth.service - signup with username: ${username}, fullname: ${fullname}`)
    if (!username || !password || !fullname) return Promise.reject('Missing required signup information')

    const userExist = await userService.getByUsername(username)
    if (userExist) return Promise.reject('Username already taken')

    const hash = await bcrypt.hash(password, saltRounds)
    console.log(hash);
    return userService.add({ username, password: hash, fullname, imgUrl, email })
}

function getLoginToken(user) {
    
    return cryptr.encrypt(JSON.stringify(user))    
}

function validateToken(loginToken) {
    try {
        const json = cryptr.decrypt(loginToken)
        const loggedInUser = JSON.parse(json)
        return loggedInUser

    } catch(err) {
        console.log('Invalid login token')
    }
    return null
}

export function encryptPassword(password) {
    return cryptr.encrypt(password)
}

export function decryptPassword(password) {
    return cryptr.decrypt(password)
}

// ;(async ()=>{
//     await signup('bubu', '123', 'Bubu Bi')
//     await signup('mumu', '123', 'Mumu Maha')
// })()