declare module "@paystack/inline-js" {
  interface TransactionOptions {
    key: string;
    email?: string;
    amount: number;
    currency?: string;
    ref?: string;
    metadata?: Record<string, unknown>;
    channels?: string[];
    onSuccess?: (transaction: { reference: string; [key: string]: unknown }) => void;
    onCancel?: () => void;
    onError?: (error: unknown) => void;
  }

  class PaystackPop {
    newTransaction(options: TransactionOptions): void;
    resumeTransaction(accessCode: string, options?: Partial<TransactionOptions>): void;
    cancelTransaction(): void;
    isLoaded(): boolean;
  }

  export default PaystackPop;
}
