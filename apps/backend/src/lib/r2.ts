import crypto from 'crypto'

// En dev: imágenes placeholder, sin dependencias externas.
// TODO producción: mover a r2.prod.ts e instalar @aws-sdk/client-s3 + sharp

export async function uploadImage(
  buffer: Buffer,
  _folder: string,
): Promise<{ url: string; thumbUrl: string; hash: string }> {
  const hash = crypto.createHash('sha256').update(buffer).digest('hex')
  return {
    url: `https://placehold.co/800x600/1A1A1A/E63946?text=AutoDex`,
    thumbUrl: `https://placehold.co/400x300/1A1A1A/E63946?text=AutoDex`,
    hash,
  }
}
