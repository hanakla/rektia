import {Model} from 'rektia'
import Item from '@models/Item'

export default class User extends Model<app.Model.User> {
    @Model.hasMany(Item)
    items: Model.hasMany<app.Model.Item>
}
