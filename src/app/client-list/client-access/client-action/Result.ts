import { ClientInfo } from '../../models';
export class Result {
  type: string;
  client: ClientInfo;
  payload: any;
  constructor(client: ClientInfo) {
    this.client = client;
  }
}
