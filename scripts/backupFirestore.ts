#!/usr/bin/env tsx

/**
 * BACKUP FIRESTORE
 * 
 * Script para exportar todas as coleções do Firestore para arquivos JSON.
 * 
 * USO:
 *   npx tsx scripts/backupFirestore.ts
 * 
 * SAÍDA:
 *   backups/YYYY-MM-DD/
 *     - users.json
 *     - products.json
 *     - reviews.json
 *     - metadata.json
 */

import * as fs from 'fs';
import * as path from 'path';
import * as zlib from 'zlib';
import { adminDb } from './firebase-admin';

// Coleções para backup
const COLLECTIONS = ['users', 'products', 'reviews'];

interface BackupMetadata {
  timestamp: string;
  collections: {
    [key: string]: {
      count: number;
      sizeBytes: number;
    };
  };
  totalDocuments: number;
  totalSizeBytes: number;
}

/**
 * Cria diretório se não existir
 */
function ensureDirectoryExists(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Formata bytes para formato legível
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Exporta uma coleção para JSON
 */
async function exportCollection(collectionName: string): Promise<{ count: number; sizeBytes: number }> {
  console.log(`\n📦 Exportando coleção: ${collectionName}`);
  
  try {
    const snapshot = await adminDb.collection(collectionName).get();
    const documents: any[] = [];
    
    snapshot.forEach((doc) => {
      documents.push({
        id: doc.id,
        data: doc.data(),
      });
    });
    
    const jsonString = JSON.stringify(documents, null, 2);
    const sizeBytes = Buffer.byteLength(jsonString, 'utf8');
    
    console.log(`   ✓ ${documents.length} documentos exportados (${formatBytes(sizeBytes)})`);
    
    return {
      count: documents.length,
      sizeBytes,
    };
  } catch (error) {
    console.error(`   ✗ Erro ao exportar ${collectionName}:`, error);
    throw error;
  }
}

/**
 * Compacta arquivo com gzip
 */
function compressFile(inputPath: string, outputPath: string): void {
  const fileContents = fs.readFileSync(inputPath);
  const compressed = zlib.gzipSync(fileContents);
  fs.writeFileSync(outputPath, compressed);
  
  const originalSize = fs.statSync(inputPath).size;
  const compressedSize = fs.statSync(outputPath).size;
  const ratio = ((1 - compressedSize / originalSize) * 100).toFixed(1);
  
  console.log(`   ✓ Compactado: ${formatBytes(originalSize)} → ${formatBytes(compressedSize)} (${ratio}% redução)`);
}

/**
 * Executa backup completo
 */
async function runBackup(): Promise<void> {
  console.log('🗂️  BACKUP FIRESTORE - Iniciando...\n');
  console.log('='.repeat(60));
  
  const startTime = Date.now();
  
  // Criar diretório de backup com data atual
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const backupDir = path.resolve(__dirname, '../backups', today);
  
  ensureDirectoryExists(backupDir);
  console.log(`\n📁 Diretório: ${backupDir}`);
  
  // Metadados do backup
  const metadata: BackupMetadata = {
    timestamp: new Date().toISOString(),
    collections: {},
    totalDocuments: 0,
    totalSizeBytes: 0,
  };
  
  // Exportar cada coleção
  for (const collectionName of COLLECTIONS) {
    const collectionData = await exportCollection(collectionName);
    
    // Salvar JSON
    const jsonPath = path.join(backupDir, `${collectionName}.json`);
    const snapshot = await adminDb.collection(collectionName).get();
    const documents: any[] = [];
    
    snapshot.forEach((doc) => {
      documents.push({
        id: doc.id,
        data: doc.data(),
      });
    });
    
    fs.writeFileSync(jsonPath, JSON.stringify(documents, null, 2));
    
    // Compactar
    const gzipPath = path.join(backupDir, `${collectionName}.json.gz`);
    compressFile(jsonPath, gzipPath);
    
    // Remover JSON não compactado
    fs.unlinkSync(jsonPath);
    
    // Atualizar metadados
    metadata.collections[collectionName] = collectionData;
    metadata.totalDocuments += collectionData.count;
    metadata.totalSizeBytes += collectionData.sizeBytes;
  }
  
  // Salvar metadados
  const metadataPath = path.join(backupDir, 'metadata.json');
  fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
  
  // Resumo
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 RESUMO DO BACKUP');
  console.log(`   Total de documentos: ${metadata.totalDocuments}`);
  console.log(`   Tamanho total: ${formatBytes(metadata.totalSizeBytes)}`);
  console.log(`   Duração: ${duration}s`);
  console.log(`   Local: ${backupDir}`);
  console.log('\n✅ Backup concluído com sucesso!\n');
}

// Executar backup
runBackup()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n❌ Erro ao executar backup:', error);
    process.exit(1);
  });

