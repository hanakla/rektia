import { Context } from "@ragg/rektia";
import User from "@models/User";

export const show = async (ctx: Context) => {
  ctx.type = "application/json";
  ctx.body = JSON.stringify(await User.find(1));
  console.log(ctx.body);

  caches;
};
