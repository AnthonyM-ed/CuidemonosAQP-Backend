// test-s3.js
const { S3Client, ListBucketsCommand, PutObjectCommand, ListObjectsV2Command } = require('@aws-sdk/client-s3');
require('dotenv').config({path: '../.env'});

console.log('🔧 Configuración S3:');
console.log('Endpoint:', process.env.SUPABASE_S3_ENDPOINT);
console.log('Region:', process.env.SUPABASE_S3_REGION);
console.log('Access Key ID:', process.env.SUPABASE_S3_ACCESS_KEY_ID?.substring(0, 10) + '...');

const s3Client = new S3Client({
  forcePathStyle: true,
  region: process.env.SUPABASE_S3_REGION || 'us-east-1',
  endpoint: process.env.SUPABASE_S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.SUPABASE_S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.SUPABASE_S3_SECRET_ACCESS_KEY,
  }
});

async function testS3Connection() {
  try {
    console.log('\n🔍 Probando conexión S3...');
    
    // Listar buckets
    const listBucketsCommand = new ListBucketsCommand({});
    const bucketsResponse = await s3Client.send(listBucketsCommand);
    
    console.log('✅ Conexión S3 exitosa!');
    console.log('📁 Buckets disponibles:', bucketsResponse.Buckets?.map(b => b.Name) || []);
    
    // Verificar bucket 'files'
    const filesBucket = bucketsResponse.Buckets?.find(b => b.Name === 'files');
    if (filesBucket) {
      console.log('✅ Bucket "files" encontrado');
      
      // Listar contenido del bucket
      const listObjectsCommand = new ListObjectsV2Command({
        Bucket: 'files',
        MaxKeys: 5
      });
      
      const objectsResponse = await s3Client.send(listObjectsCommand);
      console.log('📂 Archivos en bucket:', objectsResponse.Contents?.length || 0);
      
      if (objectsResponse.Contents?.length > 0) {
        console.log('📄 Primeros archivos:');
        objectsResponse.Contents.slice(0, 3).forEach(obj => {
          console.log(`   - ${obj.Key} (${obj.Size} bytes)`);
        });
      }
    } else {
      console.log('⚠️  Bucket "files" no encontrado');
    }
    
    // Probar subida de archivo
    console.log('\n🔍 Probando subida de archivo...');
    const testContent = Buffer.from('Test file from S3 client');
    const testKey = `test/test-${Date.now()}.txt`;
    
    const putObjectCommand = new PutObjectCommand({
      Bucket: 'files',
      Key: testKey,
      Body: testContent,
      ContentType: 'text/plain'
    });
    
    await s3Client.send(putObjectCommand);
    console.log('✅ Archivo subido exitosamente!');
    console.log('📄 Key:', testKey);
    
    // Construir URL pública
    const publicUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/files/${testKey}`;
    console.log('🌐 URL pública:', publicUrl);
    
  } catch (error) {
    console.error('❌ Error S3:', error.message);
    console.log('\n💡 Posibles soluciones:');
    console.log('   1. Verifica que las S3 Access Keys estén correctas');
    console.log('   2. Asegúrate de que el bucket "files" exista');
    console.log('   3. Verifica el endpoint en la configuración');
  }
}

testS3Connection();