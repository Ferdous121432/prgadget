"use client";

import Rating from "@/components/shared/product/rating";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getReviews } from "@/lib/actions/review.actions";
import { formatDateTime } from "@/lib/utils";
import { Calendar, User } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import ReviewForm from "./ReviewForm";

type ReviewWithUser = {
  id: string;
  title: string;
  description: string;
  rating: number;
  isVerifiedPurchase?: boolean;
  userId: string;
  createdAt?: Date | null;
  user?: {
    name?: string | null;
    image?: string | null;
  } | null;
};

const ReviewList = ({
  userId,
  productId,
  productSlug,
}: {
  userId: string;
  productId: string;
  productSlug: string;
}) => {
  const [reviews, setReviews] = useState<ReviewWithUser[]>([]);

  useEffect(() => {
    const loadReviews = async () => {
      const res = (await getReviews({ productId })) as { data: any };
      setReviews(res.data);
    };

    loadReviews();
  }, [productId]);

  // Reload reviews after created or updated
  const reload = async () => {
    const res = (await getReviews({ productId })) as { data: any };
    setReviews([...res.data]);
  };

  return (
    <div className="space-y-4">
      {reviews.length === 0 && <div>No reviews yet</div>}
      {userId ? (
        <ReviewForm
          userId={userId}
          productId={productId}
          onReviewSubmitted={reload}
        />
      ) : (
        <div>
          Please
          <Link
            className="text-blue-700 px-2"
            href={`/login?callbackUrl=/product/${productSlug}`}>
            sign in
          </Link>
          to write a review
        </div>
      )}
      <div className="flex flex-col gap-3">
        {reviews.map((review) => (
          <Card key={review.id}>
            <CardHeader>
              <div className="flex-between">
                <div className="flex flex-wrap items-center gap-2">
                  <CardTitle>{review.title}</CardTitle>
                  {review.isVerifiedPurchase ? (
                    <Badge
                      variant="outline"
                      className="border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                      Verified Purchase
                    </Badge>
                  ) : null}
                </div>
              </div>
              <CardDescription>{review.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-4 text-sm text-muted-foreground">
                <Rating value={review.rating} />
                <div className="flex items-center">
                  <User className="mr-1 h-3 w-3" />
                  {review.userId ? review.user?.name || "User" : "User"}
                </div>
                <div className="flex items-center">
                  <Calendar className="mr-1 h-3 w-3" />
                  {review.createdAt
                    ? formatDateTime(review.createdAt).dateTime
                    : ""}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ReviewList;
