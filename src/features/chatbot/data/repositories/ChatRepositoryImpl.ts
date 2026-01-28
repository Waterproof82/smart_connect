/**
 * ChatRepositoryImpl
 * 
 * Implementation of IChatRepository using GeminiDataSource.
 * Follows Dependency Inversion Principle.
 */

import {
  IChatRepository,
  GenerateResponseParams,
} from '../../domain/repositories/IChatRepository';
import { GeminiDataSource } from '../datasources/GeminiDataSource';

export class ChatRepositoryImpl implements IChatRepository {
  constructor(private readonly geminiDataSource: GeminiDataSource) {}

  async generateResponse(params: GenerateResponseParams): Promise<string> {
    return this.geminiDataSource.generateResponse({
      prompt: params.userQuery,
      temperature: params.temperature,
      maxTokens: params.maxTokens,
    });
  }
}
