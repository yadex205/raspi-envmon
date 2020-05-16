import axios, { AxiosInstance } from 'axios';

interface ConstructorArgs {
  apiKey: string;
  agentId: string;
}

export interface MetricsItem {
  name: string;
  namespace?: string;
  tags?: Record<string, string>;
  data_point: {
    value: number;
    timestamp?: number;
    meta?: Record<string, string>;
  };
}

export class Machinist {
  private readonly client: AxiosInstance;
  private readonly apiKey: string;
  private readonly agentId: string;

  constructor(args: ConstructorArgs) {
    this.apiKey = args.apiKey;
    this.agentId = args.agentId;

    this.client = axios.create({
      baseURL: 'https://gw.machinist.iij.jp/',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      }
    });
  }

  public async send(metrics: MetricsItem[]) {
    await this.client.post('/endpoint', {
      agent_id: this.agentId,
      metrics,
    });
  }
}
