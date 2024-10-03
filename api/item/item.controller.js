import { itemService } from './item.service.js'
import { logger } from '../../services/logger.service.js'
import { transService } from '../trans/trans.service.js'
import { utilService } from '../../services/util.service.js'



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
  const { name, translation, icon, color, group, readMoreUrl, isSelected } = req.body
  try {
   
    const item =  utilService.modifyItemForSave({ name, icon, color, group, readMoreUrl, isSelected })
    const addedItem = await itemService.add(item)
    await transService.add({ ...translation, name: item.name })

    logger.admin('Adding item', addedItem)
    res.json(addedItem)

    // res.json(item)
  } catch (err) {
    logger.error('Failed to add item', err)
    res.status(400).send({ err: 'Failed to add item' })
  }
}

export async function updateItem(req, res) {
  try {
    const { _id, name, color, readMoreUrl, icon, isSelected, group ,translation} = req.body

    const item =  utilService.modifyItemForSave({_id, name, icon, color, group, readMoreUrl, isSelected })
    const updatedItem = await itemService.update(item)
    translation&& await transService.add({ ...translation, name: item.name })
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





