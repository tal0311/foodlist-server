import { listService } from './list.service.js'
import { logger } from '../../services/logger.service.js'

export async function getLists(req, res) {
  try {
    logger.debug('Getting Lists:', req.query)
    const filterBy = {
      txt: req.query.txt || '',
      type: req.query.type || '',
      admin: req.query.admin || '',
      visibility: req.query.visibility || ''
    }
    const { loggedInUser } = req
    const lists = await listService.query(filterBy, loggedInUser)

    res.json(lists)

  } catch (err) {
    logger.error('Failed to get lists', err)
    res.status(400).send({ err: 'Failed to get lists' })
  }
}


export async function getListById(req, res) {
  try {
    const listId = req.params.id
    const { loggedInUser } = req
    const list = await listService.getById(listId, loggedInUser)
    res.json(list)
  } catch (err) {
    logger.error('Failed to get list', err)
    res.status(400).send({ err: 'Failed to get list' })
  }
}

export async function addList(req, res) {
  const { _id, username, imgUrl } = req.loggedInUser

  try {
    const list = req.body
    list.owner = { id: _id, username, imgUrl }

    const addedList = await listService.add(list)
    logger.info(`List ${list.name} was added`, addedList)
    res.json(list)
  } catch (err) {
    logger.error('Failed to add list', err)
    res.status(400).send({ err: 'Failed to add list' })
  }
}


export async function updateList(req, res) {
  try {
    const listId = req.params.id
    const list = req.body
    const updatedList = await listService.update(list, listId)
    res.json(updatedList)
  } catch (err) {
    logger.error('Failed to update list', err)
    res.status(400).send({ err: 'Failed to update list' })

  }
}

export async function removeList(req, res) {

  try {
    const listId = req.params.id
    logger.debug('Removing List:', listId)
    const { loggedInUser } = req
    await listService.getById(listId, loggedInUser)
    const removedId = await listService.remove(listId)
    res.send(removedId)
  } catch (err) {
    logger.error('Failed to remove list', err)
    res.status(400).send({ err: 'Failed to remove list' })
  }
}

