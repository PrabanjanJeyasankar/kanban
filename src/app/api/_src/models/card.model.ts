// models/card.model.ts
import { Schema, model, models, Document, Types, Model } from "mongoose"
import { Card as CardType } from "../types/card.type"

export interface CardDocument extends Omit<CardType, '_id'>, Document {
    _id: Types.ObjectId
}

const CardSchema = new Schema<CardType>(
    {
        title: { 
            type: String, 
            required: true 
        },
        content: { 
            type: String, 
            required: true 
        },
        position: {
            type: Number,
            required: true,
            min: [1, "Position must be greater than zero"], 
        },
        status: {
            type: String,
            enum: ["to-do", "in-progress", "completed"],
            default: "to-do",
        },
    },
    { 
        timestamps: true 
    }
)

export const Card: Model<CardDocument> = models.Card || model<CardType>("Card", CardSchema)
