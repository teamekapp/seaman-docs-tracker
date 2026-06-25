export function getDaysLeft(expiryDate: string): number {
    if (!expiryDate) return 0;
    const today = new Date();
    const expiry = new Date(expiryDate);
    const differenceInTime = expiry.getTime() - today.getTime();
    return Math.ceil(differenceInTime / (1000 * 3600 * 24));
  }
  
  export function getDocumentStatus(expiryDate: string, reminderDays: number) {
    const daysLeft = getDaysLeft(expiryDate);
    if (daysLeft < 0) return 'expired';
    if (daysLeft <= reminderDays) return 'warning';
    return 'good';
  }