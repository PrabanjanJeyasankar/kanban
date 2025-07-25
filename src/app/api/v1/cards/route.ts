import { NextRequest } from "next/server"
import { cardController } from "../../_src/controllers/card.controller"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
    return await cardController.getAllCards(request)
}

export async function POST(request: NextRequest) {
    return await cardController.createANewCard(request)
}