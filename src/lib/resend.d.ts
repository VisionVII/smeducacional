declare module '@/lib/resend' {
  export interface ResendEmailOptions {
    from: string;
    to: string | string[];
    subject: string;
    html: string;
  }
  export interface ResendEmailsApi {
    send(options: ResendEmailOptions): Promise<{ id: string } | void>;
  }
  export const resend: {
    emails: ResendEmailsApi;
  };
}
