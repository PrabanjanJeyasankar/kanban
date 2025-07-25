import { Card } from "../types/card.type";
import { Card as CardModel} from "../models/card.model";

export const cardRepository = {
    create: async (card: Card) => {
        const newCard = new CardModel(card)
        await newCard.save()
        return newCard.toObject()
    },

    findAll: async () => {
        const cards = await CardModel.find().lean()
        return cards
    },

    findById: async (id: string) => {
        const card = await CardModel.findById(id).lean()
        return card
    },

    update: async (id: string, card: Partial<Card>) => {
        const updatedCard = await CardModel.findByIdAndUpdate(id, card, { new: true }).lean()
        return updatedCard
    },

    delete: async (id: string) => {
        const deletedCard = await CardModel.findByIdAndDelete(id).lean()
        return deletedCard
    }
}