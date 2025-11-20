import { ImageResponse } from "next/og"
import { prisma } from "@/lib/prisma"
import { getGameImageUrl } from "@/lib/image-utils"

export const runtime = "nodejs"
export const contentType = "image/png"
export const size = {
  width: 1080,
  height: 1350,
}

const GRADIENT_BG =
  "linear-gradient(180deg, #1b0036 0%, #3c0c71 45%, #5c12ad 70%, #ff6b2c 100%)"

export async function GET(
  _req: Request,
  { params }: { params: { slug: string } },
) {
  const slug = decodeURIComponent(params.slug)
  const product = await prisma.product.findUnique({
    where: { slug },
    select: {
      title: true,
      thumbnail: true,
      image: true,
      shortPitch: true,
      tagline: true,
      description: true,
    },
  })

  if (!product) {
    return new ImageResponse(
      (
        <div
          style={{
            width: size.width,
            height: size.height,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: GRADIENT_BG,
            color: "white",
            fontFamily: "DM Mono, 'Segoe UI', sans-serif",
            fontSize: 64,
          }}
        >
          Game not found
        </div>
      ),
      { ...size },
    )
  }

  const coverImage = getGameImageUrl(product.thumbnail || product.image)
  const subtitle =
    product.shortPitch ||
    product.tagline ||
    (product.description
      ? product.description.slice(0, 120)
      : "Discover daily gems on MobileGameHunt.") ||
    "Discover daily gems on MobileGameHunt."

  return new ImageResponse(
    (
      <div
        style={{
          width: size.width,
          height: size.height,
          display: "flex",
          flexDirection: "column",
          backgroundImage: GRADIENT_BG,
          color: "#fff",
          fontFamily: "DM Mono, 'Segoe UI', sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.12), transparent 45%), radial-gradient(circle at 80% 10%, rgba(255,255,255,0.08), transparent 50%)",
          }}
        />

        <div style={{ padding: "64px 72px 40px", position: "relative", flex: 1 }}>
          <div
            style={{
              letterSpacing: "0.6em",
              textTransform: "uppercase",
              fontSize: 32,
              marginBottom: 16,
            }}
          >
            MobileGameHunt
          </div>

          <div
            style={{
              fontSize: 110,
              fontWeight: 800,
              lineHeight: 0.9,
              textTransform: "uppercase",
              textShadow: "0 8px 20px rgba(0,0,0,0.45)",
            }}
          >
            Game of
            <br />
            the Day!
          </div>

          <div
            style={{
              marginTop: 48,
              background: "rgba(5, 5, 15, 0.85)",
              borderRadius: 48,
              padding: 32,
              boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <div
              style={{
                width: "100%",
                height: 500,
                borderRadius: 36,
                overflow: "hidden",
                border: "4px solid rgba(255,255,255,0.12)",
                background: "#03030c",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <img
                src={coverImage}
                alt={product.title}
                width={900}
                height={500}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                }}
              />
            </div>
          </div>
        </div>

        <div
          style={{
            padding: "32px 72px 64px",
            position: "relative",
            backdropFilter: "blur(6px)",
            background:
              "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.55) 40%, rgba(0,0,0,0.85) 100%)",
          }}
        >
          <div
            style={{
              fontSize: 56,
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            {product.title}
          </div>
          <div
            style={{
              marginTop: 12,
              fontSize: 28,
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              color: "rgba(255,255,255,0.85)",
            }}
          >
            {subtitle}
          </div>
          <div
            style={{
              marginTop: 32,
              fontSize: 24,
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.6)",
            }}
          >
            mobilegamehunt.com
          </div>
        </div>
      </div>
    ),
    { ...size },
  )
}

