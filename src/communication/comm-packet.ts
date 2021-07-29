import { TransferListItem } from 'worker_threads';

export interface CommPacket {

  readonly meta?: CommMeta | undefined;

}

export interface CommMeta {

  readonly transferList?: readonly TransferListItem[] | undefined;

  readonly streamId?: string | undefined;

  readonly [name: string]: unknown | undefined;

}
