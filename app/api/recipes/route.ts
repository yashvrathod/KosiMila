import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

// Public: Fetch all active recipes
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const activeOnly = searchParams.get("admin") !== "true";
    const category = searchParams.get("category");
    const featured = searchParams.get("featured");

    const where: any = {};
    if (activeOnly) where.active = true;
    if (category && category !== "All") where.category = category;
    if (featured === "true") where.featured = true;

    const recipes = await prisma.recipe.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ recipes });
  } catch (error) {
    console.error("Failed to fetch recipes", error);
    return NextResponse.json({ error: "Failed to fetch recipes" }, { status: 500 });
  }
}

// Admin: Create a new recipe
export async function POST(request: NextRequest) {
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

    if (!title || !slug || !content || !image) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const recipe = await prisma.recipe.create({
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
        tags: Array.isArray(tags) ? tags : [],
        active: active ?? true,
        featured: featured ?? false
      },
    });

    return NextResponse.json({ recipe });
  } catch (error: any) {
    console.error("Failed to create recipe", error);
    const status = error.message === "Forbidden" ? 403 : error.message === "Not authenticated" ? 401 : 500;
    return NextResponse.json({ error: error.message || "Failed to create recipe" }, { status });
  }
}
