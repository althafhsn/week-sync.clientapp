export interface ReportReviewAction {
  id: string;
  reportVersionId: string;
  reviewActionTypeId: number;
  comments: string | null;
  createdAt: string;
}
