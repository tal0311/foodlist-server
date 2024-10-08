import http from 'http'
import path from 'path'
import cors from 'cors'
import 'dotenv/config';


import express from 'express'
import cookieParser from 'cookie-parser'

const app = express()
const server = http.createServer(app)

// Express App Config
app.use(cookieParser())
app.use(express.json())


let corsOptions = {}
if (process.env.NODE_ENV === 'production') {
    
    corsOptions = {
        origin: 'https://morena-food-list.vercel.app',
        credentials: true,
    }
} else {
    corsOptions = {
        origin: [
            'http://127.0.0.1:3000',
            'http://localhost:3000',
            'http://localhost:5173',
            'http://127.0.0.1:5173',
            'http://localhost:5174',
            'http://127.0.0.1:5174',
        ],
        credentials: true,
    }
}

app.use(cors(corsOptions))

;

import { authRoutes } from './api/auth/auth.routes.js'
import { userRoutes } from './api/user/user.routes.js'
import { itemRoutes } from './api/item/item.routes.js';
import { recipeRoutes } from './api/recipe/recipe.routes.js';
import { transRoutes } from './api/trans/trans.routes.js';

import { listRoutes } from './api/list/list.routes.js'
import { setupSocketAPI } from './services/socket.service.js'

// routes
import { setupAsyncLocalStorage } from './middlewares/setupAls.middleware.js'
app.all('*', setupAsyncLocalStorage)

app.use('/api/auth', authRoutes)
app.use('/api/user', userRoutes)
app.use('/api/list', listRoutes)
app.use('/api/recipe', recipeRoutes)
app.use('/api/item', itemRoutes)
app.use('/api/trans', transRoutes)
setupSocketAPI(server)

// Make every server-side-route to match the index.html
// so when requesting http://localhost:3030/index.html/account/123 it will still respond with
// our SPA (single page app) (the index.html file) and allow vue/react-router to take it from there
app.get('/**', (req, res) => {
    // res.sendFile(path.resolve('public/index.html'))

    // logger.info('Someone entered the site')
    // If client is in different domain redirect to the client
    res.redirect('https://morena-food-list.vercel.app')
})


import { logger } from './services/logger.service.js'
import { log } from './middlewares/logger.middleware.js';

const port = process.env.PORT || 3030
server.listen(port, () => {
    logger.info('Server is running on port: ' + port)
})