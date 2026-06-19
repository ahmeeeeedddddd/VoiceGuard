import { Injectable, Logger } from '@nestjs/common';
import { ISttProvider } from './stt.interface';
import { TranscriptPayload, TranscriptWord } from '@voiceguard/shared';
import * as https from 'https';

@Injectable()
export class DeepgramProvider implements ISttProvider {
  private readonly logger = new Logger(DeepgramProvider.name);
  private readonly apiKey = process.env.DEEPGRAM_API_KEY || '';
  private readonly apiUrl = 'https://api.deepgram.com/v1/listen';

  async transcribe(audioUrl: string): Promise<TranscriptPayload> {
    this.logger.log(`Transcribing via Deepgram: ${audioUrl}`);

    const response = await this.callDeepgramApi(audioUrl);
    return this.mapToTranscriptPayload(response);
  }

  private callDeepgramApi(audioUrl: string): Promise<any> {
    const body = JSON.stringify({ url: audioUrl });

    return new Promise((resolve, reject) => {
      const url = new URL(`${this.apiUrl}?model=nova-2&smart_format=true&utterances=true&words=true`);

      const req = https.request(
        {
          hostname: url.hostname,
          path: url.pathname + url.search,
          method: 'POST',
          headers: {
            Authorization: `Token ${this.apiKey}`,
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(body),
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
    }));

    return {
      fullText: channel.transcript || '',
      words,
      sttProvider: 'DEEPGRAM',
      language: response?.results?.channels?.[0]?.detected_language,
    };
  }
}
