import { createCardSchema, updateCardSchema } from '../schemas/card.schema'
import { cardRepository } from '../repositories/card.repository'
import { ZodError } from 'zod'
import { connectToDatabase } from '../lib/mongoose'
import { NextRequest, NextResponse } from 'next/server'

export const cardController = {
  getAllCards: async (_request: NextRequest) => {
    await connectToDatabase()
    const cards = await cardRepository.findAll()

    return NextResponse.json({ message: 'Fetched all cards', error: null, data: cards }, { status: 200 })
  },

  getACardById: async (_request: NextRequest, id: string) => {
    await connectToDatabase()
    const card = await cardRepository.findById(id)

    if (!card) {
      return NextResponse.json(
        {
          message: 'Card not found',
          error: 'Invalid card ID',
          data: null,
        },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        message: 'Fetched card successfully',
        error: null,
        data: card,
      },
      { status: 200 }
    )
  },

  createANewCard: async (request: NextRequest) => {
    try {
      await connectToDatabase()
      const body = await request.json()
      const parsedCard = createCardSchema.parse(body)

      const newCard = await cardRepository.create({
        ...parsedCard,
        position: parsedCard.position ?? 1,
      })

      return NextResponse.json(
        {
          message: 'New Card created Successfully',
          error: null,
          data: newCard,
        },
        { status: 201 }
      )
    } catch (error) {
      if (error instanceof ZodError) {
        return NextResponse.json({ message: 'Validation error', error: error.message }, { status: 400 })
      }

      return NextResponse.json({ message: 'Internal server error', error: 'Unexpected error' }, { status: 500 })
    }
  },

  updateACard: async (request: NextRequest, id: string) => {
    try {
      await connectToDatabase()
      const body = await request.json()
      const parsedData = updateCardSchema.parse(body)

      const updatedCard = await cardRepository.update(id, parsedData)

      if (!updatedCard) {
        return NextResponse.json(
          {
            message: 'Card not found',
            error: 'Invalid card ID',
            data: null,
          },
          { status: 404 }
        )
      }

      return NextResponse.json(
        {
          message: 'Card updated successfully',
          error: null,
          data: updatedCard,
        },
        { status: 200 }
      )
    } catch (error) {
      if (error instanceof ZodError) {
        return NextResponse.json({ message: 'Validation error', error: error.message }, { status: 400 })
      }

      return NextResponse.json({ message: 'Internal server error', error: 'Unexpected error' }, { status: 500 })
    }
  },

  deleteACard: async (_request: NextRequest, id: string) => {
    await connectToDatabase()

    const deletedCard = await cardRepository.delete(id)

    if (!deletedCard) {
      return NextResponse.json(
        {
          message: 'Card not found',
          error: 'Invalid card ID',
          data: null,
        },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        message: 'Card deleted successfully',
        error: null,
        data: deletedCard,
      },
      { status: 200 }
    )
  },
}
