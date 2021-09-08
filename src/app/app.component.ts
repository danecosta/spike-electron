import { Component, OnInit } from '@angular/core';
import { IpcRenderer } from 'electron';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'spike-electron';
  private ipc: IpcRenderer
  private fs: any
  private path: any
  private shell: any

  private currentPath: string;
  entries: Array<string>;

  constructor() {
    if ((<any>window).require) {
      try {
        this.ipc = (<any>window).require('electron').ipcRenderer;
        this.shell = (<any>window).require('electron').shell
        this.fs = (<any>window).require("fs");
        this.path = (<any>window).require("path");
      } catch (e) {
        throw e;
      }
    } else {
      console.warn('App not running inside Electron!');
    }
  }

  ngOnInit() {
    this.currentPath = process.cwd();
    this.updateEntries();
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

  openFile(path: string) {
    console.log("Open file");
    this.shell.openPath(path);
    return
  }

  openModal() {
    console.log("Open a modal");
    this.ipc.send("openModal");
  }

  newFile() {
    console.log("New file");

    let newFile = this.fs.createWriteStream('newFile.txt')
    newFile.write('Conteudo do novo arquivo');

    this.updateEntries();
  }

  renameFile(path: string) {
    console.log("Rename file");
    console.log(path);

    this.fs.rename(path, 'newFile.txt', (err: Error) => {
      if (err) throw err;
      console.log('Rename complete!');
    });

    this.updateEntries();
  }

  deleteFile(path: string) {
    console.log("Delete file");
    console.log(path);

    this.fs.unlink(path, (err: Error) => {
      if (err) throw err;
      console.log(path + ' was deleted');
    });

    this.updateEntries();
  }
}
