import * as _ from 'lodash'
import * as pluralize from 'pluralize'

import Entity from './Entity'

export const tableNameFromEntity = (model: typeof Entity) => {
    return model.tableName || _.snakeCase(pluralize.plural(model.name))
}

export const externalIdFieldNameFromEntity = (model: typeof Entity) =>{
    return _.snakeCase(model.tableName || _.snakeCase(model.name)) + '_id'
}
