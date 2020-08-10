import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { BaseComponentComponent } from '../base-component';

declare var $: any;
@Component({
    selector: 'crop-image',
    templateUrl: './crop-image.component.html',
    styleUrls: ['./crop-image.component.css']
})
export class CropImageComponent extends BaseComponentComponent implements OnInit {
    @Output('croppedImage') croppedImage: EventEmitter<any> = new EventEmitter();
    @Input() customWidth: number;
    @Input() customHeight: number;
    cropObject: any;
    profileImage: File;

    constructor() {
        super();
    }

    ngOnInit() {
        this.checkUsingMobile();
        this.initCropImage();
    }

    private initCropImage() {
        if (!this.cropObject) {
            var cropWidth: number,
                cropHeight: number,
                boundarySize: number,
                cropType: string;

            if (this.isMobile) {
                cropWidth = 150;
                cropHeight = 150;
                boundarySize = 200;
                cropType = "square";
            }
            else {
                cropWidth = this.customWidth ? this.customWidth : 250;
                cropHeight = this.customHeight ? this.customHeight : 250;
                boundarySize = 300;
                cropType = "square";
            }
            this.cropObject = $('#upload-demo').croppie({
                viewport: {
                    // set custom width and height if receive value from input
                    width: cropWidth,
                    height: cropHeight,
                    type: cropType
                },
                boundary: {
                    width: boundarySize,
                    height: boundarySize
                },
                enableExif: true
            });

            $('#cropImagePop').on('shown.bs.modal', () => {
                // alert('Shown pop');
                this.cropObject.croppie('bind', {
                    url: this.profileImage,
                });
            });
        }
    }

    /**
     * Show crop tool with uploaded image.
     * @param image - image to crop.
     */
    showCropTool(image: any) {
        if (image) {
            const reader = new FileReader();
            reader.onload = (e: any) => {
                this.profileImage = e.target.result;
                $('#cropImagePop').modal('show');
            }
            reader.readAsDataURL(image);
        }
    }

    /**
     * Emit base64 `image` after crop.
     */
    btnCropClick() {
        let resultObj: any;
        if (this.customHeight && this.customWidth) {
            // resize image to 150 and 50 pixels
            resultObj = {
                type: 'base64',
                size: {
                    width: 150,
                    height: 50
                }
            }
        } else {
            resultObj = {
                type: 'base64'
            }
        }

        this.cropObject.croppie('result', resultObj).then((base64) => {
            this.croppedImage.emit(base64);
        });

        $("#cropImagePop").modal("hide");
    }
}
