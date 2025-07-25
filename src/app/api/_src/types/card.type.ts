export type CardStatus = "to-do" | "in-progress" | "completed"

export interface Card {
    _id?: string
    title: string
    content: string 
    status?: CardStatus
    position: number
    createdAt?: Date
    updatedAt?: Date
}