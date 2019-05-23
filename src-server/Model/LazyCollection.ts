import * as Knex from 'knex'

export type LazyCollection<T> = Promise<T> & Knex.QueryBuilder
