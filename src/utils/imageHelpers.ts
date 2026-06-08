import { documentDirectory, makeDirectoryAsync, copyAsync } from 'expo-file-system/legacy';

export async function copyImageToAppStorage(uri: string, folder: string = 'menu_images'): Promise<string> {
  const dir = `${documentDirectory}${folder}/`;
  await makeDirectoryAsync(dir, { intermediates: true });
  const dest = `${dir}${Date.now()}.jpg`;
  await copyAsync({ from: uri, to: dest });
  return dest;
}
