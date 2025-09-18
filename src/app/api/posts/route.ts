import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { isFeatureEnabled } from "@/lib/config";

export async function GET() {
  // Feature flag check - return 404 if blog is disabled
  if (!isFeatureEnabled('BLOG_ENABLED')) {
    return NextResponse.json({ error: 'Not Found' }, { status: 404 });
  }

  try {
    const posts = await prisma.blogPost.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        status: true,
        createdAt: true,
        author: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      },
    });

    return NextResponse.json(posts);
  } catch (err) {
    console.error("Failed to fetch posts:", err);
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}
