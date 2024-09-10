import { transService } from './trans.service.js'
import { logger } from '../../services/logger.service.js'



export async function getTrans(req, res) {
  try {
    logger.debug('Getting Trans for app items:')

    const filterBy = req.query
    const { loggedInUser } = req


    const trans = await transService.query(filterBy, loggedInUser)
    // console.log('transs:', transs);

    res.json(trans)
  } catch (err) {
    logger.error('Failed to get trans', err)
    res.status(400).send({ err: 'Failed to get transs' })
  }
}

export async function getTransById(req, res) {
  try {
    const transId = req.params.id
    const trans = await transService.getById(transId)
    logger.admin('Getting trans', trans)
    res.json(trans)
  } catch (err) {
    logger.error('Failed to get trans', err)
    res.status(400).send({ err: 'Failed to get trans' })
  }
}

export async function addTrans(req, res) {
  const { loggedInUser } = req
  const {translation} = req.body
  
  try {
    
     const addedTrans = await transService.add(translation)

    res.json(addedTrans)

    // res.json(trans)
  } catch (err) {
    logger.error('Failed to add trans', err)
    res.status(400).send({ err: 'Failed to add trans' })
  }
}

export async function updateTrans(req, res) {
  try {
    const { _id, name, color, readMoreUrl, icon, isSelected } = req.body
    const trans = { _id, name, color, readMoreUrl, icon, isSelected }
    const updatedTrans = await transService.update(trans)
    logger.admin('Updating trans', updatedTrans)
    res.json(updatedTrans)

  } catch (err) {
    logger.error('Failed to update trans', err)
    res.status(400).send({ err: 'Failed to update trans' })

  }
}

export async function removeTrans(req, res) {
  try {
    const transId = req.params.id
    const removedId = await transService.remove(transId)
    logger.admin('Removing trans', removedId)
    res.send(removedId)
  } catch (err) {
    logger.error('Failed to remove trans', err)
    res.status(400).send({ err: 'Failed to remove trans' })
  }
}





