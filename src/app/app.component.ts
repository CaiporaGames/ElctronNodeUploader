import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IpcRenderer } from 'electron';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  file:any;
  private ipc: IpcRenderer | undefined;

  constructor(private http: HttpClient)
  {
    if ((<any>window).require) {
      try {
        this.ipc = (<any>window).require('electron').ipcRenderer;
      } catch (e) {
        console.error(e);
        throw e;
      }
    } else {
      console.warn('App not running inside Electron!');
    }
  }
  upload(event:any)
  {
    this.file = event.target.files

  }

  sendFile()
  {
    const formData = new FormData()
    for(let i=0; i < this.file.length; i++)
    {
      formData.append('file',this.file[i])
    }
    this.http.post('http://localhost:5000/audioUploader', formData).subscribe
    (res => {})
  }

  //electron
  uploadFiles(fileInputEvent: any)
  {
    let paths = []
    for(let i=0; i < fileInputEvent.target.files.length; i++)
    {
      paths.push(fileInputEvent.target.files[i].path)
    }

    this.ipc!.send("uploadCharacter", paths);
  }
}
