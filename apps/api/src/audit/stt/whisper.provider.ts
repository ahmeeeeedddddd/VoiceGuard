import { Injectable, Logger } from '@nestjs/common';
import { ISttProvider } from './stt.interface';
import { TranscriptPayload } from '@voiceguard/shared';

/**
 * WhisperProvider — secondary STT implementation.
 * Stubbed for now; implement by replacing the thrown error with
 * an actual Whisper API HTTP call using the same ISttProvider contract.
 */
@Injectable()
export class WhisperProvider implements ISttProvider {
  private readonly logger = new Logger(WhisperProvider.name);

  async transcribe(_audioUrl: string): Promise<TranscriptPayload> {
    this.logger.warn('WhisperProvider is not yet implemented. Use DeepgramProvider.');
    throw new Error('WhisperProvider not implemented');
  }
}
