import { EventEmitter, OnEvent } from '@proc7ts/fun-events';
import { CommBuffer } from '../comm-buffer';
import { CommPacket } from '../comm-packet';

/**
 * First-in-first-out communication commands buffer of fixed capacity.
 *
 * Evicts the earliest command on overflow.
 */
export class FIFOCommBuffer<T> implements CommBuffer<T> {

  readonly #capacity: number;
  readonly #evictions = new EventEmitter<[T]>();
  readonly #commands: T[];
  #head = 0;
  #tail = 0;
  #size = 0;

  /**
   * Constructs FIFO commands buffer.
   *
   * @param capacity - Buffer capacity. At least `1`. `256` by default.
   */
  constructor(capacity = 256) {
    this.#capacity = Math.max(capacity, 1);
    this.#commands = new Array<T>(capacity);
  }

  get onEvict(): OnEvent<[T]> {
    return this.#evictions.on;
  }

  addSignal(_name: string, _signal: CommPacket, value: T): void {
    this.#add(value);
  }

  addRequest(_name: string, _request: CommPacket, value: T): void {
    this.#add(value);
  }

  #add(command: T): void {
    const index = this.#tail;

    if (++this.#tail >= this.#commands.length) {
      this.#tail = 0;
    }
    if (++this.#size > this.#capacity) {
      this.#size = this.#capacity;
      this.#evictions.send(this.#commands[this.#head]);
      if (++this.#head >= this.#commands.length) {
        this.#head = 0;
      }
    }

    this.#commands[index] = command;
  }

  pull(): T | undefined {
    if (!this.#size) {
      return;
    }

    const command = this.#commands[this.#head];

    this.#commands[this.#head] = null!;
    if (++this.#head >= this.#commands.length) {
      this.#head = 0;
    }
    --this.#size;

    return command;
  }

}
