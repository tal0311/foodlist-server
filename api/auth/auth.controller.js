import { authService } from './auth.service.js'
import { logger } from '../../services/logger.service.js'
import { config } from '../../config/index.js'

export async function login(req, res) {
    const { type } = req.params
    const { email, password, googleID } = req.body

    try {
        const props = { email, password, googleID }
        props.loginType = config.loginTypes[type.toUpperCase()]
        if ((type === 'credentials') && (!email || !password)) {
            res.status(400).send({ err: 'Email and password are required' })
            return
        }

        if ((type === 'google') && (!googleID)) {
            res.status(400).send({ err: 'Can not login with Google' })
            return
        }
        const user = await authService.login(props, req.body)

        const loginToken = authService.getLoginToken(user)
        res.cookie('loginToken', loginToken, { sameSite: 'None', secure: true })
        res.json(user)
    } catch (err) {
        logger.error('Failed to Login from controller ' + err)
        res.status(401).send({ err: 'Failed to Login' })
    }
}

export async function signup(req, res) {
    try {
        const credentials = req.body

        console.log("♠️ ~ signup ~ req.body:", req.body)
        // Never log passwords
        // logger.debug(credentials)
        const account = await authService.signup(credentials)
        logger.debug(`auth.route - new account created: ` + JSON.stringify(account))
        const user = await authService.login(credentials.username, credentials.password)
        logger.info('User signup:', user)
        const loginToken = authService.getLoginToken(user)
        res.cookie('loginToken', loginToken, { sameSite: 'None', secure: true })
        res.json(user)
    } catch (err) {
        logger.error('Failed to signup ' + err)
        res.status(400).send({ err: 'Failed to signup' })
    }
}

export async function guestSignup(req, res) {

    try {
        const guestUser = await authService.loginAsGuest()
        const loginToken = authService.getLoginToken(guestUser)
        res.cookie('loginToken', loginToken, { sameSite: 'None', secure: true, expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) })
        res.json(guestUser)
    } catch (err) {
        logger.error('Failed to login as guest ' + err)
        res.status(400).send({ err: 'Failed to login as guest' })
    }
}

export async function logout(req, res) {
    try {
        res.clearCookie('loginToken')
        res.send({ msg: 'Logged out successfully' })
    } catch (err) {
        res.status(400).send({ err: 'Failed to logout' })
    }
}

