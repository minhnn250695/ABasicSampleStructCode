import { Directive, HostListener, HostBinding, Input, Output, EventEmitter } from '@angular/core';

@Directive({
  selector: '[ff-DnDFile]'
})

export class DragAndDropFileDirectiveDirective {

  constructor() { }

  @HostBinding('style.background') private background = '#fff';

  @Output() onFilesChanged : EventEmitter<File> = new EventEmitter();

  @HostListener('dragover', ['$event']) public onDragOver(evt){
    evt.preventDefault();
    evt.stopPropagation();
    this.background = '#999';
  }

  @HostListener('dragleave', ['$event']) public onDragLeave(evt){
    evt.preventDefault();
    evt.stopPropagation();
    this.background = '#fff'
  }

  @HostListener('drop', ['$event']) public onDrop(evt){
    evt.preventDefault();
    evt.stopPropagation();
    this.background = '#fff';
    let files: FileList = evt.dataTransfer.files;
    
    if(files.length == 1){
      let file: File = files[0]
      let fileExt = this.getFileExtension(file.name)
      this.onFilesChanged.emit(file);
    }
  }


  private getFileExtension(file: string) : string {
    var index = file.lastIndexOf(".");
    var extension = file.substring(index + 1);
    return extension;
  }
}
