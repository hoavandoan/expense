// @ts-ignore
import { decode } from 'base64-arraybuffer';
import * as FileSystem from 'expo-file-system/legacy';
import { supabase } from '../supabase';

/**
 * Upload an image to Supabase Storage
 * @param uri Local file URI
 * @param bucket Bucket name
 * @param path Internal path in bucket
 */
export async function uploadImage(uri: string, bucket: string, path: string): Promise<string> {
    try {
        const base64 = await FileSystem.readAsStringAsync(uri, {
            encoding: 'base64',
        });

        const extension = uri.split('.').pop() || 'jpg';
        const filePath = `${path}.${extension}`;
        const contentType = `image/${extension}`;

        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(filePath, decode(base64), {
                contentType,
                upsert: true,
            });

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
            .from(bucket)
            .getPublicUrl(data.path);

        return publicUrl;
    } catch (error) {
        console.error('Error uploading image:', error);
        throw error;
    }
}
