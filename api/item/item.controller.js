import { itemService } from './item.service.js'
import { logger } from '../../services/logger.service.js'



export async function getItems(req, res) {
  try {
    logger.debug('Getting Items:', req.query)

    const filterBy = req.query
    const { loggedInUser } = req
   
    
    const items = await itemService.query(filterBy, loggedInUser)
  // console.log('items:', items);
  
    res.json(items)
  } catch (err) {
    logger.error('Failed to get items', err)
    res.status(400).send({ err: 'Failed to get items' })
  }
}

export async function getItemById(req, res) {
  try {
    const itemId = req.params.id
    const item = await itemService.getById(itemId)
    logger.admin('Getting item', item)
    res.json(item)
  } catch (err) {
    logger.error('Failed to get item', err)
    res.status(400).send({ err: 'Failed to get item' })
  }
}

export async function addItem(req, res) {
  const { loggedInUser } = req

  try {
    const item = req.body

    console.log('item:', item);
    const addedItem = await itemService.add(item)
    logger.admin('Adding item', addedItem)
    res.json(addedItem)
  } catch (err) {
    logger.error('Failed to add item', err)
    res.status(400).send({ err: 'Failed to add item' })
  }
}

export async function updateItem(req, res) {
  try {
    const { _id, name, color, readMoreUrl, icon, isSelected } = req.body

    const item = { _id, name, color, readMoreUrl, icon, isSelected }
    const updatedItem = await itemService.update(item)
    logger.admin('Updating item', updatedItem)
    res.json(updatedItem)

  } catch (err) {
    logger.error('Failed to update item', err)
    res.status(400).send({ err: 'Failed to update item' })

  }
}

export async function removeItem(req, res) {
  try {
    const itemId = req.params.id
    const removedId = await itemService.remove(itemId)
    logger.admin('Removing item', removedId)
    res.send(removedId)
  } catch (err) {
    logger.error('Failed to remove item', err)
    res.status(400).send({ err: 'Failed to remove item' })
  }
}





