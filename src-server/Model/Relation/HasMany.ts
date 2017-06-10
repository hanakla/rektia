import * as Knex from 'knex'
import * as Promise from 'bluebird'

import Database from '../../Database'
import Entity from '../Entity'
import {LazyCollection} from '../LazyCollection'
import RelationMetadata from './RelationMetadata'
import * as ModelUtils from '../ModelUtil'

export type hasManyType<T> = LazyCollection<T>

export default function hasMany(RelationModel: typeof Entity) {
    return (belongsModel: Entity, property: string) => {
        const BelongsModel = belongsModel.constructor as typeof Entity
        RelationMetadata.addHasManyProperty(BelongsModel, property, RelationModel)

        Object.defineProperty(belongsModel, property, {
            get (this: Entity) {
                const tableName = ModelUtils.tableNameFromEntity(BelongsModel)
                const havingTableName = ModelUtils.tableNameFromEntity(RelationModel)
                const foreignKey = ModelUtils.externalIdFieldNameFromEntity(BelongsModel)

                const knex = Database.getConnection()
                return knex(havingTableName).select().where({[foreignKey]: this.get('id')})
            }
        })
    }
}

export function hasManyForBuilder(
    RelationModel: typeof Entity,
    queryBuilder: Knex.QueryBuilder,
    property: string,
    BelongsModel: typeof Entity,
    foreignKeyId: number
) {
    Object.defineProperty(queryBuilder, property, {
        get (this: Entity) {
            const tableName = ModelUtils.tableNameFromEntity(BelongsModel)
            const havingTableName = ModelUtils.tableNameFromEntity(RelationModel)
            const foreignKey = ModelUtils.externalIdFieldNameFromEntity(BelongsModel)

            const knex = Database.getConnection()
            return knex(havingTableName).select().where({[foreignKey]: foreignKeyId})
        }
    })
}
