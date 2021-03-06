import { Directive, HostListener, HostBinding, Input, Output, EventEmitter, OnInit } from '@angular/core';

@Directive({
  selector: '[fp-DnDFile]'
})

export class DragAndDropFileDirectiveDirective implements OnInit {

  constructor() { }

  ngOnInit() {
    if (this.defaultBackground) this.background = this.defaultBackground;
  }

  @Input() defaultBackground: string;
  @HostBinding('style.background') private background = '#fff';

  @Output() onFilesChanged : EventEmitter<File> = new EventEmitter();

  @HostListener('dragover', ['$event']) public onDragOver(evt){
    evt.preventDefault();
    evt.stopPropagation();
    this.background = '#ccc';
  }

  @HostListener('dragleave', ['$event']) public onDragLeave(evt){
    evt.preventDefault();
    evt.stopPropagation();
    this.background = this.defaultBackground
  }

  @HostListener('drop', ['$event']) public onDrop(evt){
    evt.preventDefault();
    evt.stopPropagation();
    this.background =this.defaultBackground;
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
