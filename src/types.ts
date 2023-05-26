export type Message = {
  text: string;
  type: 'request' | 'response';
  pending?: true;
}
