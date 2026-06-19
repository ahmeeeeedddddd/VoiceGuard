import { TranscriptPayload } from '@voiceguard/shared';

export interface ISttProvider {
  transcribe(audioUrl: string): Promise<TranscriptPayload>;
}

export const STT_PROVIDER_TOKEN = 'STT_PROVIDER';
