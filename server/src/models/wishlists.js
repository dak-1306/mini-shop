import mongoose from "mongoose";

const { Schema } = mongoose;

const WishlistItemSchema = new Schema(
  {
    productId: { type: Schema.Types.Mixed, required: true }, // support ObjectId or external numeric id
    name: { type: String, default: "" },
    image: { type: String, default: "" },
    addedAt: { type: Date, default: () => new Date() },
    meta: { type: Schema.Types.Mixed, default: {} },
  },
  { _id: false }
);

const WishlistSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    items: { type: [WishlistItemSchema], default: [] },
  },
  { timestamps: true }
);

// Find or create wishlist for user
WishlistSchema.statics.getOrCreateByUser = async function (userId) {
  const Wishlist = this;
  let doc = await Wishlist.findOne({ userId }).exec();
  if (doc) return doc;
  return Wishlist.create({ userId, items: [] });
};

// Add item (atomic-ish): if exists -> update addedAt, otherwise push new
WishlistSchema.statics.addItem = async function (userId, product) {
  const Wishlist = this;
  const pid = product?.id ?? product;
  if (!pid) throw new Error("product id required");

  // Try update existing item addedAt
  const updated = await Wishlist.findOneAndUpdate(
    { userId, "items.productId": pid },
    { $set: { "items.$.addedAt": new Date() } },
    { new: true }
  ).exec();
  if (updated) return updated;

  // push new item (create wishlist if not exists)
  const item = {
    productId: pid,
    name: product?.title ?? product?.name ?? "",
    image:
      product?.thumbnail ??
      (Array.isArray(product?.images) ? product.images[0] : undefined),
    addedAt: new Date(),
    meta: product?.meta ?? {},
  };

  return Wishlist.findOneAndUpdate(
    { userId },
    { $push: { items: item } },
    { new: true, upsert: true }
  ).exec();
};

// Remove item
WishlistSchema.statics.removeItem = async function (userId, productId) {
  const Wishlist = this;
  return Wishlist.findOneAndUpdate(
    { userId },
    { $pull: { items: { productId } } },
    { new: true }
  ).exec();
};

// Toggle item: add if missing, remove if exists
WishlistSchema.statics.toggleItem = async function (userId, product) {
  const Wishlist = this;
  const pid = product?.id ?? product;
  if (!pid) throw new Error("product id required");

  const exists = await Wishlist.findOne({ userId, "items.productId": pid })
    .lean()
    .exec();
  if (exists) {
    await Wishlist.findOneAndUpdate(
      { userId },
      { $pull: { items: { productId: pid } } }
    ).exec();
    return { added: false };
  }
  await Wishlist.addItem(userId, product);
  return { added: true };
};

WishlistSchema.statics.isInWishlist = async function (userId, productId) {
  const Wishlist = this;
  const found = await Wishlist.findOne({ userId, "items.productId": productId })
    .lean()
    .exec();
  return Boolean(found);
};

WishlistSchema.statics.clearWishlist = async function (userId) {
  const Wishlist = this;
  return Wishlist.findOneAndUpdate(
    { userId },
    { $set: { items: [] } },
    { new: true }
  ).exec();
};

const Wishlist =
  mongoose.models.Wishlist || mongoose.model("Wishlist", WishlistSchema);
export default Wishlist;
