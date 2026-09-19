import type { CollectionAfterChangeHook } from "payload";

export const onPublish: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
  operation,
  req,
}) => {
  if (operation !== "update") return doc;

  const wasNotLive = previousDoc?.status !== "live";
  const isNowLive = doc.status === "live";

  if (wasNotLive && isNowLive) {
    req.payload.logger.info(
      `Exercise ${doc.id} published (type: ${doc.type}, lesson: ${doc.lesson})`
    );

    await req.payload.update({
      collection: "exercises",
      id: doc.id,
      data: {
        version: (doc.version ?? 1) + 1,
      },
    });

    const pendingReviews = await req.payload.find({
      collection: "review-queue",
      where: {
        exercise: { equals: doc.id },
        reviewStatus: { equals: "pending" },
      },
    });

    for (const review of pendingReviews.docs) {
      await req.payload.update({
        collection: "review-queue",
        id: review.id,
        data: { reviewStatus: "approved" },
      });
    }
  }

  return doc;
};
