import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ISttProvider } from './stt.interface';
import { TranscriptPayload, TranscriptWord } from '@voiceguard/shared';
import * as https from 'https';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class DeepgramProvider implements ISttProvider {
  private readonly logger = new Logger(DeepgramProvider.name);
  private readonly apiUrl = 'https://api.deepgram.com/v1/listen';

  constructor(private configService: ConfigService) {}

  async transcribe(audioUrlOrPath: string): Promise<TranscriptPayload> {
    this.logger.log(`Transcribing via Deepgram: ${audioUrlOrPath}`);

    const response = await this.callDeepgramApi(audioUrlOrPath);
    return this.mapToTranscriptPayload(response);
  }

  private async callDeepgramApi(source: string): Promise<any> {
    const isUrl = source.startsWith('http');
    let body: Buffer;
    let contentType: string;

    if (isUrl) {
      body = Buffer.from(JSON.stringify({ url: source }));
      contentType = 'application/json';
    } else {
      // Local file path
      const fullPath = path.isAbsolute(source) ? source : path.join(process.cwd(), source);
      if (!fs.existsSync(fullPath)) {
        throw new Error(`File not found: ${fullPath}`);
      }
      body = fs.readFileSync(fullPath);
      contentType = 'audio/mpeg'; // Adjust if supporting more formats
    }

    return new Promise((resolve, reject) => {
      const url = new URL(`${this.apiUrl}?model=nova-2&smart_format=true&utterances=true&words=true&diarize=true`);

      const req = https.request(
        {
          hostname: url.hostname,
          path: url.pathname + url.search,
          method: 'POST',
          headers: {
            Authorization: `Token ${this.configService.get<string>('DEEPGRAM_API_KEY')}`,
            'Content-Type': contentType,
            'Content-Length': body.length,
          },
        },
        (res) => {
          let data = '';
          res.on('data', (chunk) => (data += chunk));
          res.on('end', () => {
            if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
              resolve(JSON.parse(data));
            } else {
              reject(new Error(`Deepgram API error: ${res.statusCode} — ${data}`));
            }
          });
        },
      );
      req.on('error', reject);
      req.write(body);
      req.end();
    });
  }

  private mapToTranscriptPayload(response: any): TranscriptPayload {
    const channel = response?.results?.channels?.[0]?.alternatives?.[0];
    if (!channel) {
      throw new Error('Invalid Deepgram response structure');
    }

    const words: TranscriptWord[] = (channel.words || []).map((w: any) => ({
      word: w.word,
      startMs: Math.round(w.start * 1000),
      endMs: Math.round(w.end * 1000),
      confidence: w.confidence,
      speaker: w.speaker, // Map Deepgram speaker ID
    }));

    return {
      fullText: channel.transcript || '',
      words,
      sttProvider: 'DEEPGRAM',
      language: response?.results?.channels?.[0]?.detected_language,
      speakerLabels: {
        0: 'AGENT',
        1: 'CUSTOMER',
      },
    };
  }
}
