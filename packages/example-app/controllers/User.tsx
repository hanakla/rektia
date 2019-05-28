import { Context, Route } from "@ragg/rektia";
import AppController from "./AppController";
import { User } from "../models/User";

export default class Users extends AppController {
  @Route.GET("/users/:userId")
  async index(ctx: Context) {
    const { userId } = ctx.params;
    const user = await User.find(userId);
    ctx.body = user.toJSON();
  }
}
