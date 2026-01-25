import { v2 as cloudinary } from 'cloudinary';
import { AppError } from '../middleware/errorHandler';

// Конфигурация Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Загрузка изображения
export const uploadImage = async (
  fileBuffer: Buffer,
  folder: string = 'vityaz-club'
): Promise<string> => {
  try {
    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder,
            resource_type: 'image',
            transformation: [
              { width: 500, height: 500, crop: 'fill', gravity: 'face' },
              { quality: 'auto' },
              { fetch_format: 'auto' },
            ],
          },
          (error, result) => {
            if (error) {
              reject(new AppError('Ошибка загрузки изображения', 500, 'UPLOAD_ERROR'));
            }
            if (result) {
              resolve(result.secure_url);
            }
          }
        )
        .end(fileBuffer);
    });
  } catch (error) {
    throw new AppError('Ошибка загрузки изображения в Cloudinary', 500, 'CLOUDINARY_ERROR');
  }
};

// Удаление изображения
export const deleteImage = async (publicId: string): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Ошибка удаления изображения из Cloudinary:', error);
  }
};

export default cloudinary;
