export interface SellerReview {
  id: string;
  sellerName: string;
  reviewerName: string;
  rating: number; // 1-5
  comment: string;
  listingTitle?: string;
  createdAt: string;
  helpful: number;
}

export interface SellerReputation {
  sellerName: string;
  avgRating: number;
  totalReviews: number;
  totalSales: number;
  responseTimeHours: number;
  joinedAt: string;
  badges: string[]; // "verified" | "top_seller" | "fast_shipper" | "trusted"
}

export const MOCK_REVIEWS: SellerReview[] = [
  {
    id: "rv-1", sellerName: "محمد العلوي", reviewerName: "يوسف بنعلي", rating: 5,
    comment: "بائع موثوق، العينة كما في الوصف بالضبط. شحن سريع وتغليف ممتاز.",
    listingTitle: "Chondrite H5 — Tissint", createdAt: "2026-05-20", helpful: 12,
  },
  {
    id: "rv-2", sellerName: "محمد العلوي", reviewerName: "Sarah M.", rating: 5,
    comment: "Excellent communication and authentic specimen. Highly recommended.",
    listingTitle: "Chondrite H5 — Tissint", createdAt: "2026-05-15", helpful: 8,
  },
  {
    id: "rv-3", sellerName: "محمد العلوي", reviewerName: "أحمد", rating: 4,
    comment: "جيد جداً، لكن التغليف يمكن تحسينه قليلاً.",
    createdAt: "2026-05-02", helpful: 3,
  },
  {
    id: "rv-4", sellerName: "ورشة الأطلس", reviewerName: "Pierre L.", rating: 5,
    comment: "Magnifique tranche de pallasite, polissage parfait. Vendeur très professionnel.",
    listingTitle: "Pallasite — شريحة مصقولة", createdAt: "2026-05-18", helpful: 15,
  },
  {
    id: "rv-5", sellerName: "ورشة الأطلس", reviewerName: "خديجة", rating: 5,
    comment: "تعامل راقي وجودة عالية. سأتعامل معهم مجدداً.",
    createdAt: "2026-04-28", helpful: 9,
  },
  {
    id: "rv-6", sellerName: "ورشة الأطلس", reviewerName: "Mark T.", rating: 4,
    comment: "Good quality, slightly delayed shipping but worth the wait.",
    createdAt: "2026-04-15", helpful: 4,
  },
];

export const MOCK_REPUTATIONS: Record<string, SellerReputation> = {
  "محمد العلوي": {
    sellerName: "محمد العلوي", avgRating: 4.7, totalReviews: 23, totalSales: 47,
    responseTimeHours: 2, joinedAt: "2024-03-15",
    badges: ["verified", "top_seller", "fast_shipper"],
  },
  "ورشة الأطلس": {
    sellerName: "ورشة الأطلس", avgRating: 4.9, totalReviews: 56, totalSales: 124,
    responseTimeHours: 1, joinedAt: "2023-08-02",
    badges: ["verified", "top_seller", "fast_shipper", "trusted"],
  },
};

export function getReputation(sellerName: string): SellerReputation {
  return (
    MOCK_REPUTATIONS[sellerName] || {
      sellerName,
      avgRating: 4.2,
      totalReviews: 5,
      totalSales: 8,
      responseTimeHours: 6,
      joinedAt: "2025-01-01",
      badges: [],
    }
  );
}

export function getReviewsFor(sellerName: string): SellerReview[] {
  const own = MOCK_REVIEWS.filter((r) => r.sellerName === sellerName);
  if (own.length) return own;
  return [
    {
      id: `rv-gen-${sellerName}`, sellerName, reviewerName: "مستخدم",
      rating: 4, comment: "تجربة جيدة بشكل عام.", createdAt: "2026-05-01", helpful: 2,
    },
  ];
}
