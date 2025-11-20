import { ImageResponse } from "next/og"
import { prisma } from "@/lib/prisma"
import { getGameImageUrl } from "@/lib/image-utils"

export const runtime = "nodejs"
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = "image/png"

export default async function ProductOgImage({
  params,
}: {
  params: { slug: string }
}) {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    select: {
      title: true,
      tagline: true,
      thumbnail: true,
      image: true,
    },
  })

  const coverImage = getGameImageUrl(product?.thumbnail || product?.image)
  const title = product?.title ?? "Mobile Game Hunt"
  const tagline =
    product?.tagline ?? "Discover upcoming mobile hits and hidden gems."

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "row",
          background: "linear-gradient(135deg, #030712 0%, #0f172a 60%, #020617 100%)",
          color: "white",
          fontFamily: "DM Mono, 'Segoe UI', sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: "-40px",
            background:
              "radial-gradient(circle at 20% 20%, rgba(6,182,212,0.25) 0%, transparent 40%), radial-gradient(circle at 80% 80%, rgba(139,92,246,0.25) 0%, transparent 45%)",
            zIndex: 0,
          }}
        />

        <div
          style={{
            flex: 0.6,
            padding: "60px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: "24px",
            position: "relative",
            zIndex: 1,
          }}
        >
          <div
            style={{
              textTransform: "uppercase",
              letterSpacing: "12px",
              color: "#67e8f9",
              fontSize: "20px",
            }}
          >
            Mobile Game Hunt
          </div>
          <div style={{ fontSize: "64px", fontWeight: 600, lineHeight: 1.1 }}>
            {title}
          </div>
          <div style={{ fontSize: "28px", color: "#cbd5f5", lineHeight: 1.4 }}>
            {tagline}
          </div>
        </div>

        <div
          style={{
            flex: 0.4,
            margin: "60px",
            borderRadius: "36px",
            border: "2px solid rgba(103,232,249,0.4)",
            overflow: "hidden",
            position: "relative",
            boxShadow: "0 25px 60px rgba(6,182,212,0.25)",
          }}
        >
          <img
            src={coverImage}
            alt={title}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.55) 100%)",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "28px",
              left: "32px",
              right: "32px",
              color: "#e0f2fe",
              fontSize: "20px",
              letterSpacing: "4px",
              textTransform: "uppercase",
            }}
          >
            Gameplay Snapshot
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    },
  )
}

