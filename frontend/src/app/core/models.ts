// APIとやり取りする型定義
export interface User {
  id: number;
  email: string;
  displayName: string;
}

export interface Album {
  id: number;
  name: string;
  eventDate: string | null;
  description: string | null;
  coverPhotoId: number | null;
  coverUrl: string | null;
  photoCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Photo {
  id: number;
  albumId: number;
  url: string;
  originalName: string;
  sortOrder: number;
  isCover: boolean;
  uploadedAt: string;
}

export interface ApiError {
  error: { code: string; message: string };
}
