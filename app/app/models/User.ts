import {Model} from 'rektia'

export default class User extends Model<{
    id: number,
    display_name: string
}> {}
