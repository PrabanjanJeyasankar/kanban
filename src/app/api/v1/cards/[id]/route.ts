// src/app/api/v1/cards/[id]/route.ts
import { NextRequest } from "next/server"
import { cardController } from "@/app/api/_src/controllers/card.controller"

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    return cardController.getACardById(request, id)
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    return cardController.updateACard(request, id)
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    return cardController.deleteACard(request, id)
}
