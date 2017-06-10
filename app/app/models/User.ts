import {Model} from 'rektia'
import Item from '@models/Item'

export default class User extends Model<app.Entity.User> {
    @Model.hasMany(Item)
    items: Model.hasMany<app.Entity.Item>
}
