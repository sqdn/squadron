export interface CommPacket {

  readonly meta?: CommMeta | undefined;

}

export interface CommMeta {

  readonly transferList?: unknown[] | undefined;

  readonly streamId?: string | undefined;

  readonly [name: string]: unknown | undefined;

}
