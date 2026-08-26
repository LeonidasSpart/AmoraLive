import { phase2Request } from "./phase2Api";

export const phase5Api = {
  deleteRequest: (email: string) =>
    phase2Request("/auth/request-account-deletion", { method: "POST", body: JSON.stringify({ email }) }),
  videoDateToken: (matchId: string) => phase2Request(`/matches/${matchId}/video-date/token`)
};
