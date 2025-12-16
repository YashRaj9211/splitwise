import { createAvatar } from '@dicebear/core';
import { avataaars } from '@dicebear/collection';

export async function generateAvatar(seed: string): Promise<string> {
  const avatar = createAvatar(avataaars, {
    seed,
    backgroundColor: ['b6e3f4', 'c0aede', 'd1d4f9'],
    radius: 50
  });

  return avatar.toDataUri();
}
