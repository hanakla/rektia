import { User } from "../models/User";

export const userSerializer = (user: User) => ({
    id: user.get('id'),
    name: user.get('name')
})