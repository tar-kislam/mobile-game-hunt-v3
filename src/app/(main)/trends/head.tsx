export default function Head() {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const title = 'Trends – Mobile Game Hunt'
  const description = 'Share and discover trending topics in mobile gaming.'
  const og = `${base}/api/og?title=Trends`
  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={`${base}/trends`} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={og} />
    </>
  )
}


