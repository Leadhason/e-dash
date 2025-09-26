import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Star, 
  MessageCircle, 
  User, 
  Calendar,
  ChevronDown,
  ChevronUp,
  Trash2,
  Flag,
  CheckCircle,
  XCircle,
  TrendingUp,
  Filter
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAuthHeaders } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface ProductRating {
  id: string;
  rating: number;
  comment?: string;
  customerName: string;
  customerEmail: string;
  isVerifiedPurchase: boolean;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

interface ProductRatingsManagerProps {
  productId: string;
  productName: string;
}

interface RatingStats {
  averageRating: number;
  totalRatings: number;
  ratingDistribution: { [key: number]: number };
}

export function ProductRatingsManager({ productId, productName }: ProductRatingsManagerProps) {
  const [expandedReviews, setExpandedReviews] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [ratingFilter, setRatingFilter] = useState<string>("all");
  const [isStatsExpanded, setIsStatsExpanded] = useState(true);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: ratings, isLoading } = useQuery<ProductRating[]>({
    queryKey: [`/api/products/${productId}/ratings`],
    queryFn: async () => {
      const response = await fetch(`/api/products/${productId}/ratings`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch ratings");
      return response.json();
    },
  });

  const { data: stats } = useQuery<RatingStats>({
    queryKey: [`/api/products/${productId}/rating-stats`],
    queryFn: async () => {
      const response = await fetch(`/api/products/${productId}/rating-stats`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch rating stats");
      return response.json();
    },
  });

  const updateRatingStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'approved' | 'rejected' }) => {
      const response = await fetch(`/api/product-ratings/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update rating status");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/products/${productId}/ratings`] });
      queryClient.invalidateQueries({ queryKey: [`/api/products/${productId}/rating-stats`] });
      toast({
        title: "Success",
        description: "Rating status updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteRatingMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/product-ratings/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete rating");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/products/${productId}/ratings`] });
      queryClient.invalidateQueries({ queryKey: [`/api/products/${productId}/rating-stats`] });
      toast({
        title: "Success",
        description: "Rating deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'sm') => {
    const sizeClasses = {
      sm: 'h-3 w-3',
      md: 'h-4 w-4',
      lg: 'h-5 w-5'
    };

    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClasses[size]} ${
              star <= rating 
                ? 'fill-yellow-400 text-yellow-400' 
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'approved':
        return 'default';
      case 'rejected':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-3 w-3" />;
      case 'rejected':
        return <XCircle className="h-3 w-3" />;
      default:
        return <MessageCircle className="h-3 w-3" />;
    }
  };

  const toggleExpandReview = (id: string) => {
    const newExpanded = new Set(expandedReviews);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedReviews(newExpanded);
  };

  const handleApprove = (rating: ProductRating) => {
    updateRatingStatusMutation.mutate({ id: rating.id, status: 'approved' });
  };

  const handleReject = (rating: ProductRating) => {
    updateRatingStatusMutation.mutate({ id: rating.id, status: 'rejected' });
  };

  const handleDelete = (rating: ProductRating) => {
    if (confirm(`Are you sure you want to delete this rating from ${rating.customerName}?`)) {
      deleteRatingMutation.mutate(rating.id);
    }
  };

  const filteredRatings = ratings?.filter(rating => {
    if (statusFilter !== "all" && rating.status !== statusFilter) return false;
    if (ratingFilter !== "all" && rating.rating !== parseInt(ratingFilter)) return false;
    return true;
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Star className="h-5 w-5" />
              Ratings & Reviews
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Manage customer feedback for {productName}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[130px] h-8">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={ratingFilter} onValueChange={setRatingFilter}>
              <SelectTrigger className="w-[100px] h-8">
                <SelectValue placeholder="Rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stars</SelectItem>
                <SelectItem value="5">5 Stars</SelectItem>
                <SelectItem value="4">4 Stars</SelectItem>
                <SelectItem value="3">3 Stars</SelectItem>
                <SelectItem value="2">2 Stars</SelectItem>
                <SelectItem value="1">1 Star</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Rating Statistics */}
        {stats && (
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => setIsStatsExpanded(!isStatsExpanded)}
              className="w-full justify-between p-0 h-auto hover:bg-transparent"
            >
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                <span className="font-medium">Rating Overview</span>
              </div>
              {isStatsExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
            
            {isStatsExpanded && (
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">
                      {stats.averageRating.toFixed(1)}
                    </div>
                    <div className="flex justify-center mb-1">
                      {renderStars(Math.round(stats.averageRating), 'md')}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {stats.totalRatings} reviews
                    </div>
                  </div>
                  
                  <div className="md:col-span-2 space-y-2">
                    {[5, 4, 3, 2, 1].map((star) => {
                      const count = stats.ratingDistribution[star] || 0;
                      const percentage = stats.totalRatings ? (count / stats.totalRatings) * 100 : 0;
                      
                      return (
                        <div key={star} className="flex items-center gap-3">
                          <div className="flex items-center gap-1 w-12">
                            <span className="text-sm">{star}</span>
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          </div>
                          <Progress value={percentage} className="flex-1 h-2" />
                          <span className="text-sm text-muted-foreground w-8">
                            {count}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
            <Separator className="mt-4" />
          </div>
        )}

        {/* Ratings List */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border border-border rounded-lg p-4 animate-pulse">
                <div className="flex items-start space-x-3">
                  <div className="h-10 w-10 bg-muted rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-32"></div>
                    <div className="h-3 bg-muted rounded w-24"></div>
                    <div className="h-16 bg-muted rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredRatings?.length ? (
          <div className="space-y-4">
            {filteredRatings.map((rating) => (
              <div
                key={rating.id}
                className="border border-border rounded-lg p-4 hover:bg-accent transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="" />
                      <AvatarFallback>
                        {rating.customerName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-medium">{rating.customerName}</span>
                        {renderStars(rating.rating)}
                        <Badge 
                          variant={getStatusBadgeVariant(rating.status)}
                          className="text-xs flex items-center gap-1"
                        >
                          {getStatusIcon(rating.status)}
                          {rating.status.charAt(0).toUpperCase() + rating.status.slice(1)}
                        </Badge>
                        {rating.isVerifiedPurchase && (
                          <Badge variant="outline" className="text-xs">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verified Purchase
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(rating.createdAt), 'MMM dd, yyyy')}
                        </span>
                        <span>{rating.customerEmail}</span>
                      </div>
                      
                      {rating.comment && (
                        <div className="mt-3">
                          <p className={`text-sm leading-relaxed ${
                            !expandedReviews.has(rating.id) && rating.comment.length > 200 
                              ? 'line-clamp-3' 
                              : ''
                          }`}>
                            {rating.comment}
                          </p>
                          {rating.comment.length > 200 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleExpandReview(rating.id)}
                              className="mt-2 h-auto p-0 text-xs text-primary hover:bg-transparent"
                            >
                              {expandedReviews.has(rating.id) ? 'Show less' : 'Show more'}
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex space-x-1 ml-4">
                    {rating.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleApprove(rating)}
                          className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
                          disabled={updateRatingStatusMutation.isPending}
                        >
                          <CheckCircle className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReject(rating)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                          disabled={updateRatingStatusMutation.isPending}
                        >
                          <XCircle className="h-3 w-3" />
                        </Button>
                      </>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(rating)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                      disabled={deleteRatingMutation.isPending}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground mb-2">No reviews yet</p>
            <p className="text-xs text-muted-foreground">
              Customer reviews will appear here once they start rating this product
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default ProductRatingsManager;