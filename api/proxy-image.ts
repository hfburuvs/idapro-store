export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  const url = new URL(req.url);
  const imageUrl = url.searchParams.get('url');

  if (!imageUrl) {
    return new Response(JSON.stringify({ error: 'Missing url parameter' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Only proxy .gif files from amazon
  const lowerUrl = imageUrl.toLowerCase();
  const isGif = lowerUrl.endsWith('.gif') || lowerUrl.includes('.gif?') || lowerUrl.includes('amzcaptain');
  if (!isGif) {
    return new Response(JSON.stringify({ error: 'Only .gif proxy is supported' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const response = await fetch(imageUrl, {
      redirect: 'follow',
      headers: {
        'Referer': 'https://www.amazon.com/dp/B000000000',
        'Origin': 'https://www.amazon.com',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Sec-Fetch-Dest': 'image',
        'Sec-Fetch-Mode': 'no-cors',
        'Sec-Fetch-Site': 'cross-site',
      },
    });

    if (!response.ok) {
      return new Response(JSON.stringify({ error: `Upstream error: ${response.status} for ${imageUrl}` }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const contentType = response.headers.get('content-type') || 'image/gif';
    const buffer = await response.arrayBuffer();

    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message, url: imageUrl }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
