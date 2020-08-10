import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable()
export class CropImageService {
    constructor() { }
    compress(file: File, customWidth?: number, customHeight?: number): Observable<any> {
        let height = 0;
        let width = 0;
        const reader = new FileReader();
        reader.readAsDataURL(file);
        return Observable.create(observer => {
            reader.onload = ev => {
                const img = new Image();
                img.src = (ev.target as any).result;
                (img.onload = () => {
                    const elem = document.createElement('canvas'); // Use Angular's Renderer2 method
                    width = customWidth ? customWidth : img.width * customHeight / img.height > 0 ? img.width * customHeight / img.height : elem.width;
                    height = customHeight ? customHeight : img.height * customWidth / img.width > 0 ? img.height * customWidth / img.width : elem.height;

                    elem.width = width;
                    elem.height = height;
                    const ctx = <CanvasRenderingContext2D>elem.getContext('2d');
                                            
                    ctx.fillStyle = '#fff';  /// set white fill style
                    ctx.fillRect(0, 0, elem.width, elem.height);
                    ctx.drawImage(img, 0, 0, width, height);
                    ctx.canvas.toBlob(
                        blob => {
                            observer.next(
                                new File([blob], file.name, {
                                    type: 'image/jpeg',
                                    lastModified: Date.now(),
                                })
                            );
                        },
                        'image/jpeg',
                        1,
                    );
                }),
                    (reader.onerror = error => observer.error(error));
            };
        });
    }
}