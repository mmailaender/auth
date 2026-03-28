import type { AuthConstants } from "./auth.constants.types";

export const AUTH_CONSTANTS: AuthConstants = {
  providers: {
    password: true,
    github: true,
    emailOTP: true,
    magicLink: true,
  },
  organizations: true,
  sendEmails: true,
  deviceAuthorization: true,
  apiKeys: true,
};
