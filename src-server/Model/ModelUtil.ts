import * as _ from 'lodash'
import * as pluralize from 'pluralize'

import Model from './Model'

export const tableNameFromModel = (model: typeof Model) => {
    return this.tableName || _.snakeCase(pluralize.plural(this.name))
}
