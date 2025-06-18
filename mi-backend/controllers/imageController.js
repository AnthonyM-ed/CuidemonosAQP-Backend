const multer = require('multer');
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({path: '../.env'});

// Configuración de Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Configuración de S3 Client
const s3Client = new S3Client({
  forcePathStyle: true,
  region: process.env.SUPABASE_S3_REGION || 'us-east-1',
  endpoint: process.env.SUPABASE_S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.SUPABASE_S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.SUPABASE_S3_SECRET_ACCESS_KEY,
  }
});

// Configurar multer para usar memoria
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB límite
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen'), false);
    }
  }
});

// Función para subir archivo usando S3
async function uploadToSupabaseS3(file, folder = 'uploads') {
  const fileExt = file.originalname.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `${folder}/${fileName}`;

  const uploadParams = {
    Bucket: 'files',
    Key: filePath,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  try {
    const command = new PutObjectCommand(uploadParams);
    await s3Client.send(command);

    // Construir URL pública
    const publicUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/files/${filePath}`;
    return publicUrl;
  } catch (error) {
    throw new Error(`Error al subir archivo con S3: ${error.message}`);
  }
}

// Función para eliminar archivo usando S3
async function deleteFromSupabaseS3(fileUrl) {
  if (!fileUrl) return;
  
  try {
    // Extraer el path del archivo de la URL
    const urlParts = fileUrl.split('/');
    const publicIndex = urlParts.findIndex(part => part === 'public');
    if (publicIndex === -1) return;
    
    const bucketIndex = publicIndex + 1;
    const filePath = urlParts.slice(bucketIndex + 1).join('/');
    
    const deleteParams = {
      Bucket: 'files',
      Key: filePath,
    };

    const command = new DeleteObjectCommand(deleteParams);
    await s3Client.send(command);
  } catch (error) {
    console.error('Error al eliminar archivo S3:', error);
  }
}

// Función fallback usando API de Supabase
async function uploadToSupabase(file, folder = 'uploads') {
  const fileExt = file.originalname.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `${folder}/${fileName}`;

  const { data, error } = await supabase.storage
    .from('files')
    .upload(filePath, file.buffer, {
      contentType: file.mimetype,
      upsert: false
    });

  if (error) {
    throw new Error(`Error al subir archivo: ${error.message}`);
  }

  const { data: publicUrlData } = supabase.storage
    .from('files')
    .getPublicUrl(filePath);

  return publicUrlData.publicUrl;
}

// Función para eliminar archivo usando API de Supabase
async function deleteFromSupabase(fileUrl) {
  if (!fileUrl) return;
  
  try {
    // Extraer el path del archivo de la URL
    const urlParts = fileUrl.split('/');
    const publicIndex = urlParts.findIndex(part => part === 'public');
    if (publicIndex === -1) return;
    
    const bucketIndex = publicIndex + 1;
    const filePath = urlParts.slice(bucketIndex + 1).join('/');
    
    const { error } = await supabase.storage
      .from('files')
      .remove([filePath]);
      
    if (error) {
      console.error('Error al eliminar archivo:', error);
    }
  } catch (error) {
    console.error('Error al eliminar archivo de Supabase:', error);
  }
}

// Función principal de upload (intenta S3 primero, luego fallback)
async function uploadFile(file, folder = 'uploads') {
  try {
    // Intentar con S3 primero
    if (process.env.SUPABASE_S3_ACCESS_KEY_ID) {
      return await uploadToSupabaseS3(file, folder);
    } else {
      // Fallback a API de Supabase
      return await uploadToSupabase(file, folder);
    }
  } catch (error) {
    console.error('Error en upload primario, intentando fallback:', error);
    // Si S3 falla, intentar con API normal
    return await uploadToSupabase(file, folder);
  }
}

// Función principal de eliminación
async function deleteFile(fileUrl) {
  try {
    if (process.env.SUPABASE_S3_ACCESS_KEY_ID) {
      await deleteFromSupabaseS3(fileUrl);
    } else {
      await deleteFromSupabase(fileUrl);
    }
  } catch (error) {
    console.error('Error en eliminación primaria, intentando fallback:', error);
    // Si S3 falla, intentar con API normal
    await deleteFromSupabase(fileUrl);
  }
}

// Middleware para configurar multer según el contexto
const createUploadMiddleware = (fields) => {
  if (Array.isArray(fields)) {
    // Para múltiples archivos con nombres específicos
    return upload.fields(fields);
  } else if (typeof fields === 'string') {
    // Para un solo archivo
    return upload.single(fields);
  } else {
    // Para cualquier archivo
    return upload.any();
  }
};

module.exports = {
  upload,
  uploadFile,
  deleteFile,
  createUploadMiddleware,
  uploadToSupabaseS3,
  deleteFromSupabaseS3,
  uploadToSupabase,
  deleteFromSupabase
};