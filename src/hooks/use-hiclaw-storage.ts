import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hiclawApi } from '@/lib/hiclaw-api';
import type { BucketResponse, StorageObject } from '@/lib/hiclaw-api';

export function useBuckets() {
  return useQuery<BucketResponse[]>({
    queryKey: ['hiclaw-buckets'],
    queryFn: () => hiclawApi.listBuckets(),
    retry: 1,
    placeholderData: (previousData) => previousData,
    throwOnError: false,
  });
}

export function useObjects(bucket: string | null, prefix?: string) {
  return useQuery<StorageObject[]>({
    queryKey: ['hiclaw-objects', bucket, prefix],
    queryFn: () => hiclawApi.listObjects(bucket!, prefix),
    enabled: !!bucket,
    retry: 1,
    placeholderData: (previousData) => previousData,
    throwOnError: false,
  });
}

export function useDeleteObject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ bucket, key }: { bucket: string; key: string }) => hiclawApi.deleteObject(bucket, key),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['hiclaw-objects', variables.bucket],
      });
    },
  });
}

export function usePresignDownload() {
  return useMutation({
    mutationFn: ({ bucket, key }: { bucket: string; key: string }) => hiclawApi.presignDownload(bucket, key),
  });
}

export function usePresignUpload() {
  return useMutation({
    mutationFn: ({ bucket, key, contentType }: { bucket: string; key: string; contentType?: string }) => hiclawApi.presignUpload(bucket, key, contentType),
  });
}
