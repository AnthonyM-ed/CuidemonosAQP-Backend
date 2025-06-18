// test-supabase.js
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({path: '../.env'});

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

console.log('URL:', process.env.SUPABASE_URL);

async function testSupabaseConnection() {
  try {
    console.log('🔍 Probando conexión a Supabase...');
    
    // Probar conexión listando buckets
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('❌ Error al conectar:', bucketsError.message);
      return;
    }
    
    console.log('✅ Conexión exitosa!');
    console.log('📁 Buckets disponibles:', buckets.map(b => b.name));
    
    // Verificar que existe el bucket 'files'
    const filesBucket = buckets.find(b => b.name === 'files');
    if (filesBucket) {
      console.log('✅ Bucket "files" encontrado');
      console.log('🔧 Configuración:', {
        public: filesBucket.public,
        created: filesBucket.created_at
      });
    } else {
      console.log('⚠️  Bucket "files" no encontrado. Créalo en el dashboard.');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Ejecutar prueba
testSupabaseConnection();