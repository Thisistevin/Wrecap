import { NextRequest, NextResponse } from 'next/server';
import { getRetrospectiveAdmin, updateRetrospectiveAdmin } from '@/lib/db-admin';
import { generateRetrospective } from '@/lib/gemini';
import { adminStorage } from '@/lib/firebase-admin';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  let retrospectiveId: string | null = null;
  let zipFileUrl: string | null = null;
  
  try {
    logger.log('🔄 [process-retrospective] Endpoint called');
    const body = await request.json();
    retrospectiveId = body.retrospectiveId;
    zipFileUrl = body.zipFileUrl;

    logger.log('📋 [process-retrospective] Processing retrospective:', retrospectiveId);
    logger.log('📦 [process-retrospective] Zip file URL provided:', zipFileUrl ? 'Yes' : 'No');

    if (!retrospectiveId) {
      return NextResponse.json(
        { error: 'Missing retrospectiveId' },
        { status: 400 }
      );
    }

    // If zipFileUrl is not provided, get it from the database
    if (!zipFileUrl) {
      const retrospective = await getRetrospectiveAdmin(retrospectiveId);
      if (!retrospective) {
        return NextResponse.json({ error: 'Retrospective not found' }, { status: 404 });
      }
      zipFileUrl = retrospective.zipFileUrl || null;
      
      if (!zipFileUrl) {
        return NextResponse.json(
          { error: 'Missing zipFileUrl in retrospective' },
          { status: 400 }
        );
      }
    }

    // Download zip file from storage
    logger.log('📥 Downloading zip file from:', zipFileUrl);
    const zipResponse = await fetch(zipFileUrl);
    if (!zipResponse.ok) {
      throw new Error(`Failed to download zip file: ${zipResponse.status} ${zipResponse.statusText}`);
    }
    
    // Check content type
    const contentType = zipResponse.headers.get('content-type');
    if (contentType && !contentType.includes('zip') && !contentType.includes('octet-stream')) {
      logger.warn('⚠️ Unexpected content type for ZIP file:', contentType);
    }
    
    // Convert to ArrayBuffer for JSZip (works in Node.js)
    const zipArrayBuffer = await zipResponse.arrayBuffer();
    
    if (zipArrayBuffer.byteLength === 0) {
      throw new Error('Downloaded ZIP file is empty');
    }
    
    logger.log('✅ ZIP file downloaded, size:', (zipArrayBuffer.byteLength / 1024).toFixed(2), 'KB');

    // Extract chat file
    logger.log('📦 Extracting ZIP file...');
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();
    
    let zipData;
    try {
      zipData = await zip.loadAsync(zipArrayBuffer);
    } catch (error: any) {
      throw new Error(`Failed to parse ZIP file. The file may be corrupted. Error: ${error.message}`);
    }
    
    // Look for any .txt file in the ZIP
    const allFiles = Object.keys(zipData.files);
    const txtFiles = allFiles.filter(fileName => {
      const file = zipData.files[fileName];
      // Only consider actual files (not directories) that end with .txt
      return !file.dir && fileName.toLowerCase().endsWith('.txt');
    });
    
    if (txtFiles.length === 0) {
      logger.error('❌ Available files in ZIP:', allFiles);
      throw new Error(`Nenhum arquivo .txt encontrado no ZIP. Arquivos disponíveis: ${allFiles.join(', ')}`);
    }
    
    // Prefer _chat.txt if available, otherwise use the first .txt file found
    // If multiple .txt files, try to find the largest one (likely the main chat file)
    let selectedTxtFile: string;
    let chatText: string;
    
    if (txtFiles.includes('_chat.txt')) {
      selectedTxtFile = '_chat.txt';
      logger.log('✅ Using _chat.txt file');
      const chatFile = zipData.file(selectedTxtFile);
      if (!chatFile) {
        throw new Error(`Erro ao acessar o arquivo ${selectedTxtFile}`);
      }
      chatText = await chatFile.async('text');
    } else {
      // If multiple .txt files, try to find the largest one by reading their sizes
      if (txtFiles.length === 1) {
        selectedTxtFile = txtFiles[0];
        logger.log(`✅ Using .txt file: ${selectedTxtFile}`);
        const chatFile = zipData.file(selectedTxtFile);
        if (!chatFile) {
          throw new Error(`Erro ao acessar o arquivo ${selectedTxtFile}`);
        }
        chatText = await chatFile.async('text');
      } else {
        // Multiple .txt files - find the largest one
        let largestFile = txtFiles[0];
        let largestSize = 0;
        const fileContents: Record<string, string> = {};
        
        // Read all files to find the largest
        for (const fileName of txtFiles) {
          try {
            const file = zipData.files[fileName];
            if (file && !file.dir) {
              const content = await file.async('string');
              fileContents[fileName] = content;
              if (content.length > largestSize) {
                largestSize = content.length;
                largestFile = fileName;
              }
            }
          } catch (err) {
            // Skip files that can't be read
            logger.warn(`⚠️ Could not read file ${fileName}, skipping`);
          }
        }
        
        selectedTxtFile = largestFile;
        chatText = fileContents[selectedTxtFile];
        logger.log(`✅ Using .txt file: ${selectedTxtFile} (${txtFiles.length} arquivo(s) .txt encontrado(s), escolhido o maior)`);
      }
    }
    
    if (!chatText || chatText.trim().length === 0) {
      throw new Error(`O arquivo ${selectedTxtFile} está vazio`);
    }
    
    logger.log('✅ Arquivo de conversa extraído, tamanho:', chatText.length, 'caracteres');

    // Generate retrospective with Gemini
    logger.log('Generating retrospective with Gemini...');
    const jsonContent = await generateRetrospective(chatText);
    logger.log('Retrospective generated, length:', jsonContent.length);

    // Extract title from JSON
    let titleFromJson = '';
    try {
      const parsed = JSON.parse(jsonContent);
      if (parsed && typeof parsed.titulo === 'string') {
        titleFromJson = parsed.titulo;
      }
    } catch (e) {
      logger.warn('⚠️ Could not parse JSON content to extract title');
    }

    // Upload JSON to storage using Firebase Admin SDK
    if (!adminStorage) {
      throw new Error('Firebase Admin Storage not initialized. Check your service account configuration.');
    }
    
    const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
    
    if (!storageBucket) {
      throw new Error('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET is not set');
    }
    
    const bucket = adminStorage.bucket(storageBucket);
    
    const jsonPath = `retrospectives/${retrospectiveId}/content.json`;
    const file = bucket.file(jsonPath);
    
    // Convert string to Buffer for Node.js
    const jsonBuffer = Buffer.from(jsonContent, 'utf-8');
    
    await file.save(jsonBuffer, {
      contentType: 'application/json',
      metadata: {
        contentType: 'application/json',
      },
    });
    
    // Get download URL
    const [url] = await file.getSignedUrl({
      action: 'read',
      expires: '03-09-2491', // Far future date
    });
    const jsonUrl = url;

    // Update retrospective with JSON path
    logger.log('💾 [process-retrospective] Updating retrospective status to completed...');
    logger.log('📝 [process-retrospective] JSON path:', jsonPath);
    
    await updateRetrospectiveAdmin(retrospectiveId, {
      textContentJson: jsonPath,
      status: 'completed',
      title: titleFromJson,
    });
    
    logger.log('✅ [process-retrospective] Retrospective status updated to completed:', retrospectiveId);

    return NextResponse.json({
      success: true,
      jsonUrl,
      retrospectiveId,
    });
  } catch (error: any) {
    logger.error('Process retrospective error:', error);
    logger.error('Error stack:', error.stack);
    logger.error('Retrospective ID:', retrospectiveId);
    
    // Update retrospective status to failed
    if (retrospectiveId) {
      try {
        await updateRetrospectiveAdmin(retrospectiveId, {
          status: 'failed',
        });
        logger.log('Updated retrospective status to failed:', retrospectiveId);
      } catch (updateError) {
        logger.error('Failed to update retrospective status:', updateError);
      }
    }

    return NextResponse.json(
      { 
        error: error.message || 'Failed to process retrospective',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

