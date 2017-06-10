import * as Knex from 'knex'
import * as BluebirdPromise from 'bluebird'

export type LazyCollection<T> = BluebirdPromise<T> & Knex.QueryBuilder
