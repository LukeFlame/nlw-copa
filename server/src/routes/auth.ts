import { FastifyInstance } from "fastify"
import { z } from "zod"
import axios from "axios"
import { prisma } from "../lib/prisma"
import { authenticate } from "../plugins/authenticate"

export async function authRoutes(fastify: FastifyInstance) {
    fastify.get(
        '/me',
        { onRequest: [authenticate] },
        async (request, reply) => {
            return { user: request.user }
        })

    fastify.post('/users', async (request, reply) => {
        const createUserBody = z.object({
            access_token: z.string(),
        })

        const { access_token } = createUserBody.parse(request.body)

        const userData = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: {
                Authorization: `Bearer ${access_token}`
            }
        }).catch(() => {
            return reply.status(401).send({ message: 'Invalid access token' })
        })

        const userInfoSchema = z.object({
            id: z.string(),
            email: z.string().email(),
            name: z.string(),
            picture: z.string().url(),
        })

        const userInfo = userInfoSchema.parse(userData.data)

        let user = await prisma.user.findFirst({
            where: {
                googleId: userInfo.id
            }
        })

        if (!user) {
            user = await prisma.user.create({
                data: {
                    googleId: userInfo.id,
                    email: userInfo.email,
                    name: userInfo.name,
                    avatarUrl: userInfo.picture,
                }
            })
        }

        const token = fastify.jwt.sign({
            name: user.name,
            avatarUrl: user.avatarUrl,
        }, {
            sub: user.id,
            expiresIn: '7 days'
        })

        return {token}
    }) 
}