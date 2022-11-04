import Fastify from "fastify"
import cors from '@fastify/cors'
import jwt from "@fastify/jwt"
import { poolRoutes } from "./routes/pool"
import { userRoutes } from "./routes/user"
import { authRoutes } from "./routes/auth"
import { guessRoutes } from "./routes/guess"
import { gameRoutes } from "./routes/game"

const JWT_SECRET = process.env.JWT_SECRET;

async function bootstrap() {
    const fastify = Fastify({
        logger: true,
    })

    await fastify.register(cors, {
        origin: true,
    })

    if (!JWT_SECRET) throw new Error('JWT_SECRET is not defined');

    await fastify.register(jwt, {
        secret: JWT_SECRET,
    })

    await fastify.register(authRoutes)
    await fastify.register(gameRoutes)
    await fastify.register(guessRoutes)
    await fastify.register(poolRoutes)
    await fastify.register(userRoutes)

    await fastify.listen({ port: 3333, host: '0.0.0.0' })
}

bootstrap()
