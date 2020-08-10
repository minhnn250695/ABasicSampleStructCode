import { Component, OnInit } from '@angular/core';
declare var jquery: any;
declare var $: any;

@Component({
  selector: 'progress-bar',
  templateUrl: './progress-bar.component.html',
  styleUrls: ['./progress-bar.component.css']
})

export class ProgressBarComponent implements OnInit {

  ngOnInit() {
    this.runLoading();
  }

  runLoading() {    
    var elem = document.getElementById("myBar");   
    var width = 1;
    var id = setInterval(frame, 250);

    function frame() {
      if (width >= 101) {
        clearInterval(id);
        resetFunction();
      } else {
        width++; 
        elem.style.width = width + '%'; 
      }
    };

    function resetFunction() {
      $('#myBar').addClass('progress-bar-striped active');
    }
  }

  removeLoading(){
    $('#myProgress').remove();
  }
  
}