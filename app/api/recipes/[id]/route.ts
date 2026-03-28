import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

// Public: Fetch single recipe by ID or Slug
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const recipe = await prisma.recipe.findFirst({
      where: {
        OR: [
          { id: params.id },
          { slug: params.id }
        ]
      },
    });

    if (!recipe) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }

    return NextResponse.json({ recipe });
  } catch (error) {
    console.error("Failed to fetch recipe", error);
    return NextResponse.json({ error: "Failed to fetch recipe" }, { status: 500 });
  }
}

// Admin: Update a recipe
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    requireAdmin(request);
    const body = await request.json();
    const { 
      title, 
      slug, 
      description, 
      content, 
      image, 
      time, 
      serves, 
      calories, 
      difficulty, 
      category, 
      tags,
      active,
      featured
    } = body;

    const recipe = await prisma.recipe.update({
      where: { id: params.id },
      data: {
        title,
        slug,
        description,
        content,
        image,
        time,
        serves,
        calories,
        difficulty,
        category,
        tags: Array.isArray(tags) ? tags : undefined,
        active,
        featured
      },
    });

    return NextResponse.json({ recipe });
  } catch (error: any) {
    console.error("Failed to update recipe", error);
    const status = error.message === "Forbidden" ? 403 : error.message === "Not authenticated" ? 401 : 500;
    return NextResponse.json({ error: error.message || "Failed to update recipe" }, { status });
  }
}

// Admin: Delete a recipe
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    requireAdmin(request);
    await prisma.recipe.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ message: "Recipe deleted successfully" });
  } catch (error: any) {
    console.error("Failed to delete recipe", error);
    const status = error.message === "Forbidden" ? 403 : error.message === "Not authenticated" ? 401 : 500;
    return NextResponse.json({ error: error.message || "Failed to delete recipe" }, { status });
  }
}
