import { extraParams, errorObject, ErrorTitle } from 'utils/api';
import { aggregate } from 'model/redis/rediSearch';
import { MOVIES_INDEX } from 'model/movies';

const validParams = {
    'genres' : 'genres',
    'generos' : 'genres_spanish',
    'directors' : 'directors',
    'writers' : 'writers',
    'actors' : 'cast',
    'film_series' : 'film_series'
};

export default async function handler(req, res) {
    const { param } = req.query;

    if (Object.keys(req.query).length != 1) {
      res.status(400).json(extraParams());
    }
    else if (!validParams.hasOwnProperty(param)) {
      res.status(400).json(errorObject(ErrorTitle.BAD_REQUEST, 'Unrecognized parameter'));
    }
    else {
      const response = await aggregate(MOVIES_INDEX, validParams[param]);
      res.status(200).json(response);
    }
}