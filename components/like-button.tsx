// components/like-button.tsx
'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { ThumbsUp } from "lucide-react";

interface LikeButtonProps {
  itemId: string;
  initialLikeCount: number;  // Changed from likeCount to initialLikeCount
  likeAction: () => Promise<{ liked: boolean; error?: string }>;
  requireAuth?: boolean;
}

export default function LikeButton({ 
  itemId, 
  initialLikeCount, 
  likeAction, 
  requireAuth = false 
}: LikeButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [optimisticLikes, setOptimisticLikes] = useState(initialLikeCount);
  const { toast } = useToast();
  const router = useRouter();

  const handleLike = async () => {
    if (requireAuth) {
      toast({
        title: "Authentication required",
        description: "Please sign in to like this post",
      });
      router.push("/login");
      return;
    }

    setIsLoading(true);
    try {
      // Optimistic update
      setOptimisticLikes(prev => prev + 1);
      
      const result = await likeAction();
      
      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
        // Revert optimistic update
        setOptimisticLikes(prev => prev - 1);
      } else if (!result.liked) {
        // If unlike action
        setOptimisticLikes(prev => prev - 1);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      });
      setOptimisticLikes(prev => prev - 1);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={handleLike} 
      disabled={isLoading || requireAuth}
      className="flex items-center gap-1"
    >
      <ThumbsUp className={`h-4 w-4 ${isLoading ? "animate-pulse" : ""}`} />
      <span>{optimisticLikes}</span>
    </Button>
  );
}