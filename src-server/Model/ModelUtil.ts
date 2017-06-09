import * as _ from 'lodash'
import * as pluralize from 'pluralize'

import Model from './Model'

export const tableNameFromModel = (model: typeof Model) => {
    return model.tableName || _.snakeCase(pluralize.plural(model.name))
}

export const externalIdFieldNameFromModel = (model: typeof Model) =>{
    return _.snakeCase(model.tableName || _.snakeCase(model.name)) + '_id'
}
