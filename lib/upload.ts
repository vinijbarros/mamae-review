/**
 * Helper para upload de imagens
 * 
 * Por enquanto, vamos usar uma solução simples sem Firebase Storage.
 * Opções:
 * 1. Cloudinary (25GB grátis)
 * 2. Imgur (grátis, ilimitado para uso pessoal)
 * 3. Base64 (apenas para dev/teste)
 * 
 * Para produção, configure Cloudinary em .env.local:
 * NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=seu_cloud_name
 * NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=seu_preset
 */

/**
 * Upload para Cloudinary
 * Configure em: https://cloudinary.com/
 */
export async function uploadToCloudinary(file: File): Promise<string> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error(
      'Cloudinary não configurado. Configure NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME e NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET'
    );
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error('Erro ao fazer upload da imagem');
  }

  const data = await response.json();
  return data.secure_url;
}

/**
 * Upload para Imgur (alternativa gratuita)
 * Requer Client ID: https://api.imgur.com/oauth2/addclient
 */
export async function uploadToImgur(file: File): Promise<string> {
  const clientId = process.env.NEXT_PUBLIC_IMGUR_CLIENT_ID;

  if (!clientId) {
    throw new Error('Imgur não configurado. Configure NEXT_PUBLIC_IMGUR_CLIENT_ID');
  }

  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch('https://api.imgur.com/3/image', {
    method: 'POST',
    headers: {
      Authorization: `Client-ID ${clientId}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Erro ao fazer upload da imagem');
  }

  const data = await response.json();
  return data.data.link;
}

/**
 * Converte imagem para Base64 (apenas para dev/teste)
 * ⚠️ NÃO use em produção! Firestore tem limite de 1MB por documento
 */
export function convertToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

/**
 * Valida se o arquivo é uma imagem válida
 */
export function validateImageFile(file: File): {
  valid: boolean;
  error?: string;
} {
  // Verifica tipo
  if (!file.type.startsWith('image/')) {
    return { valid: false, error: 'O arquivo deve ser uma imagem' };
  }

  // Verifica tamanho (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return { valid: false, error: 'A imagem deve ter no máximo 5MB' };
  }

  return { valid: true };
}

/**
 * Gera preview da imagem
 */
export function createImagePreview(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

/**
 * Upload inteligente: tenta Cloudinary, depois Imgur, senão Base64
 */
export async function uploadImage(file: File): Promise<string> {
  // Valida arquivo
  const validation = validateImageFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // Tenta Cloudinary
  if (
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME &&
    process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
  ) {
    try {
      return await uploadToCloudinary(file);
    } catch (error) {
      console.warn('Cloudinary falhou, tentando Imgur...', error);
    }
  }

  // Tenta Imgur
  if (process.env.NEXT_PUBLIC_IMGUR_CLIENT_ID) {
    try {
      return await uploadToImgur(file);
    } catch (error) {
      console.warn('Imgur falhou, usando Base64...', error);
    }
  }

  // Fallback: Base64 (apenas para desenvolvimento)
  console.warn('⚠️ Usando Base64 para imagem (não recomendado para produção)');
  return await convertToBase64(file);
}

