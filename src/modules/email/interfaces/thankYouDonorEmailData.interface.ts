export interface ThankYouDonorEmailData {
  donorName: string;
  bloodGroup: string; // e.g., "A", "B", "AB", "O"
  bloodRh: string; // e.g., "+", "-"
  bloodComponent: string; // e.g., "Máu toàn phần", "Hồng cầu", "Tiểu cầu"
  bloodVolume: number; // in ml - volume used for emergency
  donationDate: string; // formatted date when blood was donated
  usageDate?: string; // formatted date when blood was used (optional)
}
