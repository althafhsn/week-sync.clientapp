export interface ReportReviewAction {
  id: string;
  reportVersionId: string;
  reviewActionTypeId: string;
  comments: string | null;
  createdAt: string;
}
