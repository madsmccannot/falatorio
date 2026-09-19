import type { CollectionAfterChangeHook } from "payload";

export const onReject: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
  operation,
  req,
}) => {
  if (operation !== "update") return doc;

  const wasNotRejected = previousDoc?.reviewStatus !== "rejected";
  const isNowRejected = doc.reviewStatus === "rejected";

  if (wasNotRejected && isNowRejected && doc.exercise) {
    req.payload.logger.info(
      `Exercise ${doc.exercise} rejected via review queue ${doc.id}. Setting status to draft.`
    );

    const exerciseId = typeof doc.exercise === "object" ? doc.exercise.id : doc.exercise;

    await req.payload.update({
      collection: "exercises",
      id: exerciseId,
      data: { status: "draft" },
    });
  }

  return doc;
};
