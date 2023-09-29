import z, { array } from "zod";
import { db, validateCollection } from "./mongodb";
import { Request } from "express";
import { ConsoleLogger } from "./lib/logger";
import { OptionalId } from "mongodb";

const logger = new ConsoleLogger("user");

export const UserStateSchema = z.enum([
  "dj", // can only add songs
  "admin", // can add, remove and reorder songs
]);

export type UserState = z.infer<typeof UserStateSchema>;

export const ipSchema = z.string().ip();
export type IP = z.infer<typeof ipSchema>;

export const UserSchema = z.object({
  ip: ipSchema,
  name: z.string(),
  state: UserStateSchema,
});

export type User = z.infer<typeof UserSchema>;

export const userCollection = db.collection<User>("users");
validateCollection(userCollection, UserSchema);

//INIT
(async () => {
  if (!(await userCollection.findOne({ ip: "::1" }))) {
    logger.info(`No admin user found. Initializing Database`);
    await userCollection.insertOne({
      ip: "::1",
      name: "ADMIN",
      state: "admin",
    });
  }
})();

export function getIp(req: Request<any, any, any>): IP | undefined {
  let ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  if (!ip) return undefined;
  let ipParsed = ipSchema.parse(ip);
  if (ipParsed.startsWith("::ffff:")) ipParsed = ipParsed.slice(7);
  return ipParsed;
}

export async function checkUser(
  req: Request<any, any, any>
): Promise<User | undefined> {
  let ip = getIp(req);

  logger.debug(`IP: ${ip}`);

  const user: OptionalId<User> | null = await userCollection.findOne({ ip });
  if (!user) return undefined;
  delete user._id;
  return user;
}
