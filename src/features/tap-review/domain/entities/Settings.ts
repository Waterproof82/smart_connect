export interface Settings {
  id: string;
  name: string;
  value: string;
  createdAt: Date;
  updatedAt: Date;
  // Campos adicionales parseados del value
  whatsappPhone?: string;
}
