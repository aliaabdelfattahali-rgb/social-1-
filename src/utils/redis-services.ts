import { redisClient } from "../DB/redis.connection.js";

export const redisSet = async (
  key: string,
  value: string,
  ttlSeconds?: number
): Promise<void> => {
  if (ttlSeconds) {
    await redisClient.set(key, value, { EX: ttlSeconds });
  } else {
    await redisClient.set(key, value);
  }
};

export const redisGet = async (key: string): Promise<string | null> => {
  const value = await redisClient.get(key);
  return value;
};

export const redisDel = async (key: string): Promise<void> => {
  await redisClient.del(key);
};

export const redisExists = async (key: string): Promise<boolean> => {
  const exists = await redisClient.exists(key);
  return exists === 1;
};

export const redisTTL = async (key: string): Promise<number> => {
  const ttl = await redisClient.ttl(key);
  return ttl;
};

export const redisExpire = async (
  key: string,
  seconds: number
): Promise<void> => {
  await redisClient.expire(key, seconds);
};
