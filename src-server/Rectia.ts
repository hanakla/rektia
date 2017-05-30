import Koa from 'koa'
import Knex from 'knex'
import * as LoaderUtil from './Utils/LoaderUtil'

export default class Rectia extends Koa {
    private knex: Knex

    public listen(...args)
    {
        // Connect DB
        this.knex = Knex({

        })

        Koa.prototype.listen.apply(this, args)
    }
}
