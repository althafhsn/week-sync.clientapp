export interface CreateReportReviewActionRequest {
  reportVersionId: string;
  reviewActionTypeId: number;
  comments?: string;
}
