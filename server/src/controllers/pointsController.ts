import { Request, Response } from 'express';
import knex from '../database/connection';

class PointsController {
    async index(request: Request,response: Response){

    }
    async showPoint(request: Request,response: Response){

      const { id } = request.params;
      const point = await knex('points').where('id',id).first();
      if(!point) return response.status(400).json({message: "Point not found."});
      const items = await knex('items')
      .join('point_items','items.id','=','point_items.item_id')
      .where('point_items.point_id',id)
      .select('items.title');

      return response.json({point,items});
    }
    async createPoint(request: Request,response: Response)  {
        const {
          name,
          email,
          whatsapp,
          city,
          uf,
          latitude,
          longitude,
          items
        } = request.body
      
        const trx = await knex.transaction();
        const point = {
          image: 'image-fake',
          name,
          email,
          whatsapp,
          city,
          uf,
          latitude,
          longitude
        };
        const ids = await trx('points').insert(point)
          
        const pointItems = items.map((item_id: number ) => {
          return {
            item_id,
            point_id: ids[0],
          }
        });
      
        await trx('point_items').insert(pointItems)

        trx.commit();
        return response.json({
            id: ids[0],
          ...point,
        });
    }
}
export default PointsController;
