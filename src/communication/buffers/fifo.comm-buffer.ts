import { EventEmitter } from '@proc7ts/fun-events';
import { CommBuffer } from '../comm-buffer';
import { CommPacket } from '../comm-packet';

/**
 * Creates first-in-first-out communication commands buffer of fixed capacity.
 *
 * Evicts the earliest command on overflow.
 *
 * @param capacity - Buffer capacity. At least `1`. `256` by default.
 */
export function fifoCommBuffer<T>(capacity = 256): CommBuffer<T> {
  capacity = Math.max(capacity, 1);

  const evictions = new EventEmitter<[T]>();
  const commands = new Array<T>(capacity);
  let head = 0;
  let tail = 0;
  let size = 0;

  const addCommand = (command: T): void => {

    const index = tail;

    if (++tail >= commands.length) {
      tail = 0;
    }
    if (++size > capacity) {
      size = capacity;
      evictions.send(commands[head]);
      if (++head >= commands.length) {
        head = 0;
      }
    }

    commands[index] = command;
  };

  return {
    onEvict: evictions.on,
    addSignal(_name: string, _signal: CommPacket, value: T): void {
      addCommand(value);
    },
    addRequest(_name: string, _request: CommPacket, value: T): void {
      addCommand(value);
    },
    pull(): T | undefined {
      if (!size) {
        return;
      }

      const command = commands[head];

      commands[head] = null!;
      if (++head >= commands.length) {
        head = 0;
      }
      --size;

      return command;
    },
  };
}
