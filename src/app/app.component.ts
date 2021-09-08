import { Component } from '@angular/core';
import { IpcRenderer } from 'electron';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'spike-electron';
  private ipc: IpcRenderer
  private fs: any
  private path: any

  private currentPath: string = process.cwd();
  entries: Array<string>;

  constructor() {
    if ((<any>window).require) {
      try {
        this.ipc = (<any>window).require('electron').ipcRenderer;
        this.fs = (<any>window).require("fs");
        this.path = (<any>window).require("path");
      } catch (e) {
        throw e;
      }
    } else {
      console.warn('App not running inside Electron!');
    }

    this.updateEntries();
  }

  openModal() {
    console.log("Open a modal");
    this.ipc.send("openModal");
  }

  private updateEntries() {
    this.fs.readdir(this.currentPath, (err: Error, files: [string]) => {
      if (err) {
        console.error(err);
      }
      this.entries = ['../'].concat(files);
    });
  }

  public changeDir(newDir: string) {
    const targetPath = this.path.resolve(this.currentPath, newDir);
    console.log("old path " + this.currentPath)
    console.log("new path" + targetPath)
    this.fs.stat(targetPath, (err: Error, stats: any) => {
      if (err) {
        console.error(err);
      } else {
        if (stats.isFile()) {
          this.openFile(targetPath);
        } else if (stats.isDirectory()) {
          this.currentPath = targetPath;
          this.updateEntries();
        } else {
          console.error(new Error(`Unknown file system object: ${targetPath}`));
        }
      }
    });
  }

  public openFile(path: string) {
    console.log("Open file");
    this.fs.shell.openItem(path);
    return
  }
}
