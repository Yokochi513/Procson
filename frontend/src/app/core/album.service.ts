// アルバム・写真API（FR-1〜5）のHTTPクライアント。
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { API_BASE } from './config';
import { Album, Photo } from './models';

@Injectable({ providedIn: 'root' })
export class AlbumService {
  constructor(private http: HttpClient) {}

  listAlbums(): Observable<Album[]> {
    return this.http.get<{ albums: Album[] }>(`${API_BASE}/api/albums`).pipe(map((r) => r.albums));
  }

  getAlbum(id: number): Observable<Album> {
    return this.http.get<{ album: Album }>(`${API_BASE}/api/albums/${id}`).pipe(map((r) => r.album));
  }

  createAlbum(data: { name: string; eventDate?: string; description?: string }): Observable<Album> {
    return this.http.post<{ album: Album }>(`${API_BASE}/api/albums`, data).pipe(map((r) => r.album));
  }

  updateAlbum(id: number, data: Partial<Pick<Album, 'name' | 'eventDate' | 'description'>>): Observable<Album> {
    return this.http.patch<{ album: Album }>(`${API_BASE}/api/albums/${id}`, data).pipe(map((r) => r.album));
  }

  deleteAlbum(id: number): Observable<unknown> {
    return this.http.delete(`${API_BASE}/api/albums/${id}`);
  }

  listPhotos(albumId: number): Observable<Photo[]> {
    return this.http.get<{ photos: Photo[] }>(`${API_BASE}/api/albums/${albumId}/photos`).pipe(map((r) => r.photos));
  }

  uploadPhotos(albumId: number, files: FileList | File[]): Observable<{ uploaded: Photo[] }> {
    const form = new FormData();
    Array.from(files).forEach((f) => form.append('files', f));
    return this.http.post<{ uploaded: Photo[] }>(`${API_BASE}/api/albums/${albumId}/photos`, form);
  }

  setCover(photoId: number): Observable<{ photo: Photo }> {
    return this.http.patch<{ photo: Photo }>(`${API_BASE}/api/photos/${photoId}`, { isCover: true });
  }

  deletePhoto(photoId: number): Observable<unknown> {
    return this.http.delete(`${API_BASE}/api/photos/${photoId}`);
  }
}
