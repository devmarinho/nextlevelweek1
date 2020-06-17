import express from "express";
import PointController from './controllers/pointsController'
import ItemsController from './controllers/itemsController'

const routes = express.Router();
const pointController = new PointController();
const itemController = new ItemsController();


routes.get('/items',itemController.index);
routes.post('/points', pointController.createPoint)
routes.get('/points/:id', pointController.showPoint)

export default routes