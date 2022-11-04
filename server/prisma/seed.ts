import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const user = await prisma.user.create({
        data: {
            name: 'Alice',
            email: 'alice@email.com',
            avatarUrl: 'https://i.imgur.com/7Zq4W1M.jpg'
        }
    })

    const pool = await prisma.pool.create({
        data: {
            title: 'Example Pool',
            code: 'FODAKK',
            ownerId: user.id,

            participants: {
                create: {
                    userId: user.id,
                }
            }
        }
    })

    await prisma.game.create({
        data: {
            date: '2022-11-02T12:00:00.000Z',
            firstTeamCountryCode: 'FR',
            secondTeamCountryCode: 'DE',
        }
    })

    await prisma.game.create({
        data: {
            date: '2022-11-03T12:00:00.000Z',
            firstTeamCountryCode: 'BR',
            secondTeamCountryCode: 'AR',

            guesses: {
                create: {
                    firstTeamPoints: 2,
                    secondTeamPoints: 1,
                    
                    participant: {
                        connect: {
                            userId_poolId: {
                                userId: user.id,
                                poolId: pool.id
                            }
                        }
                    }
                }
            }
        }
    })
}

main()