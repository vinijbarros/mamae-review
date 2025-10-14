#!/usr/bin/env tsx

/**
 * RESTORE FIRESTORE
 * 
 * Script para restaurar coleções do Firestore a partir de backup JSON.
 * 
 * USO:
 *   npx tsx scripts/restoreFirestore.ts [data]
 *   npx tsx scripts/restoreFirestore.ts 2024-01-15
 *   npx tsx scripts/restoreFirestore.ts 2024-01-15 --force
 * 
 * OPÇÕES:
 *   --force: Sobrescreve documentos existentes
 */

import * as fs from 'fs';
import * as path from 'path';
import * as zlib from 'zlib';
import * as readline from 'readline';
import { adminDb } from './firebase-admin';

// Argumentos da linha de comando
const args = process.argv.slice(2);
const backupDate = args[0] || new Date().toISOString().split('T')[0];
const forceOverwrite = args.includes('--force');

interface DocumentBackup {
  id: string;
  data: any;
}

/**
 * Pergunta de confirmação
 */
function askQuestion(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

/**
 * Descompacta arquivo gzip
 */
function decompressFile(gzipPath: string): any[] {
  const compressed = fs.readFileSync(gzipPath);
  const decompressed = zlib.gunzipSync(compressed);
  return JSON.parse(decompressed.toString());
}

/**
 * Restaura uma coleção
 */
async function restoreCollection(
  collectionName: string,
  documents: DocumentBackup[],
  force: boolean
): Promise<{ restored: number; skipped: number }> {
  console.log(`\n📦 Restaurando coleção: ${collectionName}`);
  
  let restored = 0;
  let skipped = 0;
  
  for (const doc of documents) {
    try {
      const docRef = adminDb.collection(collectionName).doc(doc.id);
      
      if (!force) {
        // Verificar se documento já existe
        const existingDoc = await docRef.get();
        
        if (existingDoc.exists) {
          console.log(`   ⊘ Pulando ${doc.id} (já existe)`);
          skipped++;
          continue;
        }
      }
      
      // Restaurar documento
      await docRef.set(doc.data);
      restored++;
      
      if (restored % 50 === 0) {
        console.log(`   ✓ ${restored} documentos restaurados...`);
      }
    } catch (error) {
      console.error(`   ✗ Erro ao restaurar documento ${doc.id}:`, error);
    }
  }
  
  console.log(`   ✓ ${restored} documentos restaurados, ${skipped} pulados`);
  
  return { restored, skipped };
}

/**
 * Executa restore completo
 */
async function runRestore(): Promise<void> {
  console.log('🔄 RESTORE FIRESTORE - Iniciando...\n');
  console.log('='.repeat(60));
  
  const startTime = Date.now();
  
  // Verificar se diretório de backup existe
  const backupDir = path.resolve(__dirname, '../backups', backupDate);
  
  if (!fs.existsSync(backupDir)) {
    throw new Error(`Backup não encontrado: ${backupDir}`);
  }
  
  console.log(`\n📁 Diretório: ${backupDir}`);
  
  // Carregar metadados
  const metadataPath = path.join(backupDir, 'metadata.json');
  
  if (!fs.existsSync(metadataPath)) {
    throw new Error('Arquivo metadata.json não encontrado');
  }
  
  const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
  console.log(`\n📊 Backup de: ${new Date(metadata.timestamp).toLocaleString('pt-BR')}`);
  console.log(`   Total de documentos: ${metadata.totalDocuments}`);
  
  // Confirmação
  if (!forceOverwrite) {
    console.log('\n⚠️  ATENÇÃO: Documentos existentes não serão sobrescritos.');
    console.log('   Use --force para sobrescrever.\n');
  } else {
    console.log('\n⚠️  ATENÇÃO: Documentos existentes SERÃO sobrescritos!\n');
  }
  
  const answer = await askQuestion('Deseja continuar? (s/N): ');
  
  if (answer.toLowerCase() !== 's' && answer.toLowerCase() !== 'sim') {
    console.log('\n❌ Restore cancelado pelo usuário.');
    return;
  }
  
  // Estatísticas
  let totalRestored = 0;
  let totalSkipped = 0;
  
  // Restaurar cada coleção
  const collections = Object.keys(metadata.collections);
  
  for (const collectionName of collections) {
    const gzipPath = path.join(backupDir, `${collectionName}.json.gz`);
    
    if (!fs.existsSync(gzipPath)) {
      console.log(`\n⚠️  Arquivo não encontrado: ${collectionName}.json.gz`);
      continue;
    }
    
    // Descompactar e carregar documentos
    const documents = decompressFile(gzipPath);
    
    // Restaurar
    const result = await restoreCollection(collectionName, documents, forceOverwrite);
    
    totalRestored += result.restored;
    totalSkipped += result.skipped;
  }
  
  // Resumo
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 RESUMO DO RESTORE');
  console.log(`   Documentos restaurados: ${totalRestored}`);
  console.log(`   Documentos pulados: ${totalSkipped}`);
  console.log(`   Duração: ${duration}s`);
  console.log('\n✅ Restore concluído com sucesso!\n');
}

// Executar restore
runRestore()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n❌ Erro ao executar restore:', error);
    process.exit(1);
  });

