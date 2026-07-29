import { Injectable, Logger } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import * as wav from 'node-wav';

// Need to dynamically import vad-node as it's often ESM or has native bindings
let vadModule: any;

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

@Injectable()
export class VadService {
  private readonly logger = new Logger(VadService.name);

  constructor() {
    this.initVad();
  }

  private async initVad() {
    try {
      vadModule = await import('@ricky0123/vad-node');
    } catch (e) {
      this.logger.error('Failed to load @ricky0123/vad-node', e);
    }
  }

  async processAudio(inputPath: string): Promise<{ outputPath: string; segments: any[] }> {
    this.logger.log(`Processing VAD for ${inputPath}`);
    const ext = path.extname(inputPath);
    const outputPath = inputPath.replace(ext, `_vad${ext}`);
    const tempWav = inputPath.replace(ext, `_temp.wav`);

    // 1. Convert to 16kHz mono WAV for Silero
    await new Promise<void>((resolve, reject) => {
      ffmpeg(inputPath)
        .audioChannels(1)
        .audioFrequency(16000)
        .toFormat('wav')
        .on('end', () => resolve())
        .on('error', reject)
        .save(tempWav);
    });

    let resultSegments: any[] = [];

    try {
      // 2. Run Silero VAD
      const buffer = fs.readFileSync(tempWav);
      const decoded = wav.decode(buffer);
      const audioData = decoded.channelData[0]; // Float32Array

      if (!vadModule) {
        await this.initVad();
      }

      const vad = await vadModule.NonRealTimeVAD.new({
        model: 'v4', // use silero v4
      });

      const vadIterator = vad.run(audioData, 16000);
      const speechChunks: Float32Array[] = [];
      let currentNewStartMs = 0;
      
      // According to vad-node docs, run() yields objects with { start, end, ... } 
      // where start and end are typically frame indices or timestamps.
      // In vad-node, start/end are usually frame indices.
      for await (const result of vadIterator) {
        // Different versions of vad-node might just yield speech segments directly
        // Let's assume result has start and end frames
        if (result.start !== undefined && result.end !== undefined) {
          const originalStartMs = Math.round((result.start / 16000) * 1000);
          const originalEndMs = Math.round((result.end / 16000) * 1000);
          const durationMs = originalEndMs - originalStartMs;
          
          const newStartMs = currentNewStartMs;
          const newEndMs = newStartMs + durationMs;

          resultSegments.push({
            originalStartMs,
            originalEndMs,
            newStartMs,
            newEndMs
          });
          
          currentNewStartMs = newEndMs;

          // Slice the audio array
          const chunk = audioData.slice(result.start, result.end);
          speechChunks.push(chunk);
        }
      }
      
      // If no speech found, just return original mapping (fallback)
      if (speechChunks.length === 0) {
        throw new Error('No speech detected or incompatible VAD output');
      }

      // Concatenate the chunks
      let totalLength = 0;
      for (const chunk of speechChunks) {
        totalLength += chunk.length;
      }
      const combinedAudio = new Float32Array(totalLength);
      let offset = 0;
      for (const chunk of speechChunks) {
        combinedAudio.set(chunk, offset);
        offset += chunk.length;
      }

      // Encode back to wav
      const encoded = wav.encode([combinedAudio], { sampleRate: 16000, float: true, bitDepth: 32 });
      fs.writeFileSync(outputPath, encoded);

      // Clean up temp wav
      if (fs.existsSync(tempWav)) {
        fs.unlinkSync(tempWav);
      }

      return { outputPath, segments: resultSegments };
      
    } catch (e) {
      this.logger.warn(`Silero VAD processing failed or fallback triggered, using ffmpeg silenceremove: ${e.message}`);
      
      // Clean up temp wav
      if (fs.existsSync(tempWav)) {
        fs.unlinkSync(tempWav);
      }

      // 3. Fallback: Trim silence using ffmpeg but we lose exact offset mapping
      // We will just return a single 1:1 segment mapping as a fallback
      await new Promise<void>((resolve, reject) => {
        ffmpeg(inputPath)
          .audioFilters('silenceremove=stop_periods=-1:stop_duration=1:stop_threshold=-30dB')
          .on('end', () => resolve())
          .on('error', reject)
          .save(outputPath);
      });

      // We cannot easily map timestamps if we used ffmpeg silenceremove,
      // so we return an empty array which means "no mapping available"
      return { outputPath, segments: [] };
    }
  }
}
