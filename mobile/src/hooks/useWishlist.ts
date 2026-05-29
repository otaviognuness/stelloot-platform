import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';

import { useAuth } from '@/src/contexts/AuthContext';
import { getWishlist, removeWishlist, saveWishlist, updateTargetPrice } from '@/src/services/api';
import { Deal } from '@/src/types/api';
import { getGameKey } from '@/src/utils/deals';

export function useWishlist() {
  const { session } = useAuth();

  return useQuery({
    enabled: Boolean(session?.token),
    queryFn: () => getWishlist(session!.token),
    queryKey: ['wishlist', session?.user.id],
  });
}

export function useWishlistActions() {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const queryKey = ['wishlist', session?.user.id];

  const saveMutation = useMutation({
    mutationFn: ({ game, targetPrice }: { game: Deal; targetPrice?: number }) =>
      saveWishlist(session!.token, game, targetPrice),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const removeMutation = useMutation({
    mutationFn: (wishlistId: number) => removeWishlist(session!.token, wishlistId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const targetMutation = useMutation({
    mutationFn: ({ targetPrice, wishlistId }: { targetPrice: number; wishlistId: number }) =>
      updateTargetPrice(session!.token, wishlistId, targetPrice),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  return {
    isSaved(game: Deal, items: Deal[] = []) {
      return items.some((item) => getGameKey(item) === getGameKey(game));
    },
    remove: removeMutation.mutateAsync,
    save: saveMutation.mutateAsync,
    saving: saveMutation.isPending || removeMutation.isPending || targetMutation.isPending,
    setTarget: targetMutation.mutateAsync,
  };
}

export function useGameActions() {
  const { session } = useAuth();
  const wishlistQuery = useWishlist();
  const actions = useWishlistActions();
  const [targetGame, setTargetGame] = useState<Deal | null>(null);
  const [error, setError] = useState('');
  const wishlist = wishlistQuery.data || [];

  function findSaved(game: Deal) {
    return wishlist.find((item) => getGameKey(item) === getGameKey(game));
  }

  function requireLogin() {
    if (session) return true;
    router.push('/(auth)/login');
    return false;
  }

  async function toggle(game: Deal) {
    if (!requireLogin()) return;
    const saved = findSaved(game);
    try {
      setError('');
      if (saved?.wishlistId) {
        await actions.remove(saved.wishlistId);
      } else {
        await actions.save({ game });
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Não foi possível atualizar a wishlist.');
    }
  }

  function openTarget(game: Deal) {
    if (!requireLogin()) return;
    setTargetGame(findSaved(game) || game);
  }

  async function saveTarget(targetPrice: number) {
    if (!targetGame || !session) return;
    try {
      setError('');
      if (targetGame.wishlistId) {
        await actions.setTarget({ targetPrice, wishlistId: targetGame.wishlistId });
      } else {
        await actions.save({ game: targetGame, targetPrice });
      }
      setTargetGame(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Não foi possível atualizar o preço alvo.');
    }
  }

  return {
    closeTarget: () => setTargetGame(null),
    error,
    findSaved,
    loading: actions.saving || wishlistQuery.isLoading,
    openTarget,
    saveTarget,
    targetGame,
    toggle,
    wishlist,
  };
}
