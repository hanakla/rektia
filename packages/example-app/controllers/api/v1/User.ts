import { Context } from "@ragg/rektia";
import { User } from "../../../models/User";
import { registerUser } from "../../../services/registerUser";

export const create = async (ctx: Context) => {
  const form = UserForm.create(ctx.params);
  await form.validate();
  await registerUser(form);
};

export const show = async (ctx: Context) => {
  ctx.type = "application/json";
  ctx.body = JSON.stringify(await User.find(1));
  console.log(ctx.body);

  caches;
};
