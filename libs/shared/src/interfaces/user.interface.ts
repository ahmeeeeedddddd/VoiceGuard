export enum Role {
  ADMIN = 'ADMIN',
  COMPLIANCE_OFFICER = 'COMPLIANCE_OFFICER',
  AUDITOR = 'AUDITOR'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: Date;
}
