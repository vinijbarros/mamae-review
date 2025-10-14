#!/usr/bin/env tsx

/**
 * CLEANUP STORAGE
 * 
 * Script para identificar e remover arquivos órfãos do Firebase Storage.
 * Arquivos órfãos são aqueles que não têm referência no Firestore.
 * 
 * USO:
 *   npx tsx scripts/cleanupStorage.ts
 *   npx tsx scripts/cleanupStorage.ts --delete
 * 
 * OPÇÕES:
 *   --delete: Remove automaticamente os arquivos órfãos (com confirmação)
 */

import * as readline from 'readline';
import { adminStorage, adminDb } from './firebase-admin';

const args = process.argv.slice(2);
const autoDelete = args.includes('--delete');

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
 * Extrai URLs de imagens dos produtos
 */
async function getProductImageUrls(): Promise<Set<string>> {
  const urls = new Set<string>();
  
  const snapshot = await adminDb.collection('products').get();
  
  snapshot.forEach((doc) => {
    const data = doc.data();
    if (data.imageUrl) {
      urls.add(data.imageUrl);
    }
  });
  
  return urls;
}

/**
 * Lista todos os arquivos do Storage
 */
async function listStorageFiles(): Promise<string[]> {
  const bucket = adminStorage.bucket();
  const [files] = await bucket.getFiles();
  
  return files.map((file) => file.name);
}

/**
 * Converte URL do Storage para nome do arquivo
 */
function urlToFileName(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    // Formato típico: /v0/b/bucket-name/o/path%2Fto%2Ffile.jpg
    const encodedPath = pathParts[pathParts.length - 1];
    return decodeURIComponent(encodedPath);
  } catch {
    return null;
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
 * Executa limpeza do Storage
 */
async function runCleanup(): Promise<void> {
  console.log('🧹 CLEANUP STORAGE - Iniciando...\n');
  console.log('='.repeat(60));
  
  const startTime = Date.now();
  
  // Buscar URLs das imagens no Firestore
  console.log('\n📊 Analisando dados do Firestore...');
  const productImageUrls = await getProductImageUrls();
  console.log(`   ✓ ${productImageUrls.size} imagens de produtos encontradas`);
  
  // Converter URLs para nomes de arquivo
  const referencedFiles = new Set<string>();
  
  for (const url of productImageUrls) {
    const fileName = urlToFileName(url);
    if (fileName) {
      referencedFiles.add(fileName);
    }
  }
  
  // Listar arquivos do Storage
  console.log('\n📂 Analisando arquivos do Storage...');
  const storageFiles = await listStorageFiles();
  console.log(`   ✓ ${storageFiles.length} arquivos encontrados`);
  
  // Identificar arquivos órfãos
  const orphanFiles: string[] = [];
  
  for (const file of storageFiles) {
    if (!referencedFiles.has(file)) {
      orphanFiles.push(file);
    }
  }
  
  // Calcular tamanho total dos órfãos
  let totalSize = 0;
  const bucket = adminStorage.bucket();
  
  for (const file of orphanFiles) {
    try {
      const [metadata] = await bucket.file(file).getMetadata();
      totalSize += parseInt(metadata.size || '0', 10);
    } catch (error) {
      // Ignorar erros de metadata
    }
  }
  
  // Relatório
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 RELATÓRIO DE ARQUIVOS ÓRFÃOS');
  console.log(`   Arquivos órfãos: ${orphanFiles.length}`);
  console.log(`   Tamanho total: ${formatBytes(totalSize)}`);
  
  if (orphanFiles.length === 0) {
    console.log('\n✅ Nenhum arquivo órfão encontrado!\n');
    return;
  }
  
  // Listar arquivos órfãos
  console.log('\n📝 Lista de arquivos órfãos:');
  orphanFiles.slice(0, 20).forEach((file, index) => {
    console.log(`   ${index + 1}. ${file}`);
  });
  
  if (orphanFiles.length > 20) {
    console.log(`   ... e mais ${orphanFiles.length - 20} arquivos`);
  }
  
  // Deletar se solicitado
  if (autoDelete) {
    console.log('\n⚠️  ATENÇÃO: Os arquivos listados serão DELETADOS permanentemente!\n');
    
    const answer = await askQuestion('Deseja continuar com a exclusão? (s/N): ');
    
    if (answer.toLowerCase() !== 's' && answer.toLowerCase() !== 'sim') {
      console.log('\n❌ Limpeza cancelada pelo usuário.');
      return;
    }
    
    console.log('\n🗑️  Deletando arquivos órfãos...');
    
    let deleted = 0;
    let failed = 0;
    
    for (const file of orphanFiles) {
      try {
        await bucket.file(file).delete();
        deleted++;
        
        if (deleted % 10 === 0) {
          console.log(`   ✓ ${deleted}/${orphanFiles.length} deletados...`);
        }
      } catch (error) {
        console.error(`   ✗ Erro ao deletar ${file}:`, error);
        failed++;
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('\n📊 RESUMO DA LIMPEZA');
    console.log(`   Arquivos deletados: ${deleted}`);
    console.log(`   Falhas: ${failed}`);
    console.log(`   Espaço liberado: ${formatBytes(totalSize)}`);
  } else {
    console.log('\n💡 Para deletar os arquivos órfãos, execute:');
    console.log('   npx tsx scripts/cleanupStorage.ts --delete');
  }
  
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`\n⏱️  Duração: ${duration}s`);
  console.log('\n✅ Cleanup concluído!\n');
}

// Executar cleanup
runCleanup()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n❌ Erro ao executar cleanup:', error);
    process.exit(1);
  });

