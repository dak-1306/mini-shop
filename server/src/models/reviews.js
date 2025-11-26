import mongoose from "mongoose";

const { Schema } = mongoose;

const ReviewSchema = new Schema(
  {
    product: { type: Schema.Types.Mixed, required: true, index: true }, // ObjectId or numeric id from upstream
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, default: "" },
    body: { type: String, default: "" },

    images: { type: [String], default: [] },

    // helpful tracking to prevent duplicate votes
    helpfulBy: { type: [Schema.Types.ObjectId], ref: "User", default: [] },
    helpfulCount: { type: Number, default: 0 },

    // moderation status
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "approved", // change to "pending" if you moderate reviews
      index: true,
    },

    ip: { type: String, default: null },
    meta: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

// text index for search on title/body
ReviewSchema.index({ title: "text", body: "text" });

// compute aggregates for product
ReviewSchema.statics.computeAggregates = async function (productId) {
  const Review = this;
  const pipeline = [
    { $match: { product: productId, status: "approved" } },
    {
      $group: {
        _id: "$product",
        avgRating: { $avg: "$rating" },
        count: { $sum: 1 },
      },
    },
  ];
  const res = await Review.aggregate(pipeline).exec();
  if (!res || res.length === 0) return { avgRating: 0, count: 0 };
  return {
    avgRating: Number(res[0].avgRating.toFixed(2)),
    count: res[0].count,
  };
};

// add or update a user's review for a product (one review per user per product)
ReviewSchema.statics.addOrUpdate = async function ({
  userId,
  productId,
  payload = {},
  ip = null,
}) {
  const Review = this;
  const existing = await Review.findOne({
    user: userId,
    product: productId,
  }).exec();
  if (existing) {
    Object.assign(existing, {
      rating: payload.rating ?? existing.rating,
      title: payload.title ?? existing.title,
      body: payload.body ?? existing.body,
      images: Array.isArray(payload.images) ? payload.images : existing.images,
      status: payload.status ?? existing.status,
      ip: ip ?? existing.ip,
      meta: payload.meta ?? existing.meta,
    });
    await existing.save();
    return existing;
  }
  const doc = await Review.create({
    user: userId,
    product: productId,
    rating: payload.rating,
    title: payload.title ?? "",
    body: payload.body ?? "",
    images: Array.isArray(payload.images) ? payload.images : [],
    ip,
    meta: payload.meta ?? {},
    status: payload.status ?? "approved",
  });
  return doc;
};

// mark helpful: toggle helpful by user
ReviewSchema.statics.toggleHelpful = async function (reviewId, userId) {
  const Review = this;
  const r = await Review.findById(reviewId).exec();
  if (!r) throw new Error("Review not found");
  const uid = String(userId);
  const exists = (r.helpfulBy || []).map(String).includes(uid);
  if (exists) {
    r.helpfulBy = (r.helpfulBy || []).filter((x) => String(x) !== uid);
  } else {
    r.helpfulBy = [...(r.helpfulBy || []), userId];
  }
  r.helpfulCount = (r.helpfulBy || []).length;
  await r.save();
  return { helpfulCount: r.helpfulCount, acted: !exists };
};

const Review = mongoose.models.Review || mongoose.model("Review", ReviewSchema);
export default Review;
