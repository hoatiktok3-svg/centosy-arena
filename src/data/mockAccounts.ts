export type UserRole = 'admin' | 'staff';

export type Department =
  | 'van-phong'
  | 'cua-hang'
  | 'kho'
  | 'tmdt'
  | 'kdtt';

export interface MockAccount {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  department: Department;
  avatarInitials: string;
  score: number;
  title: string;
}

export const mockAccounts: MockAccount[] = [
  {
    id: 'acc-001',
    name: 'Admin Centosy',
    email: 'admin@centosy.vn',
    password: '123456',
    role: 'admin',
    department: 'van-phong',
    avatarInitials: 'AC',
    score: 9999,
    title: 'Quản trị viên',
  },
  {
    id: 'acc-002',
    name: 'Nguyễn Thị Lan',
    email: 'vanphong@centosy.vn',
    password: '123456',
    role: 'staff',
    department: 'van-phong',
    avatarInitials: 'NL',
    score: 1240,
    title: 'Nhân viên Văn phòng',
  },
  {
    id: 'acc-003',
    name: 'Trần Văn Hùng',
    email: 'cuahang@centosy.vn',
    password: '123456',
    role: 'staff',
    department: 'cua-hang',
    avatarInitials: 'TH',
    score: 1580,
    title: 'Tư vấn viên Cửa hàng',
  },
  {
    id: 'acc-004',
    name: 'Lê Thị Mai',
    email: 'kho@centosy.vn',
    password: '123456',
    role: 'staff',
    department: 'kho',
    avatarInitials: 'LM',
    score: 970,
    title: 'Nhân viên Kho',
  },
  {
    id: 'acc-005',
    name: 'Phạm Minh Tuấn',
    email: 'tmdt@centosy.vn',
    password: '123456',
    role: 'staff',
    department: 'tmdt',
    avatarInitials: 'PT',
    score: 1820,
    title: 'Chuyên viên TMĐT',
  },
  {
    id: 'acc-006',
    name: 'Võ Thị Hoa',
    email: 'kdtt@centosy.vn',
    password: '123456',
    role: 'staff',
    department: 'kdtt',
    avatarInitials: 'VH',
    score: 2100,
    title: 'Chuyên viên KDTT',
  },
];

export const findAccount = (email: string, password: string): MockAccount | null =>
  mockAccounts.find(a => a.email === email && a.password === password) ?? null;
