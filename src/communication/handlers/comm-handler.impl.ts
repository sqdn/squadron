import { CommHandler, CommReceiver, CommResponder } from '../comm-handler';
import { CommProcessor } from '../comm-processor';

export function isCommProcessor(handler: CommHandler): handler is CommProcessor {
  return typeof (handler as Partial<CommReceiver>).name === 'undefined';
}

export function isCommResponder(handler: CommHandler): handler is CommResponder {
  return typeof (handler as Partial<CommResponder>).respond === 'function';
}
