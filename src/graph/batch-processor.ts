/**
 * Graph API Batch Request Processor
 */

import { GraphClient } from './graph-client';
import { logger } from '@/services/logger';

export interface BatchRequest {
  id: string;
  method: string;
  url: string;
  body?: any;
  headers?: Record<string, string>;
}

export interface BatchResponse {
  id: string;
  status: number;
  body: any;
  headers?: Record<string, string>;
}

export class BatchProcessor {
  private graphClient: GraphClient;
  private maxBatchSize: number = 20; // Graph API limit

  constructor(graphClient: GraphClient) {
    this.graphClient = graphClient;
  }

  /**
   * Process batch requests
   */
  async processBatch(requests: BatchRequest[]): Promise<BatchResponse[]> {
    if (requests.length === 0) {
      return [];
    }

    logger.info(`Processing batch of ${requests.length} requests`);

    // Split into chunks if needed
    const chunks = this.chunkRequests(requests);
    const allResponses: BatchResponse[] = [];

    for (const chunk of chunks) {
      try {
        const responses = await this.executeBatch(chunk);
        allResponses.push(...responses);
      } catch (error) {
        logger.error('Batch execution failed:', error);
        throw error;
      }
    }

    return allResponses;
  }

  private chunkRequests(requests: BatchRequest[]): BatchRequest[][] {
    const chunks: BatchRequest[][] = [];
    for (let i = 0; i < requests.length; i += this.maxBatchSize) {
      chunks.push(requests.slice(i, i + this.maxBatchSize));
    }
    return chunks;
  }